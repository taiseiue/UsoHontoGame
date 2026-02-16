'use client';

// GameForm Component
// Feature: 002-game-preparation
// Form for creating/editing games with player limit validation

import { useLanguage } from '@/hooks/useLanguage';
import { useGameForm } from '@/hooks/useGameForm';

interface GameFormProps {
  /** Form mode: 'create' or 'edit' */
  mode?: 'create' | 'edit';
  /** Game ID (required for edit mode) */
  gameId?: string;
  /** Initial game name (for edit mode) */
  initialName?: string | null;
  /** Initial player limit value (for edit mode) */
  initialPlayerLimit?: number;
  /** Current number of players (for edit mode validation hint) */
  currentPlayers?: number;
}

/**
 * GameForm Component
 * Displays form for creating/editing games with player limit input
 * Handles validation, submission, and error display
 */
export function GameForm({
  mode = 'create',
  gameId,
  initialName = null,
  initialPlayerLimit = 10,
  currentPlayers = 0,
}: GameFormProps) {
  const { t } = useLanguage();
  const { handleSubmit, isSubmitting, errors, isSuccess } = useGameForm({
    mode,
    gameId,
  });

  const isEditMode = mode === 'edit';

  return (
    <div className={isEditMode ? '' : 'max-w-md mx-auto p-6'}>
      {!isEditMode && <h1 className="text-2xl font-bold mb-6">{t('game.newGame')}</h1>}

      {isSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md" role="alert">
          <p className="text-green-800">
            {isEditMode
              ? t('action.game.update.success')
              : `${t('action.game.create.success')} ${t('common.loading')}`}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hidden gameId field for edit mode */}
        {isEditMode && gameId && <input type="hidden" name="gameId" value={gameId} />}

        {/* Game Name Input (optional) */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            {t('form.game.name.label')} ({t('form.game.name.optional')},{' '}
            {t('validation.game.name.tooLong')})
          </label>
          <input
            type="text"
            id="name"
            name="name"
            maxLength={100}
            defaultValue={initialName || ''}
            placeholder={t('form.game.name.placeholder')}
            disabled={isSubmitting || isSuccess}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            aria-describedby={errors.name ? 'name-error' : undefined}
            aria-invalid={errors.name ? 'true' : 'false'}
          />
          <p className="mt-1 text-xs text-gray-500">{t('form.game.name.description')}</p>
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.name[0]}
            </p>
          )}
        </div>

        {/* Player Limit Input */}
        <div>
          <label htmlFor="playerLimit" className="block text-sm font-medium text-gray-700 mb-2">
            {t('form.game.playerLimit.label')} (1-100)
          </label>
          <input
            type="number"
            id="playerLimit"
            name="playerLimit"
            min={isEditMode ? currentPlayers : 1}
            max="100"
            defaultValue={initialPlayerLimit}
            required
            disabled={isSubmitting || isSuccess}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            aria-describedby={errors.playerLimit ? 'playerLimit-error' : undefined}
            aria-invalid={errors.playerLimit ? 'true' : 'false'}
          />
          {isEditMode && currentPlayers > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              {t('form.game.playerLimit.currentPlayers').replace('{count}', String(currentPlayers))}
            </p>
          )}
          {errors.playerLimit && (
            <p id="playerLimit-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.playerLimit[0]}
            </p>
          )}
        </div>

        {/* Form-level errors */}
        {errors._form && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md" role="alert">
            <p className="text-sm text-red-800">{errors._form[0]}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting
              ? isEditMode
                ? t('status.labels.updating')
                : t('common.loading')
              : isEditMode
                ? t('game.editSettings')
                : t('game.createGame')}
          </button>

          <a
            href={isEditMode ? `/games/${gameId}` : '/top'}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-center"
          >
            {t('common.cancel')}
          </a>
        </div>
      </form>

      {/* Help Text */}
      {!isEditMode && (
        <div className="mt-6 text-sm text-gray-600">
          <p>{t('game.createHelp')}</p>
        </div>
      )}
    </div>
  );
}
