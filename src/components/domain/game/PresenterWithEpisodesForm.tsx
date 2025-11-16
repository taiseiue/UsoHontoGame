'use client';

// Component: PresenterWithEpisodesForm
// Feature: 003-presenter-episode-inline
// Form for inline presenter registration with 3 episodes in a single operation

import { useEffect, useRef } from 'react';
import { usePresenterWithEpisodesForm } from '@/hooks/usePresenterWithEpisodesForm';

import type { PresenterWithLieDto } from '@/server/application/dto/PresenterWithLieDto';

interface PresenterWithEpisodesFormProps {
  gameId: string;
  onSuccess?: (presenter: PresenterWithLieDto) => void;
}

const NICKNAME_MAX = 50;
const EPISODE_MAX = 1000;

export function PresenterWithEpisodesForm({ gameId, onSuccess }: PresenterWithEpisodesFormProps) {
  const {
    formState,
    isSubmitting,
    isSuccess,
    successMessage,
    errors,
    presenter,
    updateNickname,
    updateEpisodeText,
    updateEpisodeIsLie,
    submit,
    reset,
    getNicknameCharCount,
    getEpisodeCharCount,
  } = usePresenterWithEpisodesForm(gameId);

  // Track if we've already called onSuccess for this presenter
  const lastPresenterIdRef = useRef<string | null>(null);

  // Call onSuccess when presenter is available after successful submission
  useEffect(() => {
    if (isSuccess && presenter && onSuccess && lastPresenterIdRef.current !== presenter.id) {
      lastPresenterIdRef.current = presenter.id;
      onSuccess(presenter);
    }
  }, [isSuccess, presenter, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit();
  };

  const handleReset = () => {
    reset();
  };

  // Get nickname character count color
  const nicknameCharCount = getNicknameCharCount();
  const nicknameCountColor =
    nicknameCharCount > NICKNAME_MAX * 0.8 ? 'text-orange-600' : 'text-gray-500';

  // Get episode character count color
  const getEpisodeCountColor = (index: 0 | 1 | 2) => {
    const count = getEpisodeCharCount(index);
    return count > EPISODE_MAX * 0.8 ? 'text-orange-600' : 'text-gray-500';
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Success Message */}
      {isSuccess && successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Form Errors */}
      {errors?._form && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          {errors._form.map((error, idx) => (
            <p key={idx} className="text-sm text-red-700">
              {error}
            </p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nickname Field */}
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
            ニックネーム <span className="text-red-600">*</span>
          </label>
          <input
            id="nickname"
            type="text"
            value={formState.nickname}
            onChange={(e) => updateNickname(e.target.value)}
            placeholder="例：田中太郎"
            maxLength={NICKNAME_MAX}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors?.nickname ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          <div className="mt-2 flex justify-between">
            {errors?.nickname && <p className="text-sm text-red-600">{errors.nickname[0]}</p>}
            <span className={`text-xs ${nicknameCountColor} ml-auto`}>
              {nicknameCharCount}/{NICKNAME_MAX}文字
            </span>
          </div>
        </div>

        {/* Episodes Section */}
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900">エピソード（3つ選択）</h3>

          {formState.episodes.map((episode, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              {/* Episode Number */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded">
                  エピソード {index + 1}
                </span>
              </div>

              {/* Episode Text */}
              <div className="mb-4">
                <label
                  htmlFor={`episode-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  内容 <span className="text-red-600">*</span>
                </label>
                <textarea
                  id={`episode-${index}`}
                  value={episode.text}
                  onChange={(e) => updateEpisodeText(index as 0 | 1 | 2, e.target.value)}
                  placeholder={`エピソード${index + 1}の内容を入力してください`}
                  maxLength={EPISODE_MAX}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    errors?.episodes ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                <div className="mt-2 flex justify-between">
                  {errors?.episodes && index === 0 && (
                    <p className="text-sm text-red-600">{errors.episodes[0]}</p>
                  )}
                  <span className={`text-xs ${getEpisodeCountColor(index as 0 | 1 | 2)} ml-auto`}>
                    {getEpisodeCharCount(index as 0 | 1 | 2)}/{EPISODE_MAX}文字
                  </span>
                </div>
              </div>

              {/* Lie Marker */}
              <div className="flex items-center">
                <input
                  id={`is-lie-${index}`}
                  type="radio"
                  name="lie-episode"
                  value={index}
                  checked={episode.isLie}
                  onChange={(e) => updateEpisodeIsLie(index as 0 | 1 | 2, e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor={`is-lie-${index}`}
                  className="ml-2 text-sm text-gray-700 cursor-pointer"
                >
                  このエピソードをウソにする
                </label>
              </div>
            </div>
          ))}

          {/* Lie Marker Validation Error */}
          {errors?.episodes && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700">{errors.episodes[0]}</p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 border-t pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {isSubmitting ? '送信中...' : '登録'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed font-medium transition-colors"
          >
            クリア
          </button>
        </div>
      </form>
    </div>
  );
}
