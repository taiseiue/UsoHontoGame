import type { GameSession } from '../entities/GameSession';

/**
 * Repository interface for GameSession operations
 */
export interface IGameSessionRepository {
  /**
   * Save a game session
   */
  save(session: GameSession): Promise<void>;

  /**
   * Find a game session by ID
   */
  findById(id: string): Promise<GameSession | null>;

  /**
   * Delete a game session by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Find all sessions (for cleanup operations)
   */
  findAll(): Promise<GameSession[]>;

  /**
   * Check if session exists
   */
  exists(id: string): Promise<boolean>;
}
