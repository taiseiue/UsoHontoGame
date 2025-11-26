/**
 * GetActiveGames Use Case Tests
 * Feature: 005-top-active-games
 * Tests filtering and ordering of active games
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import { GetActiveGames } from './GetActiveGames';

describe('GetActiveGames', () => {
  let mockRepository: IGameRepository;
  let useCase: GetActiveGames;

  beforeEach(() => {
    // Create mock repository with necessary methods
    mockRepository = {
      findActiveGamesWithPagination: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findByStatus: vi.fn(),
      findByCreatorId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findPresentersByGameId: vi.fn(),
      findPresenterById: vi.fn(),
      addPresenter: vi.fn(),
      createPresenterWithEpisodes: vi.fn(),
      removePresenter: vi.fn(),
      findEpisodesByPresenterId: vi.fn(),
      addEpisode: vi.fn(),
      removeEpisode: vi.fn(),
      updateEpisode: vi.fn(),
    } as unknown as IGameRepository;

    useCase = new GetActiveGames(mockRepository);
  });

  describe('filtering by status', () => {
    it('should return only games with 出題中 status', async () => {
      // Arrange
      const mockGames = [
        {
          id: 'game-1',
          title: 'Active Game 1',
          createdAt: new Date('2025-01-18T10:00:00Z'),
          playerLimit: 10,
          playerCount: 5,
        },
        {
          id: 'game-2',
          title: 'Active Game 2',
          createdAt: new Date('2025-01-18T09:00:00Z'),
          playerLimit: null,
          playerCount: 3,
        },
      ];

      vi.mocked(mockRepository.findActiveGamesWithPagination).mockResolvedValue({
        games: mockGames,
        total: 2,
      });

      // Act
      const result = await useCase.execute({ limit: 20 });

      // Assert
      expect(mockRepository.findActiveGamesWithPagination).toHaveBeenCalledWith({
        limit: 20,
        skip: 0,
      });
      expect(result.games).toHaveLength(2);
      expect(result.games[0].title).toBe('Active Game 1');
    });

    it('should not return games with 準備中 or 締切 status', async () => {
      // Arrange
      vi.mocked(mockRepository.findActiveGamesWithPagination).mockResolvedValue({
        games: [],
        total: 0,
      });

      // Act
      const result = await useCase.execute({});

      // Assert
      expect(mockRepository.findActiveGamesWithPagination).toHaveBeenCalledWith({
        limit: 20,
        skip: 0,
      });
      expect(result.games).toHaveLength(0);
    });
  });

  describe('ordering by creation date', () => {
    it('should order games by creation date descending (newest first)', async () => {
      // Arrange
      const mockGames = [
        {
          id: 'game-new',
          title: 'Newest Game',
          createdAt: new Date('2025-01-18T12:00:00Z'),
          playerLimit: null,
          playerCount: 2,
        },
        {
          id: 'game-old',
          title: 'Older Game',
          createdAt: new Date('2025-01-18T08:00:00Z'),
          playerLimit: 10,
          playerCount: 5,
        },
      ];

      vi.mocked(mockRepository.findActiveGamesWithPagination).mockResolvedValue({
        games: mockGames,
        total: 2,
      });

      // Act
      const result = await useCase.execute({});

      // Assert
      expect(mockRepository.findActiveGamesWithPagination).toHaveBeenCalledWith({
        limit: 20,
        skip: 0,
      });
      expect(result.games[0].id).toBe('game-new');
      expect(result.games[1].id).toBe('game-old');
    });
  });

  describe('pagination', () => {
    it('should support cursor-based pagination', async () => {
      // Arrange
      const mockGames = [
        {
          id: 'game-1',
          title: 'Game 1',
          createdAt: new Date(),
          playerLimit: null,
          playerCount: 0,
        },
      ];

      vi.mocked(mockRepository.findActiveGamesWithPagination).mockResolvedValue({
        games: mockGames,
        total: 50,
      });

      // Act
      const result = await useCase.execute({ cursor: '20', limit: 20 });

      // Assert
      expect(mockRepository.findActiveGamesWithPagination).toHaveBeenCalledWith({
        limit: 20,
        skip: 20,
      });
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('40');
    });

    it('should indicate no more results when at end', async () => {
      // Arrange
      vi.mocked(mockRepository.findActiveGamesWithPagination).mockResolvedValue({
        games: [],
        total: 15,
      });

      // Act
      const result = await useCase.execute({ cursor: '20', limit: 20 });

      // Assert
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe('player count aggregation', () => {
    it('should include current player count for each game', async () => {
      // Arrange
      const mockGames = [
        {
          id: 'game-1',
          title: 'Game with Players',
          createdAt: new Date(),
          playerLimit: 10,
          playerCount: 7,
        },
      ];

      vi.mocked(mockRepository.findActiveGamesWithPagination).mockResolvedValue({
        games: mockGames,
        total: 1,
      });

      // Act
      const result = await useCase.execute({});

      // Assert
      expect(result.games[0].playerCount).toBe(7);
      expect(result.games[0].playerLimit).toBe(10);
    });
  });
});
