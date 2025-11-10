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
