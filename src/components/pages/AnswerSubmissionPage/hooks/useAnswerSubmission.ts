/**
 * useAnswerSubmission Hook
 * Feature: 001-lie-detection-answers
 * Manages answer selection state, localStorage persistence, and submission
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { submitAnswerAction } from '@/app/actions/answers';

export interface Presenter {
  id: string;
  name: string;
  episodes: Array<{ id: string; text: string }>;
}

export interface UseAnswerSubmissionOptions {
  gameId: string;
  presenters: Presenter[];
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface UseAnswerSubmissionReturn {
  selections: Record<string, string>;
  selectEpisode: (presenterId: string, episodeId: string) => void;
  isComplete: boolean;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
  submit: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook for managing answer submission with local storage persistence
 */
export function useAnswerSubmission({
  gameId,
  presenters,
  onSuccess,
  onError,
}: UseAnswerSubmissionOptions): UseAnswerSubmissionReturn {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const storageKey = `answer-${gameId}`;

  // Load selections from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelections(parsed);
      }
    } catch (err) {
      // Handle corrupted localStorage data
      console.error('Failed to load selections from localStorage:', err);
    }
  }, [storageKey]);

  // Save selections to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(selections).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(selections));
    }
  }, [selections, storageKey]);

  // Select episode for a presenter
  const selectEpisode = useCallback((presenterId: string, episodeId: string) => {
    setSelections((prev) => ({
      ...prev,
      [presenterId]: episodeId,
    }));
    // Clear errors when user makes changes
    setError(null);
    setSuccessMessage(null);
  }, []);

  // Calculate if all presenters have selections
  const isComplete =
    presenters.length > 0 &&
    presenters.every((presenter) => selections[presenter.id] !== undefined);

  // Submit answer
  const submit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append('gameId', gameId);
      formData.append('selections', JSON.stringify(selections));

      const result = await submitAnswerAction(formData);

      if (result.success) {
        setSuccessMessage(result.data.message);
        // Clear localStorage after successful submission
        localStorage.removeItem(storageKey);
        onSuccess?.();
      } else {
        const errorMessage =
          result.errors._form?.[0] || result.errors.selections?.[0] || '回答の送信に失敗しました';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (_err) {
      const errorMessage = '予期しないエラーが発生しました';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [gameId, selections, storageKey, onSuccess, onError]);

  // Reset selections and messages
  const reset = useCallback(() => {
    setSelections({});
    setError(null);
    setSuccessMessage(null);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    selections,
    selectEpisode,
    isComplete,
    isSubmitting,
    error,
    successMessage,
    submit,
    reset,
  };
}
