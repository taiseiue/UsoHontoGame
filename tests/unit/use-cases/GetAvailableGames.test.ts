import { describe, expect, it, vi } from 'vitest';
import { GetAvailableGames } from '@/server/application/use-cases/games/GetAvailableGames';
import { Game } from '@/server/domain/entities/Game';
import { GameId } from '@/server/domain/value-objects/GameId';
import { GameStatus } from '@/server/domain/value-objects/GameStatus';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';

describe('GetAvailableGames', () => {
  const createMockRepository = (): IGameRepository => ({
    findAll: vi.fn(),
    findByStatus: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  });

  const createGame = (
    id: string,
    name: string,
    status: '準備中' | '出題中' | '締切',
    maxPlayers: number,
    currentPlayers: number
  ): Game => {
    return new Game(
      new GameId(id),
      name,
      new GameStatus(status),
      maxPlayers,
      currentPlayers,
      new Date(),
      new Date()
    );
  };

  describe('execute', () => {
    it('should return games with 出題中 status', async () => {
      const mockRepo = createMockRepository();
      const acceptingGames = [
        createGame('550e8400-e29b-41d4-a716-446655440001', 'Game 1', '出題中', 10, 3),
        createGame('550e8400-e29b-41d4-a716-446655440002', 'Game 2', '出題中', 8, 5),
      ];

      vi.mocked(mockRepo.findByStatus).mockResolvedValue(acceptingGames);

      const useCase = new GetAvailableGames(mockRepo);
      const result = await useCase.execute();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Game 1',
        availableSlots: 7,
      });
      expect(result[1]).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Game 2',
        availableSlots: 3,
      });
    });

    it('should return empty array when no games are accepting', async () => {
      const mockRepo = createMockRepository();
      vi.mocked(mockRepo.findByStatus).mockResolvedValue([]);

      const useCase = new GetAvailableGames(mockRepo);
      const result = await useCase.execute();

      expect(result).toEqual([]);
    });

    it('should call repository with correct status', async () => {
      const mockRepo = createMockRepository();
      vi.mocked(mockRepo.findByStatus).mockResolvedValue([]);

      const useCase = new GetAvailableGames(mockRepo);
      await useCase.execute();

      expect(mockRepo.findByStatus).toHaveBeenCalledTimes(1);
      const calledStatus = vi.mocked(mockRepo.findByStatus).mock.calls[0][0];
      expect(calledStatus.value).toBe('出題中');
    });

    it('should calculate available slots correctly', async () => {
      const mockRepo = createMockRepository();
      const games = [
        createGame('550e8400-e29b-41d4-a716-446655440001', 'Full Game', '出題中', 10, 10),
        createGame('550e8400-e29b-41d4-a716-446655440002', 'Empty Game', '出題中', 20, 0),
        createGame('550e8400-e29b-41d4-a716-446655440003', 'Partial Game', '出題中', 15, 7),
      ];

      vi.mocked(mockRepo.findByStatus).mockResolvedValue(games);

      const useCase = new GetAvailableGames(mockRepo);
      const result = await useCase.execute();

      expect(result[0].availableSlots).toBe(0); // Full
      expect(result[1].availableSlots).toBe(20); // Empty
      expect(result[2].availableSlots).toBe(8); // Partial
    });

    it('should convert Game entities to GameDto correctly', async () => {
      const mockRepo = createMockRepository();
      const game = createGame(
        '550e8400-e29b-41d4-a716-446655440001',
        'Test Game',
        '出題中',
        10,
        3
      );

      vi.mocked(mockRepo.findByStatus).mockResolvedValue([game]);

      const useCase = new GetAvailableGames(mockRepo);
      const result = await useCase.execute();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('availableSlots');
      expect(result[0]).not.toHaveProperty('status');
      expect(result[0]).not.toHaveProperty('maxPlayers');
      expect(result[0]).not.toHaveProperty('currentPlayers');
    });

    it('should handle multiple games with same properties', async () => {
      const mockRepo = createMockRepository();
      const games = [
        createGame('550e8400-e29b-41d4-a716-446655440001', 'Game', '出題中', 10, 5),
        createGame('550e8400-e29b-41d4-a716-446655440002', 'Game', '出題中', 10, 5),
      ];

      vi.mocked(mockRepo.findByStatus).mockResolvedValue(games);

      const useCase = new GetAvailableGames(mockRepo);
      const result = await useCase.execute();

      expect(result).toHaveLength(2);
      expect(result[0].id).not.toBe(result[1].id); // Different IDs
      expect(result[0].name).toBe(result[1].name); // Same name
      expect(result[0].availableSlots).toBe(result[1].availableSlots); // Same slots
    });

    it('should handle repository errors', async () => {
      const mockRepo = createMockRepository();
      const error = new Error('Database connection failed');
      vi.mocked(mockRepo.findByStatus).mockRejectedValue(error);

      const useCase = new GetAvailableGames(mockRepo);

      await expect(useCase.execute()).rejects.toThrow('Database connection failed');
    });
  });
});
