/**
 * useGameStatus Hook
 * Feature: 004-status-transition
 * Manages game status transitions with optimistic updates
 */

'use client';

import { useCallback, useRef, useState } from 'react';
import { closeGameAction, startGameAction } from '@/app/actions/game';
import type { GameStatusValue } from '@/server/domain/value-objects/GameStatus';

export interface UseGameStatusOptions {
  gameId: string;
  initialStatus: GameStatusValue;
  onSuccess?: (newStatus: GameStatusValue) => void;
  onError?: (error: string) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export interface UseGameStatusReturn {
  currentStatus: GameStatusValue;
  isLoading: boolean;
  canStart: boolean;
  canClose: boolean;
  startGame: () => Promise<void>;
  closeGame: () => Promise<void>;
  resetStatus: () => void;
  retryCount: number;
  isRetrying: boolean;
}

/**
 * Hook for managing game status transitions with optimistic updates
 */
export function useGameStatus({
  gameId,
  initialStatus,
  onSuccess,
  onError,
  enableRetry = true,
  maxRetries = 2,
  retryDelay = 1000,
}: UseGameStatusOptions): UseGameStatusReturn {
  const [currentStatus, setCurrentStatus] = useState<GameStatusValue>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate what transitions are available
  const canStart = currentStatus === '準備中';
  const canClose = currentStatus === '出題中';

  const executeWithRetry = useCallback(
    async (
      action: () => Promise<{ success: boolean; errors?: Record<string, string[]> }>,
      targetStatus: GameStatusValue,
      operation: 'start' | 'close',
      attempt = 0
    ): Promise<void> => {
      const previousStatus = currentStatus;

      if (attempt === 0) {
        // First attempt - set optimistic update
        setCurrentStatus(targetStatus);
        setRetryCount(0);
      } else {
        setIsRetrying(true);
        setRetryCount(attempt);
        // Wait for retry delay
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }

      try {
        const result = await action();

        if (result.success) {
          setIsRetrying(false);
          setRetryCount(0);
          onSuccess?.(targetStatus);
          return;
        } else {
          throw new Error(
            result.errors._form?.[0] ||
              `ゲームの${operation === 'start' ? '開始' : '締切'}に失敗しました`
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `ゲームの${operation === 'start' ? '開始' : '締切'}に失敗しました`;

        // Check if we should retry
        if (enableRetry && attempt < maxRetries) {
          return executeWithRetry(action, targetStatus, operation, attempt + 1);
        } else {
          // All retries exhausted or retries disabled
          setCurrentStatus(previousStatus); // Rollback optimistic update
          setIsRetrying(false);
          setRetryCount(0);
          onError?.(attempt > 0 ? `${errorMessage}（${attempt + 1}回試行後）` : errorMessage);
        }
      }
    },
    [currentStatus, enableRetry, maxRetries, retryDelay, onSuccess, onError]
  );

  const startGame = useCallback(async () => {
    if (isLoading || !canStart) return;

    setIsLoading(true);

    try {
      await executeWithRetry(
        async () => {
          const formData = new FormData();
          formData.append('gameId', gameId);
          return await startGameAction(formData);
        },
        '出題中',
        'start'
      );
    } finally {
      setIsLoading(false);
    }
  }, [gameId, canStart, isLoading, executeWithRetry]);

  const closeGame = useCallback(async () => {
    if (isLoading || !canClose) return;

    // Show confirmation dialog
    const confirmed = window.confirm('本当にゲームを締切しますか？');
    if (!confirmed) return;

    setIsLoading(true);

    try {
      await executeWithRetry(
        async () => {
          const formData = new FormData();
          formData.append('gameId', gameId);
          formData.append('confirmed', 'true');
          return await closeGameAction(formData);
        },
        '締切',
        'close'
      );
    } finally {
      setIsLoading(false);
    }
  }, [gameId, canClose, isLoading, executeWithRetry]);

  const resetStatus = useCallback(() => {
    setCurrentStatus(initialStatus);
    setIsLoading(false);
    setRetryCount(0);
    setIsRetrying(false);
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, [initialStatus]);

  return {
    currentStatus,
    isLoading,
    canStart,
    canClose,
    startGame,
    closeGame,
    resetStatus,
    retryCount,
    isRetrying,
  };
}
