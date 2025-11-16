'use client';

// Custom Hook: usePresenterWithEpisodesForm
// Feature: 003-presenter-episode-inline
// Manages form state for inline presenter registration with 3 episodes

import { useCallback, useState } from 'react';
import { addPresenterWithEpisodesAction } from '@/app/actions/presenter';
import type { PresenterWithLieDto } from '@/server/application/dto/PresenterWithLieDto';

export interface EpisodeFormValue {
  text: string;
  isLie: boolean;
}

export interface FormState {
  gameId: string;
  nickname: string;
  episodes: [EpisodeFormValue, EpisodeFormValue, EpisodeFormValue];
}

export interface FormErrors {
  nickname?: string[];
  episodes?: string[];
  episodeTexts?: string[];
  _form?: string[];
}

export interface FormStatus {
  isLoading: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
  successMessage?: string;
  errors?: FormErrors;
  presenter?: PresenterWithLieDto;
}

/**
 * Custom hook for managing inline presenter registration form
 * Handles form state, validation, submission, and success/error feedback
 */
export function usePresenterWithEpisodesForm(gameId: string) {
  const [formState, setFormState] = useState<FormState>({
    gameId,
    nickname: '',
    episodes: [
      { text: '', isLie: false },
      { text: '', isLie: false },
      { text: '', isLie: false },
    ],
  });

  const [status, setStatus] = useState<FormStatus>({
    isLoading: false,
    isSubmitting: false,
    isSuccess: false,
  });

  /**
   * Update nickname field
   */
  const updateNickname = useCallback((nickname: string) => {
    setFormState((prev) => ({
      ...prev,
      nickname,
    }));
    // Clear errors when user starts typing
    setStatus((prev) => ({
      ...prev,
      errors: undefined,
    }));
  }, []);

  /**
   * Update episode text
   */
  const updateEpisodeText = useCallback((index: 0 | 1 | 2, text: string) => {
    setFormState((prev) => {
      const newEpisodes = [...prev.episodes] as [
        EpisodeFormValue,
        EpisodeFormValue,
        EpisodeFormValue,
      ];
      newEpisodes[index] = {
        ...newEpisodes[index],
        text,
      };
      return {
        ...prev,
        episodes: newEpisodes,
      };
    });
    // Clear errors when user starts typing
    setStatus((prev) => ({
      ...prev,
      errors: undefined,
    }));
  }, []);

  /**
   * Update lie marker for episode with exclusive selection
   * When an episode is marked as lie, all other episodes are automatically set to false
   */
  const updateEpisodeIsLie = useCallback((index: 0 | 1 | 2, isLie: boolean) => {
    setFormState((prev) => {
      const newEpisodes = [...prev.episodes] as [
        EpisodeFormValue,
        EpisodeFormValue,
        EpisodeFormValue,
      ];
      
      if (isLie) {
        // If marking this episode as lie, set all others to false (exclusive selection)
        newEpisodes.forEach((episode, i) => {
          newEpisodes[i] = {
            ...episode,
            isLie: i === index,
          };
        });
      } else {
        // If unmarking this episode as lie, just set this one to false
        newEpisodes[index] = {
          ...newEpisodes[index],
          isLie: false,
        };
      }
      
      return {
        ...prev,
        episodes: newEpisodes,
      };
    });
    // Clear errors when user changes lie marker
    setStatus((prev) => ({
      ...prev,
      errors: undefined,
    }));
  }, []);

  /**
   * Submit form with presenter and episodes
   */
  const submit = useCallback(async () => {
    setStatus((prev) => ({
      ...prev,
      isSubmitting: true,
      isSuccess: false,
      errors: undefined,
    }));

    try {
      const formData = new FormData();
      formData.append('gameId', formState.gameId);
      formData.append('nickname', formState.nickname);

      // Add episodes to form data
      for (let i = 0; i < 3; i += 1) {
        formData.append(`episodes[${i}].text`, formState.episodes[i].text);
        formData.append(`episodes[${i}].isLie`, String(formState.episodes[i].isLie));
      }

      const result = await addPresenterWithEpisodesAction(formData);

      if (result.success) {
        setStatus((prev) => ({
          ...prev,
          isSubmitting: false,
          isSuccess: true,
          successMessage: 'プレゼンターとエピソードが正常に登録されました',
          presenter: result.presenter,
        }));

        // Reset form after successful submission
        setFormState({
          gameId,
          nickname: '',
          episodes: [
            { text: '', isLie: false },
            { text: '', isLie: false },
            { text: '', isLie: false },
          ],
        });

        // Auto-dismiss success message after 3 seconds
        setTimeout(() => {
          setStatus((prev) => ({
            ...prev,
            isSuccess: false,
          }));
        }, 3000);
      } else {
        setStatus((prev) => ({
          ...prev,
          isSubmitting: false,
          errors: result.errors,
        }));
      }
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isSubmitting: false,
        errors: {
          _form: [error instanceof Error ? error.message : 'エラーが発生しました'],
        },
      }));
    }
  }, [formState, gameId]);

  /**
   * Reset form to initial state
   */
  const reset = useCallback(() => {
    setFormState({
      gameId,
      nickname: '',
      episodes: [
        { text: '', isLie: false },
        { text: '', isLie: false },
        { text: '', isLie: false },
      ],
    });
    setStatus({
      isLoading: false,
      isSubmitting: false,
      isSuccess: false,
    });
  }, [gameId]);

  /**
   * Get character count for nickname
   */
  const getNicknameCharCount = useCallback(() => {
    return formState.nickname.length;
  }, [formState.nickname]);

  /**
   * Get character count for episode
   */
  const getEpisodeCharCount = useCallback(
    (index: 0 | 1 | 2) => {
      return formState.episodes[index].text.length;
    },
    [formState.episodes]
  );

  return {
    // State
    formState,
    status,
    isLoading: status.isLoading,
    isSubmitting: status.isSubmitting,
    isSuccess: status.isSuccess,
    successMessage: status.successMessage,
    errors: status.errors,
    presenter: status.presenter,

    // Actions
    updateNickname,
    updateEpisodeText,
    updateEpisodeIsLie,
    submit,
    reset,

    // Utilities
    getNicknameCharCount,
    getEpisodeCharCount,
  };
}
