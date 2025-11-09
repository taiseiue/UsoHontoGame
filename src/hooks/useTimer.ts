'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseTimerOptions {
  /** Initial duration in seconds */
  initialSeconds: number;
  /** Whether to start automatically */
  autoStart?: boolean;
  /** Callback when timer reaches zero */
  onComplete?: () => void;
  /** Callback on each tick */
  onTick?: (remainingSeconds: number) => void;
  /** Enable server synchronization */
  serverSync?: boolean;
  /** Server time endpoint for sync */
  serverTimeEndpoint?: string;
}

export interface UseTimerReturn {
  /** Remaining seconds */
  remainingSeconds: number;
  /** Whether timer is running */
  isRunning: boolean;
  /** Whether timer is completed */
  isCompleted: boolean;
  /** Start the timer */
  start: () => void;
  /** Pause the timer */
  pause: () => void;
  /** Reset to initial duration */
  reset: () => void;
  /** Set remaining seconds manually */
  setRemaining: (seconds: number) => void;
  /** Sync with server time */
  syncWithServer: () => Promise<void>;
}

/**
 * useTimer hook - Manages countdown timer with optional server synchronization
 *
 * Features:
 * - Client-side countdown with 1-second intervals
 * - Optional server synchronization for authoritative time
 * - Callbacks for completion and tick events
 * - Start/pause/reset controls
 */
export function useTimer(options: UseTimerOptions): UseTimerReturn {
  const {
    initialSeconds,
    autoStart = false,
    onComplete,
    onTick,
    serverSync = false,
    serverTimeEndpoint,
  } = options;

  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const serverOffsetRef = useRef<number>(0);

  /**
   * Sync with server time to get authoritative timestamp
   */
  const syncWithServer = useCallback(async () => {
    if (!serverSync || !serverTimeEndpoint) return;

    try {
      const clientStart = Date.now();
      const response = await fetch(serverTimeEndpoint);
      const clientEnd = Date.now();

      if (response.ok) {
        const { serverTime } = await response.json();
        const roundTripTime = clientEnd - clientStart;
        const serverTimeAdjusted = serverTime + roundTripTime / 2;
        serverOffsetRef.current = serverTimeAdjusted - clientEnd;

        console.log(
          `[useTimer] Server sync complete. Offset: ${serverOffsetRef.current}ms`
        );
      }
    } catch (error) {
      console.error('[useTimer] Failed to sync with server:', error);
    }
  }, [serverSync, serverTimeEndpoint]);

  /**
   * Get current time (with server offset if synced)
   */
  const getCurrentTime = useCallback((): number => {
    return Date.now() + serverOffsetRef.current;
  }, []);

  /**
   * Start the timer
   */
  const start = useCallback(() => {
    if (isCompleted) return;

    setIsRunning(true);
    startTimeRef.current = getCurrentTime();
  }, [isCompleted, getCurrentTime]);

  /**
   * Pause the timer
   */
  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Reset the timer
   */
  const reset = useCallback(() => {
    setIsRunning(false);
    setIsCompleted(false);
    setRemainingSeconds(initialSeconds);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [initialSeconds]);

  /**
   * Set remaining seconds manually
   */
  const setRemaining = useCallback((seconds: number) => {
    setRemainingSeconds(Math.max(0, seconds));
    if (seconds === 0) {
      setIsCompleted(true);
      setIsRunning(false);
    }
  }, []);

  // Timer tick effect
  useEffect(() => {
    if (!isRunning || isCompleted) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Update timer every second
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newValue = prev - 1;

        // Call onTick callback
        if (onTick) {
          onTick(newValue);
        }

        // Check if completed
        if (newValue <= 0) {
          setIsCompleted(true);
          setIsRunning(false);

          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          // Call onComplete callback
          if (onComplete) {
            onComplete();
          }

          return 0;
        }

        return newValue;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isCompleted, onComplete, onTick]);

  // Initial server sync
  useEffect(() => {
    if (serverSync && serverTimeEndpoint) {
      syncWithServer();
    }
  }, [serverSync, serverTimeEndpoint, syncWithServer]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && !isRunning && !isCompleted) {
      start();
    }
  }, []); // Only run on mount

  return {
    remainingSeconds,
    isRunning,
    isCompleted,
    start,
    pause,
    reset,
    setRemaining,
    syncWithServer,
  };
}
