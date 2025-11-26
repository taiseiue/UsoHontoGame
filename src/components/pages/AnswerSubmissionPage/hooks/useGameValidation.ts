/**
 * useGameValidation Hook
 * Feature: 001-lie-detection-answers
 * Validates game status and availability on mount with retry support
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { getGameForAnswersAction } from '@/app/actions/answers';
import type { GetGameForAnswersResponse } from '@/server/application/use-cases/answers/GetGameForAnswers';

export interface GameData {
  id: string;
  name: string;
  status: string;
  maxPlayers: number;
  currentPlayers: number;
}

export interface ValidationError {
  code: string;
  message: string;
}

export interface UseGameValidationOptions {
  gameId: string;
  onSuccess?: (game: GameData) => void;
  onError?: (error: ValidationError) => void;
}

export interface UseGameValidationReturn {
  isLoading: boolean;
  game: GameData | null;
  error: ValidationError | null;
  retry: () => void;
}

/**
 * Hook for validating game availability and status
 */
export function useGameValidation({
  gameId,
  onSuccess,
  onError,
}: UseGameValidationOptions): UseGameValidationReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [game, setGame] = useState<GameData | null>(null);
  const [error, setError] = useState<ValidationError | null>(null);

  const validate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result: GetGameForAnswersResponse = await getGameForAnswersAction(gameId);

      if (result.success) {
        setGame(result.data);
        onSuccess?.(result.data);
      } else {
        const validationError = {
          code: result.error.code,
          message: result.error.message,
        };
        setError(validationError);
        onError?.(validationError);
      }
    } catch (_err) {
      const unknownError = {
        code: 'UNKNOWN_ERROR',
        message: '予期しないエラーが発生しました',
      };
      setError(unknownError);
      onError?.(unknownError);
    } finally {
      setIsLoading(false);
    }
  }, [gameId, onSuccess, onError]);

  // Validate on mount
  useEffect(() => {
    validate();
  }, [validate]);

  // Retry function
  const retry = useCallback(() => {
    validate();
  }, [validate]);

  return {
    isLoading,
    game,
    error,
    retry,
  };
}
