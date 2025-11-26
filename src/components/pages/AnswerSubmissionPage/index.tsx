/**
 * AnswerSubmissionPage Component
 * Feature: 001-lie-detection-answers
 * Page for submitting answers to a game
 * Task: T043
 */

'use client';

import type { FC } from 'react';
import { GameAnswerForm } from '@/components/domain/answer/GameAnswerForm';
import type { AnswerSubmissionPageProps } from './AnswerSubmissionPage.types';
import { useAnswerSubmissionPage } from './hooks/useAnswerSubmissionPage';

/**
 * Answer Submission Page
 * Allows participants to:
 * - View all presenters and their episodes
 * - Select one lie episode per presenter
 * - Submit their answer selections
 * - Reset their selections
 *
 * This is a pure presentational component; all logic is handled by the
 * useAnswerSubmissionPage custom hook.
 */
export const AnswerSubmissionPage: FC<AnswerSubmissionPageProps> = ({ gameId }) => {
  const {
    formData,
    isLoading,
    error,
    successMessage,
    handleSelectEpisode,
    handleSubmit,
    handleReset,
  } = useAnswerSubmissionPage({ gameId });

  // Error state (check error first before loading check)
  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg"
          >
            {error}
          </div>
        </div>
      </main>
    );
  }

  // Loading state
  if (isLoading || !formData) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ゲームに回答</h1>
          <p className="mt-2 text-gray-600">
            各出題者のエピソードから嘘だと思うものを選んでください
          </p>
        </div>

        {/* Game Answer Form */}
        <GameAnswerForm
          presenters={formData.presenters}
          selections={formData.selections}
          isComplete={formData.isComplete}
          isSubmitting={formData.isSubmitting}
          error={error}
          successMessage={successMessage}
          onSelectEpisode={handleSelectEpisode}
          onSubmit={handleSubmit}
          onReset={handleReset}
        />
      </div>
    </main>
  );
};
