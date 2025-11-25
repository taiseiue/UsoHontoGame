/**
 * ActiveGameCard Component
 * Feature: 005-top-active-games (User Story 2 & 3)
 * Feature: 001-lie-detection-answers (Answer submission navigation)
 * Feature: 006-results-dashboard (Dashboard navigation for creators)
 *
 * Displays a single active game with:
 * - Game title
 * - Player count (current / limit)
 * - Formatted creation time
 * - Action buttons:
 *   - Answer submission button (all users)
 *   - Dashboard button (creators only)
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
 * Provides navigation to answer submission and dashboard (for creators)
 */
export function ActiveGameCard({ game, currentSessionId }: ActiveGameCardProps) {
  const playerCountText = game.playerLimit
    ? `${game.playerCount} / ${game.playerLimit}人`
    : `${game.playerCount}人`;

  const isCreator = currentSessionId === game.creatorId;

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300">
      {/* Game Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{game.title}</h3>

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
        {/* Answer Button - Always visible */}
        <Link
          href={`/games/${game.id}/answer`}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          回答する
        </Link>

        {/* Dashboard Button - Only for creators */}
        {isCreator && (
          <Link
            href={`/games/${game.id}/dashboard`}
            className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            ダッシュボード
          </Link>
        )}
      </div>
    </article>
  );
}
