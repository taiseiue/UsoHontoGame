// Game Repository Interface
// Abstraction for game storage operations

import type { Episode } from '../entities/Episode';
import type { Game } from '../entities/Game';
import type { Presenter } from '../entities/Presenter';
import type { GameId } from '../value-objects/GameId';
import type { GameStatus } from '../value-objects/GameStatus';

/**
 * Game repository interface
 * Defines contract for game storage operations including presenters and episodes
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
   * Find games by creator ID
   * @param creatorId Creator/moderator session ID
   * @returns Games created by the specified user
   */
  findByCreatorId(creatorId: string): Promise<Game[]>;

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

  // Presenter operations

  /**
   * Find all presenters for a game
   * @param gameId Game ID to find presenters for
   * @returns All presenters for the game
   */
  findPresentersByGameId(gameId: string): Promise<Presenter[]>;

  /**
   * Find a single presenter by ID
   * @param presenterId Presenter ID to search for
   * @returns Presenter entity or null if not found
   */
  findPresenterById(presenterId: string): Promise<Presenter | null>;

  /**
   * Add a presenter to a game
   * @param presenter Presenter entity to create
   */
  addPresenter(presenter: Presenter): Promise<void>;

  /**
   * Create a presenter with episodes in atomic operation (all-or-nothing)
   * @param presenter Presenter entity to create
   * @param episodes Array of exactly 3 Episode entities
   * @returns Created presenter with episodes for verification
   */
  createPresenterWithEpisodes(presenter: Presenter, episodes: Episode[]): Promise<Presenter>;

  /**
   * Remove a presenter from a game (cascade deletes episodes)
   * @param presenterId Presenter ID to delete
   */
  removePresenter(presenterId: string): Promise<void>;

  // Episode operations

  /**
   * Find all episodes for a presenter
   * @param presenterId Presenter ID to find episodes for
   * @returns All episodes for the presenter
   */
  findEpisodesByPresenterId(presenterId: string): Promise<Episode[]>;

  /**
   * Add an episode to a presenter
   * @param episode Episode entity to create
   */
  addEpisode(episode: Episode): Promise<void>;

  /**
   * Remove an episode
   * @param episodeId Episode ID to delete
   */
  removeEpisode(episodeId: string): Promise<void>;

  /**
   * Update an episode
   * @param episode Episode entity with updated data
   */
  updateEpisode(episode: Episode): Promise<void>;

  /**
   * Find active games with pagination and player count
   * Feature: 005-top-active-games
   * Feature: 007-game-closure - Updated to include both '出題中' and '締切' games
   * @param params Pagination parameters
   * @returns Games with metadata including creator ID and status
   */
  findActiveGamesWithPagination(params: { limit: number; skip: number }): Promise<{
    games: Array<{
      id: string;
      title: string;
      createdAt: Date;
      playerCount: number;
      playerLimit: number | null;
      creatorId: string;
      status: '出題中' | '締切';
    }>;
    total: number;
  }>;

  /**
   * Find games with status filter (active and/or closed)
   * Feature: 007-game-closure
   * @param params Pagination and filter parameters
   * @returns Games matching filter with pagination metadata
   */
  findGamesWithStatusFilter(params: {
    limit: number;
    skip: number;
    statusFilter: '出題中' | '締切' | 'すべて';
  }): Promise<{
    games: Array<{
      id: string;
      title: string;
      createdAt: Date;
      playerCount: number;
      playerLimit: number | null;
      creatorId: string;
      status: '出題中' | '締切';
    }>;
    total: number;
  }>;
}
