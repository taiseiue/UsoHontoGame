/**
 * useCloseGame Hook
 * Feature: 007-game-closure
 * Manages game closure operation with confirmation and error handling
 */

'use client';

import { useCallback, useState } from 'react';
import { closeGameAction } from '@/app/actions/game';

export interface UseCloseGameOptions {
  gameId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface UseCloseGameReturn {
  closeGame: () => Promise<void>;
  isClosing: boolean;
  error: string | null;
}

/**
 * Hook for managing game closure with confirmation dialog
 *
 * @param options - Configuration options
 * @returns Object containing closeGame function, loading state, and error state
 */
export function useCloseGame({
  gameId,
  onSuccess,
  onError,
}: UseCloseGameOptions): UseCloseGameReturn {
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeGame = useCallback(async () => {
    // Prevent multiple simultaneous close attempts
    if (isClosing) return;

    // Show confirmation dialog
    const confirmed = window.confirm(
      'ゲームを締め切りますか？締め切り後は回答を受け付けなくなります。'
    );
    if (!confirmed) return;

    // Clear previous error
    setError(null);
    setIsClosing(true);

    try {
      const formData = new FormData();
      formData.append('gameId', gameId);
      formData.append('confirmed', 'true');

      const result = await closeGameAction(formData);

      if (result.success) {
        // Success - call callback
        onSuccess?.();
      } else {
        // Server-side validation error
        const errorMessage = result.errors?._form?.[0] || 'ゲームの締切に失敗しました';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (_err) {
      // Unexpected error (network, etc.)
      const errorMessage = 'ゲームの締切に失敗しました';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsClosing(false);
    }
  }, [gameId, isClosing, onSuccess, onError]);

  return {
    closeGame,
    isClosing,
    error,
  };
}
