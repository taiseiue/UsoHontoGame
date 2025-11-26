// Game-related type definitions
// Foundation types for game management and display

/**
 * Game status enum
 * Defines the current state of a game in the system
 */
export type GameStatus = '準備中' | '出題中' | '締切';

/**
 * Game summary for display on TOP page
 * Contains minimal information needed to show available games
 */
export interface GameSummary {
  /** Unique game identifier (UUID) */
  id: string;
  /** Game display name */
  name: string;
  /** Current game status */
  status: GameStatus;
  /** Maximum number of players allowed */
  maxPlayers: number;
  /** Current number of registered players */
  currentPlayers: number;
}

/**
 * Active game list item for TOP page display
 * Feature: 005-top-active-games
 * Feature: 007-game-closure - Added status field to display game state
 * Contains information needed to display an active game in the list
 */
export interface ActiveGameListItem {
  /** Unique game identifier (UUID) */
  id: string;
  /** Game title */
  title: string;
  /** ISO 8601 timestamp of when the game was created */
  createdAt: string;
  /** Current number of players in the game */
  playerCount: number;
  /** Maximum number of players allowed (null = unlimited) */
  playerLimit: number | null;
  /** Human-readable relative time (e.g., "2時間前") */
  formattedCreatedAt: string;
  /** Session ID of the game creator (for authorization checks) */
  creatorId: string;
  /** Current game status */
  status: '出題中' | '締切';
}

/**
 * Active games response for server actions
 * Feature: 005-top-active-games
 * Contains paginated list of active games with metadata
 */
export interface ActiveGamesResponse {
  /** List of active games */
  games: ActiveGameListItem[];
  /** Whether more games are available for pagination */
  hasMore: boolean;
  /** Cursor for fetching the next page of results */
  nextCursor: string | null;
  /** Total count of all active games */
  total: number;
}

/**
 * Status filter options for TOP page
 * Feature: 007-game-closure
 */
export type GameStatusFilter = '出題中' | '締切' | 'すべて';

/**
 * Game list item with status information
 * Feature: 007-game-closure
 * Extended from ActiveGameListItem to include status field
 */
export interface GameListItemWithStatus extends ActiveGameListItem {
  /** Current game status */
  status: '出題中' | '締切';
}
