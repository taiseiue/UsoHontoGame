import { useCallback, useEffect, useState } from 'react';
import type {
  FullStateSyncEvent,
  GameStateUpdateEvent,
  ScoreChangeEvent,
  SSEEvent,
  TimerTickEvent,
} from '@/types/events';
import { SSEEventType } from '@/types/events';
import type { ConnectionStatus } from './useSSEConnection';
import { useSSEConnection } from './useSSEConnection';

interface GameState {
  sessionId: string;
  phase: 'preparation' | 'presentation' | 'voting' | 'reveal' | 'completed';
  currentTurnId: string | null;
  currentPresentingTeamId: string | null;
  teams: Array<{
    id: string;
    name: string;
    score: number;
  }>;
  participants: Array<{
    id: string;
    nickname: string;
    teamId: string | null;
    role: 'host' | 'player';
  }>;
  currentTurn?: {
    id: string;
    presentingTeamId: string;
    episodeNumber: number;
    remainingSeconds: number;
  } | null;
  lastUpdate: string;
}

interface UseRealTimeSyncOptions {
  /** Session ID to sync with */
  sessionId: string;
  /** Callback when game state is updated */
  onGameStateUpdate?: (state: GameStateUpdateEvent) => void;
  /** Callback when team score changes */
  onScoreChange?: (score: ScoreChangeEvent) => void;
  /** Callback when timer ticks */
  onTimerTick?: (timer: TimerTickEvent) => void;
  /** Callback when full state sync is received */
  onFullStateSync?: (state: FullStateSyncEvent) => void;
  /** Enable automatic reconnection */
  enableReconnect?: boolean;
}

interface UseRealTimeSyncReturn {
  /** Current game state */
  gameState: GameState | null;
  /** Connection status */
  connectionStatus: ConnectionStatus;
  /** Whether currently syncing state */
  isSyncing: boolean;
  /** Error if any */
  error: Error | null;
  /** Manually trigger reconnection */
  reconnect: () => void;
  /** Disconnect from real-time sync */
  disconnect: () => void;
}

/**
 * Hook for real-time game state synchronization via SSE
 *
 * Provides:
 * - Automatic state synchronization
 * - Game state updates (phase changes, turn changes)
 * - Score updates
 * - Timer ticks
 * - Reconnection on network interruption
 * - Full state resync on reconnection
 */
export function useRealTimeSync(options: UseRealTimeSyncOptions): UseRealTimeSyncReturn {
  const {
    sessionId,
    onGameStateUpdate,
    onScoreChange,
    onTimerTick,
    onFullStateSync,
    enableReconnect = true,
  } = options;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);

  /**
   * Handle full state sync event
   */
  const handleFullStateSync = useCallback(
    (event: SSEEvent) => {
      const data = event.data as FullStateSyncEvent;
      console.log('[useRealTimeSync] Received full state sync:', data);

      setGameState({
        sessionId: data.sessionId,
        phase: data.session.phase,
        currentTurnId: data.session.currentTurnId,
        currentPresentingTeamId: data.currentTurn?.presentingTeamId ?? null,
        teams: data.teams,
        participants: data.participants,
        currentTurn: data.currentTurn,
        lastUpdate: data.timestamp,
      });
      setIsSyncing(false);

      onFullStateSync?.(data);
    },
    [onFullStateSync]
  );

  /**
   * Handle game state update event
   */
  const handleGameStateUpdate = useCallback(
    (event: SSEEvent) => {
      const data = event.data as GameStateUpdateEvent;
      console.log('[useRealTimeSync] Game state updated:', data);

      setGameState((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          phase: data.phase,
          currentTurnId: data.currentTurnId,
          currentPresentingTeamId: data.currentPresentingTeamId,
          lastUpdate: data.timestamp,
        };
      });

      onGameStateUpdate?.(data);
    },
    [onGameStateUpdate]
  );

  /**
   * Handle score change event
   */
  const handleScoreChange = useCallback(
    (event: SSEEvent) => {
      const data = event.data as ScoreChangeEvent;
      console.log('[useRealTimeSync] Score changed:', data);

      setGameState((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          teams: prev.teams.map((team) =>
            team.id === data.teamId ? { ...team, score: data.newScore } : team
          ),
          lastUpdate: data.timestamp,
        };
      });

      onScoreChange?.(data);
    },
    [onScoreChange]
  );

  /**
   * Handle timer tick event
   */
  const handleTimerTick = useCallback(
    (event: SSEEvent) => {
      const data = event.data as TimerTickEvent;

      setGameState((prev) => {
        if (!prev || !prev.currentTurn) return prev;

        return {
          ...prev,
          currentTurn: {
            ...prev.currentTurn,
            remainingSeconds: data.remainingSeconds,
          },
          lastUpdate: data.timestamp,
        };
      });

      onTimerTick?.(data);
    },
    [onTimerTick]
  );

  /**
   * Handle connection established
   */
  const handleConnect = useCallback(() => {
    console.log('[useRealTimeSync] Connected to real-time sync');
    setIsSyncing(true);
  }, []);

  /**
   * Handle connection lost
   */
  const handleDisconnect = useCallback(() => {
    console.log('[useRealTimeSync] Disconnected from real-time sync');
  }, []);

  /**
   * Handle connection error
   */
  const handleError = useCallback((error: Error) => {
    console.error('[useRealTimeSync] Connection error:', error);
    setIsSyncing(false);
  }, []);

  // Establish SSE connection
  const { status, error, connect, disconnect, subscribe } = useSSEConnection({
    sessionId,
    autoConnect: true,
    enableReconnect,
    maxReconnectAttempts: 0, // infinite retries
    initialReconnectDelay: 1000, // 1 second
    maxReconnectDelay: 30000, // 30 seconds
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onError: handleError,
  });

  // Subscribe to events
  useEffect(() => {
    const unsubscribeFns: Array<() => void> = [];

    // Subscribe to full state sync
    unsubscribeFns.push(subscribe(SSEEventType.FULL_STATE_SYNC, handleFullStateSync));

    // Subscribe to game state updates
    unsubscribeFns.push(subscribe(SSEEventType.GAME_STATE_UPDATE, handleGameStateUpdate));

    // Subscribe to score changes
    unsubscribeFns.push(subscribe(SSEEventType.SCORE_CHANGE, handleScoreChange));

    // Subscribe to timer ticks
    unsubscribeFns.push(subscribe(SSEEventType.TIMER_TICK, handleTimerTick));

    // Cleanup subscriptions on unmount
    return () => {
      for (const unsubscribe of unsubscribeFns) {
        unsubscribe();
      }
    };
  }, [subscribe, handleFullStateSync, handleGameStateUpdate, handleScoreChange, handleTimerTick]);

  return {
    gameState,
    connectionStatus: status,
    isSyncing,
    error,
    reconnect: connect,
    disconnect,
  };
}
