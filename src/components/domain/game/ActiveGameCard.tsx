/**
 * ActiveGameCard Component
 * Feature: 005-top-active-games (User Story 2 & 3)
 * Feature: 001-lie-detection-answers (Answer submission navigation)
 * Feature: 006-results-dashboard (Dashboard navigation)
 * Feature: 007-game-closure (Status badge and closed game handling)
 *
 * Displays a single active game with:
 * - Game title
 * - Game status badge ('出題中' or '締切')
 * - Player count (current / limit)
 * - Formatted creation time
 * - Action buttons:
 *   - Answer submission button (all users, disabled for closed games)
 *   - Dashboard/Results button (conditional):
 *     - '出題中' (active): Links to dashboard with text "ダッシュボード"
 *     - '締切' (closed): Links to results with text "結果を見る"
 */

import Link from 'next/link';
import type { ActiveGameListItem } from '@/types/game';

export interface ActiveGameCardProps {
  /** Game information to display */
  game: ActiveGameListItem;
  /** Current user's session ID (for creator authorization) */
  currentSessionId?: string;
}

/**
 * ActiveGameCard - Presentational component with navigation
 * Provides navigation to answer submission and dashboard
 */
export function ActiveGameCard({ game, currentSessionId: _currentSessionId }: ActiveGameCardProps) {
  const playerCountText = game.playerLimit
    ? `${game.playerCount} / ${game.playerLimit}人`
    : `${game.playerCount}人`;

  const isClosed = game.status === '締切';

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300">
      {/* Game Title and Status Badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{game.title}</h3>
        <span
          className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            isClosed ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
          }`}
        >
          {game.status}
        </span>
      </div>

      {/* Game Metadata */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        {/* Player Count */}
        <div className="flex items-center gap-2">
          <span className="font-medium">{playerCountText}</span>
        </div>

        {/* Creation Time */}
        <time dateTime={game.createdAt} className="text-gray-500">
          {game.formattedCreatedAt}
        </time>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* Answer Button - Disabled for closed games */}
        {isClosed ? (
          <button
            type="button"
            disabled
            className="flex-1 rounded-md bg-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-500 cursor-not-allowed"
            aria-label="このゲームは締め切られました"
          >
            回答する
          </button>
        ) : (
          <Link
            href={`/games/${game.id}/answer`}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            回答する
          </Link>
        )}

        {/* Dashboard/Results Button - Conditional based on game status */}
        <Link
          href={isClosed ? `/games/${game.id}/results` : `/games/${game.id}/dashboard`}
          className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          {isClosed ? '結果を見る' : 'ダッシュボード'}
        </Link>
      </div>
    </article>
  );
}
