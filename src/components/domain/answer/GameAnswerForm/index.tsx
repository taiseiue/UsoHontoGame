/**
 * GameAnswerForm Component
 * Feature: 001-lie-detection-answers
 * Main form for answer submission with validation and state management
 */

'use client';

import type { FC, FormEvent } from 'react';
import type { Presenter } from '../PresenterEpisodeList';
import { PresenterEpisodeList } from '../PresenterEpisodeList';

export interface GameAnswerFormProps {
  presenters: Presenter[];
  selections: Record<string, string>;
  isComplete: boolean;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
  onSelectEpisode: (presenterId: string, episodeId: string) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export const GameAnswerForm: FC<GameAnswerFormProps> = ({
  presenters,
  selections,
  isComplete,
  isSubmitting,
  error,
  successMessage,
  onSelectEpisode,
  onSubmit,
  onReset,
}) => {
  const hasSelections = Object.keys(selections).length > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isComplete || isSubmitting) return;
    onSubmit();
  };

  return (
    <form aria-label="回答フォーム" onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">嘘を見抜いて回答しよう</h2>
        <p className="text-gray-600">各出題者のエピソードから嘘だと思うものを1つ選んでください</p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg"
        >
          {error}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <output className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg block">
          {successMessage}
        </output>
      )}

      {/* Presenter Episode List */}
      <PresenterEpisodeList
        presenters={presenters}
        selections={selections}
        onSelectEpisode={onSelectEpisode}
        disabled={isSubmitting}
      />

      {/* Validation Status */}
      {!isComplete && hasSelections && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          すべての出題者のエピソードを選択してください
        </div>
      )}

      {isComplete && !isSubmitting && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <title>チェックマーク</title>
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          回答準備完了
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={!isComplete || isSubmitting}
          className={`
						flex-1 px-6 py-3 rounded-lg font-semibold transition-all
						focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
						${
              !isComplete || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }
					`}
        >
          {isSubmitting ? '送信中...' : '回答を送信'}
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={!hasSelections || isSubmitting}
          className={`
						px-6 py-3 rounded-lg font-semibold transition-all
						focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
						${
              !hasSelections || isSubmitting
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 border border-gray-300'
            }
					`}
        >
          リセット
        </button>
      </div>
    </form>
  );
};
