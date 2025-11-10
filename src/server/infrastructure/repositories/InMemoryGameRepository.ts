// InMemoryGameRepository
// Implementation of IGameRepository using in-memory storage (MVP)

import { Game } from '@/server/domain/entities/Game';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import { GameId } from '@/server/domain/value-objects/GameId';
import { GameStatus } from '@/server/domain/value-objects/GameStatus';

/**
 * InMemoryGameRepository
 * Stores game data in memory for MVP
 * Uses singleton pattern to maintain state across requests
 */
export class InMemoryGameRepository implements IGameRepository {
  private static instance: InMemoryGameRepository;
  private games: Map<string, Game>;

  private constructor() {
    this.games = new Map();
    // Initialize with some test data for development
    this.initializeTestData();
  }

  /**
   * Gets the singleton instance
   */
  static getInstance(): InMemoryGameRepository {
    if (!InMemoryGameRepository.instance) {
      InMemoryGameRepository.instance = new InMemoryGameRepository();
    }
    return InMemoryGameRepository.instance;
  }

  /**
   * Finds all games
   */
  async findAll(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  /**
   * Finds games by status
   * @param status The status to filter by
   */
  async findByStatus(status: GameStatus): Promise<Game[]> {
    return Array.from(this.games.values()).filter((game) => game.status.equals(status));
  }

  /**
   * Finds a game by ID
   * @param id The game ID
   */
  async findById(id: GameId): Promise<Game | null> {
    return this.games.get(id.value) ?? null;
  }

  /**
   * Creates a new game
   * @param game The game to create
   */
  async create(game: Game): Promise<void> {
    this.games.set(game.id.value, game);
  }

  /**
   * Updates an existing game
   * @param game The game to update
   */
  async update(game: Game): Promise<void> {
    this.games.set(game.id.value, game);
  }

  /**
   * Deletes a game
   * @param id The game ID to delete
   */
  async delete(id: GameId): Promise<void> {
    this.games.delete(id.value);
  }

  /**
   * Initializes test data for development
   * Creates sample games with different statuses
   */
  private initializeTestData(): void {
    const now = new Date();

    // Game 1: Accepting responses
    const game1 = new Game(
      new GameId('550e8400-e29b-41d4-a716-446655440001'),
      '第1回 ウソ？ホント？クイズ',
      new GameStatus('出題中'),
      10,
      3,
      now,
      now
    );
    this.games.set(game1.id.value, game1);

    // Game 2: Accepting responses
    const game2 = new Game(
      new GameId('550e8400-e29b-41d4-a716-446655440002'),
      '真実はどっち？対決',
      new GameStatus('出題中'),
      8,
      5,
      now,
      now
    );
    this.games.set(game2.id.value, game2);

    // Game 3: In preparation (should not show on TOP page)
    const game3 = new Game(
      new GameId('550e8400-e29b-41d4-a716-446655440003'),
      '準備中のゲーム',
      new GameStatus('準備中'),
      12,
      0,
      now,
      now
    );
    this.games.set(game3.id.value, game3);

    // Game 4: Closed (should not show on TOP page)
    const game4 = new Game(
      new GameId('550e8400-e29b-41d4-a716-446655440004'),
      '締切済みゲーム',
      new GameStatus('締切'),
      10,
      10,
      now,
      now
    );
    this.games.set(game4.id.value, game4);

    // Game 5: Accepting responses
    const game5 = new Game(
      new GameId('550e8400-e29b-41d4-a716-446655440005'),
      'みんなでウソつき当て',
      new GameStatus('出題中'),
      15,
      8,
      now,
      now
    );
    this.games.set(game5.id.value, game5);
  }
}
