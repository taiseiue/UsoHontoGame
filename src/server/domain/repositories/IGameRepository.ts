// Game Repository Interface
// Abstraction for game storage operations

import type { Game } from '../entities/Game';
import type { GameId } from '../value-objects/GameId';
import type { GameStatus } from '../value-objects/GameStatus';

/**
 * Game repository interface
 * Defines contract for game storage operations
 */
export interface IGameRepository {
  /**
   * Find all games
   * @returns All game entities
   */
  findAll(): Promise<Game[]>;

  /**
   * Find games by status
   * @param status Game status to filter by
   * @returns Games with matching status
   */
  findByStatus(status: GameStatus): Promise<Game[]>;

  /**
   * Find single game by ID
   * @param id Game ID to search for
   * @returns Game entity or null if not found
   */
  findById(id: GameId): Promise<Game | null>;

  /**
   * Create a new game
   * @param game Game entity to create
   */
  create(game: Game): Promise<void>;

  /**
   * Update existing game
   * @param game Game entity with updated data
   */
  update(game: Game): Promise<void>;

  /**
   * Delete game
   * @param id Game ID to delete
   */
  delete(id: GameId): Promise<void>;
}
