/**
 * useAnswerSubmissionPage Hook
 * Feature: 001-lie-detection-answers
 * Wrapper hook that handles data fetching and coordinates with useAnswerSubmission
 */

'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getPresentersAction } from '@/app/actions/presenter';
import type { PresenterWithLieDto } from '@/server/application/dto/PresenterWithLieDto';
import { type Presenter, useAnswerSubmission } from './useAnswerSubmission';

export interface UseAnswerSubmissionPageOptions {
  gameId: string;
}

export interface UseAnswerSubmissionPageReturn {
  formData: {
    presenters: Presenter[];
    selections: Record<string, string>;
    isComplete: boolean;
    isSubmitting: boolean;
  } | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  handleSelectEpisode: (presenterId: string, episodeId: string) => void;
  handleSubmit: () => Promise<void>;
  handleReset: () => void;
}

/**
 * Transform PresenterWithLieDto to Presenter format (excluding isLie flag)
 * This ensures participants cannot see which episodes are lies
 */
function transformPresenter(dto: PresenterWithLieDto): Presenter {
  return {
    id: dto.id,
    name: dto.nickname,
    episodes: dto.episodes.map((episode) => ({
      id: episode.id,
      text: episode.text,
      // isLie is intentionally excluded for participants
    })),
  };
}

/**
 * Hook that combines data fetching with answer submission logic
 * Provides the API expected by AnswerSubmissionPage component
 */
export function useAnswerSubmissionPage({
  gameId,
}: UseAnswerSubmissionPageOptions): UseAnswerSubmissionPageReturn {
  const router = useRouter();
  const [presenters, setPresenters] = useState<Presenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch presenters on mount
  useEffect(() => {
    let isMounted = true;

    async function fetchPresenters() {
      try {
        setIsLoading(true);
        setFetchError(null);

        const result = await getPresentersAction(gameId);

        if (!isMounted) return;

        if (result.success) {
          // Transform DTO to remove isLie flag
          const transformed = result.presenters.map(transformPresenter);
          setPresenters(transformed);
        } else {
          setFetchError(result.error);
        }
      } catch (_err) {
        if (!isMounted) return;
        setFetchError('プレゼンターの取得に失敗しました');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchPresenters();

    return () => {
      isMounted = false;
    };
  }, [gameId]);

  // Handle successful submission - redirect to top page
  const handleSuccess = useCallback(() => {
    router.push('/');
  }, [router]);

  // Use answer submission hook (only after presenters are loaded)
  const {
    selections,
    selectEpisode,
    isComplete,
    isSubmitting,
    error: submissionError,
    successMessage,
    submit,
    reset,
  } = useAnswerSubmission({
    gameId,
    presenters,
    onSuccess: handleSuccess,
  });

  // Combine errors (fetch error takes precedence)
  const error = fetchError || submissionError;

  // Wrap handlers to match component's expected API
  const handleSelectEpisode = useCallback(
    (presenterId: string, episodeId: string) => {
      selectEpisode(presenterId, episodeId);
    },
    [selectEpisode]
  );

  const handleSubmit = useCallback(async () => {
    await submit();
  }, [submit]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  // Build formData object
  const formData =
    !isLoading && presenters.length > 0
      ? {
          presenters,
          selections,
          isComplete,
          isSubmitting,
        }
      : null;

  return {
    formData,
    isLoading,
    error,
    successMessage,
    handleSelectEpisode,
    handleSubmit,
    handleReset,
  };
}
