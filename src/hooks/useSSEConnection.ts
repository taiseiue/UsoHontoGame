import { useCallback, useEffect, useRef, useState } from 'react';
import type { SSEEvent } from '@/types/events';
import { parseSSEEvent } from '@/types/events';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseSSEConnectionOptions {
  /** Session ID to connect to */
  sessionId: string;
  /** Whether to automatically connect on mount */
  autoConnect?: boolean;
  /** Enable reconnection on connection loss */
  enableReconnect?: boolean;
  /** Maximum number of reconnection attempts (0 = infinite) */
  maxReconnectAttempts?: number;
  /** Initial reconnect delay in milliseconds */
  initialReconnectDelay?: number;
  /** Maximum reconnect delay in milliseconds */
  maxReconnectDelay?: number;
  /** Callback when connection is established */
  onConnect?: () => void;
  /** Callback when connection is lost */
  onDisconnect?: () => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}

interface UseSSEConnectionReturn {
  /** Current connection status */
  status: ConnectionStatus;
  /** Error if connection failed */
  error: Error | null;
  /** Manually connect to SSE endpoint */
  connect: () => void;
  /** Manually disconnect from SSE endpoint */
  disconnect: () => void;
  /** Subscribe to a specific event type */
  subscribe: (eventType: string, handler: (event: SSEEvent) => void) => () => void;
}

/**
 * Hook for establishing and managing SSE connections
 *
 * Handles:
 * - SSE connection lifecycle
 * - Automatic reconnection with exponential backoff
 * - Event subscription management
 * - Connection status tracking
 */
export function useSSEConnection(options: UseSSEConnectionOptions): UseSSEConnectionReturn {
  const {
    sessionId,
    autoConnect = true,
    enableReconnect = true,
    maxReconnectAttempts = 0, // infinite by default
    initialReconnectDelay = 1000,
    maxReconnectDelay = 30000,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>(
    autoConnect ? 'connecting' : 'disconnected'
  );
  const [error, setError] = useState<Error | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectDelayRef = useRef(initialReconnectDelay);
  const eventHandlersRef = useRef<Map<string, Set<(event: SSEEvent) => void>>>(new Map());
  const isManualDisconnectRef = useRef(false);

  /**
   * Subscribe to a specific event type
   */
  const subscribe = useCallback((eventType: string, handler: (event: SSEEvent) => void) => {
    if (!eventHandlersRef.current.has(eventType)) {
      eventHandlersRef.current.set(eventType, new Set());
    }
    eventHandlersRef.current.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = eventHandlersRef.current.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          eventHandlersRef.current.delete(eventType);
        }
      }
    };
  }, []);

  /**
   * Handle incoming SSE messages
   */
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      // Parse SSE event
      const parsedEvent = parseSSEEvent(`event: ${event.type}\ndata: ${event.data}`);

      if (!parsedEvent) {
        console.warn('[useSSEConnection] Failed to parse SSE event:', event);
        return;
      }

      // Dispatch to registered handlers
      const handlers = eventHandlersRef.current.get(parsedEvent.event);
      if (handlers) {
        for (const handler of handlers) {
          handler(parsedEvent);
        }
      }
    } catch (err) {
      console.error('[useSSEConnection] Error handling message:', err);
    }
  }, []);

  /**
   * Connect to SSE endpoint
   */
  const connect = useCallback(() => {
    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Clear manual disconnect flag
    isManualDisconnectRef.current = false;

    setStatus('connecting');
    setError(null);

    try {
      const eventSource = new EventSource(`/api/sessions/${sessionId}/events`);
      eventSourceRef.current = eventSource;

      // Handle connection open
      eventSource.onopen = () => {
        console.log('[useSSEConnection] Connection established');
        setStatus('connected');
        reconnectAttemptsRef.current = 0;
        reconnectDelayRef.current = initialReconnectDelay;
        onConnect?.();
      };

      // Handle connection errors
      eventSource.onerror = (event) => {
        console.error('[useSSEConnection] Connection error:', event);

        // Check if we should reconnect
        if (
          !isManualDisconnectRef.current &&
          enableReconnect &&
          (maxReconnectAttempts === 0 || reconnectAttemptsRef.current < maxReconnectAttempts)
        ) {
          setStatus('connecting');
          eventSource.close();

          // Schedule reconnection with exponential backoff
          const delay = reconnectDelayRef.current;
          console.log(
            `[useSSEConnection] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, maxReconnectDelay);
            connect();
          }, delay);
        } else {
          setStatus('error');
          const err = new Error('Failed to establish SSE connection');
          setError(err);
          onError?.(err);
          onDisconnect?.();
        }
      };

      // Register event listeners for all subscribed event types
      for (const eventType of eventHandlersRef.current.keys()) {
        eventSource.addEventListener(eventType, handleMessage);
      }

      // Also listen for generic messages
      eventSource.onmessage = handleMessage;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown connection error');
      console.error('[useSSEConnection] Connection error:', error);
      setStatus('error');
      setError(error);
      onError?.(error);
    }
  }, [
    sessionId,
    enableReconnect,
    maxReconnectAttempts,
    initialReconnectDelay,
    maxReconnectDelay,
    onConnect,
    onDisconnect,
    onError,
    handleMessage,
  ]);

  /**
   * Disconnect from SSE endpoint
   */
  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;

    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setStatus('disconnected');
    reconnectAttemptsRef.current = 0;
    reconnectDelayRef.current = initialReconnectDelay;
    onDisconnect?.();
  }, [initialReconnectDelay, onDisconnect]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]); // Empty deps - only run on mount/unmount

  // Update event listeners when subscriptions change
  useEffect(() => {
    const eventSource = eventSourceRef.current;
    if (!eventSource) return;

    // Re-register all event listeners
    for (const eventType of eventHandlersRef.current.keys()) {
      eventSource.addEventListener(eventType, handleMessage);
    }

    return () => {
      // Cleanup listeners
      for (const eventType of eventHandlersRef.current.keys()) {
        eventSource.removeEventListener(eventType, handleMessage);
      }
    };
  }, [handleMessage]);

  return {
    status,
    error,
    connect,
    disconnect,
    subscribe,
  };
}
