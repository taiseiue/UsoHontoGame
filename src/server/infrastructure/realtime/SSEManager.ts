import type {
  FullStateSyncEvent,
  GameStateUpdateEvent,
  HeartbeatEvent,
  ScoreChangeEvent,
  SSEEventData,
  TimerTickEvent,
} from '@/types/events';
import { SSEEventType, serializeSSEEvent } from '@/types/events';

/**
 * SSE client connection
 */
interface SSEClient {
  /** Client ID */
  id: string;
  /** Session ID this client is subscribed to */
  sessionId: string;
  /** Response stream controller */
  controller: ReadableStreamDefaultController;
  /** Connection timestamp */
  connectedAt: Date;
  /** Last heartbeat sent timestamp */
  lastHeartbeat: Date;
}

/**
 * SSE Manager for handling real-time updates via Server-Sent Events
 *
 * This class manages:
 * - Client connections and subscriptions
 * - Event broadcasting to connected clients
 * - Heartbeat mechanism to keep connections alive
 * - Automatic cleanup of stale connections
 */
export class SSEManager {
  private clients: Map<string, SSEClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds
  private readonly CONNECTION_TIMEOUT_MS = 120000; // 2 minutes

  constructor() {
    this.startHeartbeat();
  }

  /**
   * Register a new SSE client connection
   *
   * @param clientId - Unique client identifier
   * @param sessionId - Session ID the client is subscribing to
   * @param controller - ReadableStream controller for sending events
   */
  addClient(
    clientId: string,
    sessionId: string,
    controller: ReadableStreamDefaultController
  ): void {
    const now = new Date();
    this.clients.set(clientId, {
      id: clientId,
      sessionId,
      controller,
      connectedAt: now,
      lastHeartbeat: now,
    });

    console.log(`[SSEManager] Client ${clientId} connected to session ${sessionId}`);
  }

  /**
   * Remove a client connection
   *
   * @param clientId - Client identifier to remove
   */
  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      try {
        client.controller.close();
      } catch (error) {
        console.error(`[SSEManager] Error closing client ${clientId}:`, error);
      }
      this.clients.delete(clientId);
      console.log(`[SSEManager] Client ${clientId} disconnected`);
    }
  }

  /**
   * Get all clients subscribed to a specific session
   *
   * @param sessionId - Session ID to filter clients
   * @returns Array of clients subscribed to the session
   */
  private getSessionClients(sessionId: string): SSEClient[] {
    return Array.from(this.clients.values()).filter((client) => client.sessionId === sessionId);
  }

  /**
   * Send an event to a specific client
   *
   * @param client - Client to send event to
   * @param eventType - Type of event
   * @param data - Event data
   */
  private sendToClient(client: SSEClient, eventType: string, data: SSEEventData): void {
    try {
      const eventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const message = serializeSSEEvent(eventType, data, eventId);
      const encoder = new TextEncoder();
      client.controller.enqueue(encoder.encode(message));
    } catch (error) {
      console.error(`[SSEManager] Error sending event to client ${client.id}:`, error);
      this.removeClient(client.id);
    }
  }

  /**
   * Broadcast game state update to all clients in a session
   *
   * @param sessionId - Session ID to broadcast to
   * @param data - Game state update event data
   */
  broadcastGameStateUpdate(sessionId: string, data: GameStateUpdateEvent): void {
    const clients = this.getSessionClients(sessionId);
    console.log(
      `[SSEManager] Broadcasting game-state-update to ${clients.length} clients in session ${sessionId}`
    );

    for (const client of clients) {
      this.sendToClient(client, SSEEventType.GAME_STATE_UPDATE, data);
    }
  }

  /**
   * Broadcast score change to all clients in a session
   *
   * @param sessionId - Session ID to broadcast to
   * @param data - Score change event data
   */
  broadcastScoreChange(sessionId: string, data: ScoreChangeEvent): void {
    const clients = this.getSessionClients(sessionId);
    console.log(
      `[SSEManager] Broadcasting score-change to ${clients.length} clients in session ${sessionId}`
    );

    for (const client of clients) {
      this.sendToClient(client, SSEEventType.SCORE_CHANGE, data);
    }
  }

  /**
   * Broadcast timer tick to all clients in a session
   *
   * @param sessionId - Session ID to broadcast to
   * @param data - Timer tick event data
   */
  broadcastTimerTick(sessionId: string, data: TimerTickEvent): void {
    const clients = this.getSessionClients(sessionId);

    for (const client of clients) {
      this.sendToClient(client, SSEEventType.TIMER_TICK, data);
    }
  }

  /**
   * Send full state sync to a specific client (usually on initial connection)
   *
   * @param clientId - Client ID to send sync to
   * @param data - Full state sync event data
   */
  sendFullStateSync(clientId: string, data: FullStateSyncEvent): void {
    const client = this.clients.get(clientId);
    if (client) {
      console.log(`[SSEManager] Sending full-state-sync to client ${clientId}`);
      this.sendToClient(client, SSEEventType.FULL_STATE_SYNC, data);
    }
  }

  /**
   * Start periodic heartbeat mechanism
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      return;
    }

    this.heartbeatInterval = setInterval(() => {
      const now = new Date();
      const heartbeatData: HeartbeatEvent = {
        timestamp: now.toISOString(),
      };

      for (const client of this.clients.values()) {
        // Check if client connection has timed out
        const timeSinceLastHeartbeat = now.getTime() - client.lastHeartbeat.getTime();
        if (timeSinceLastHeartbeat > this.CONNECTION_TIMEOUT_MS) {
          console.log(`[SSEManager] Client ${client.id} timed out, removing`);
          this.removeClient(client.id);
          continue;
        }

        // Send heartbeat
        try {
          this.sendToClient(client, SSEEventType.HEARTBEAT, heartbeatData);
          client.lastHeartbeat = now;
        } catch (error) {
          console.error(`[SSEManager] Failed to send heartbeat to client ${client.id}:`, error);
          this.removeClient(client.id);
        }
      }

      console.log(`[SSEManager] Heartbeat sent to ${this.clients.size} clients`);
    }, this.HEARTBEAT_INTERVAL_MS);

    console.log('[SSEManager] Heartbeat mechanism started');
  }

  /**
   * Stop heartbeat mechanism and clean up all connections
   */
  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Close all client connections
    for (const client of this.clients.values()) {
      try {
        client.controller.close();
      } catch (error) {
        console.error(`[SSEManager] Error closing client ${client.id} during shutdown:`, error);
      }
    }

    this.clients.clear();
    console.log('[SSEManager] Shutdown complete');
  }

  /**
   * Get current connection statistics
   */
  getStats(): {
    totalClients: number;
    clientsBySession: Record<string, number>;
  } {
    const clientsBySession: Record<string, number> = {};

    for (const client of this.clients.values()) {
      clientsBySession[client.sessionId] = (clientsBySession[client.sessionId] || 0) + 1;
    }

    return {
      totalClients: this.clients.size,
      clientsBySession,
    };
  }
}

// Singleton instance
let sseManagerInstance: SSEManager | null = null;

/**
 * Get the singleton SSEManager instance
 */
export function getSSEManager(): SSEManager {
  if (!sseManagerInstance) {
    sseManagerInstance = new SSEManager();
  }
  return sseManagerInstance;
}

/**
 * Shutdown the SSEManager singleton (mainly for testing)
 */
export function shutdownSSEManager(): void {
  if (sseManagerInstance) {
    sseManagerInstance.shutdown();
    sseManagerInstance = null;
  }
}
