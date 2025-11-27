/**
 * ActiveGamesList Component
 * Feature: 005-top-active-games (User Story 2)
 * Feature: 006-results-dashboard (Dashboard navigation support)
 *
 * Container component that renders a list of ActiveGameCard components
 * Handles layout and spacing for multiple game cards
 */

import type { ActiveGameListItem } from '@/types/game';
import { ActiveGameCard } from './ActiveGameCard';

export interface ActiveGamesListProps {
  /** Array of active games to display */
  games: ActiveGameListItem[];
  /** Current user's session ID (for creator authorization) */
  currentSessionId?: string;
}

/**
 * ActiveGamesList - Pure presentational component
 * Renders a grid of game cards with responsive layout
 */
export function ActiveGamesList({ games, currentSessionId }: ActiveGamesListProps) {
  if (games.length === 0) {
    return null;
  }

  return (
    <ul
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      aria-label="出題中のゲーム一覧"
    >
      {games.map((game) => (
        <li key={game.id}>
          <ActiveGameCard game={game} currentSessionId={currentSessionId} />
        </li>
      ))}
    </ul>
  );
}
