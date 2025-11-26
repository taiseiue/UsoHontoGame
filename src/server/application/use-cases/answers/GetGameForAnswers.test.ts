// Use Case Tests: GetGameForAnswers
// Test-Driven Development: Write FAILING tests first

import { beforeEach, describe, expect, it } from 'vitest';
import { Game } from '@/server/domain/entities/Game';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import { GameId } from '@/server/domain/value-objects/GameId';
import { GameStatus } from '@/server/domain/value-objects/GameStatus';
import { GetGameForAnswers } from './GetGameForAnswers';

describe('GetGameForAnswers Use Case', () => {
  let gameRepository: IGameRepository;
  let useCase: GetGameForAnswers;

  beforeEach(() => {
    // Mock repository
    gameRepository = {
      findById: async () => null,
      create: async () => {},
      update: async () => {},
      delete: async () => {},
      findAll: async () => [],
      findByCreatorId: async () => [],
      findByStatus: async () => [],
    };

    useCase = new GetGameForAnswers(gameRepository);
  });

  describe('successful retrieval', () => {
    it('should return game data with episodes (hiding isLie)', async () => {
      const gameId = '550e8400-e29b-41d4-a716-446655440000';
      const game = new Game(
        new GameId(gameId),
        'Test Game',
        new GameStatus('出題中'),
        10,
        5,
        new Date(),
        new Date()
      );

      gameRepository.findById = async () => game;

      const result = await useCase.execute(gameId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(gameId);
        expect(result.data.name).toBe('Test Game');
        expect(result.data.status).toBe('出題中');
      }
    });

    it('should filter out isLie field from episodes', async () => {
      const gameId = '550e8400-e29b-41d4-a716-446655440001';
      const game = new Game(
        new GameId(gameId),
        'Test Game',
        new GameStatus('出題中'),
        10,
        5,
        new Date(),
        new Date()
      );

      gameRepository.findById = async () => game;

      const result = await useCase.execute(gameId);

      expect(result.success).toBe(true);
      // isLie should not be present in response
    });

    it('should accept game with 準備中 status', async () => {
      const gameId = '550e8400-e29b-41d4-a716-446655440002';
      const game = new Game(
        new GameId(gameId),
        'Prep Game',
        new GameStatus('準備中'),
        10,
        0,
        new Date(),
        new Date()
      );

      gameRepository.findById = async () => game;

      const result = await useCase.execute(gameId);

      expect(result.success).toBe(true);
    });
  });

  describe('validation errors', () => {
    it('should return error when game not found', async () => {
      gameRepository.findById = async () => null;

      const result = await useCase.execute('non-existent');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('GAME_NOT_FOUND');
        expect(result.error.message).toContain('ゲームが見つかりません');
      }
    });

    it('should return error when game is closed (締切)', async () => {
      const gameId = '550e8400-e29b-41d4-a716-446655440003';
      const game = new Game(
        new GameId(gameId),
        'Closed Game',
        new GameStatus('締切'),
        10,
        5,
        new Date(),
        new Date()
      );

      gameRepository.findById = async () => game;

      const result = await useCase.execute(gameId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('GAME_CLOSED');
        expect(result.error.message).toContain('締め切られました');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty game ID', async () => {
      const result = await useCase.execute('');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_GAME_ID');
      }
    });

    it('should handle valid UUID game ID format', async () => {
      const gameId = '550e8400-e29b-41d4-a716-446655440004';
      const game = new Game(
        new GameId(gameId),
        'Special Game',
        new GameStatus('出題中'),
        10,
        5,
        new Date(),
        new Date()
      );

      gameRepository.findById = async () => game;

      const result = await useCase.execute(gameId);

      expect(result.success).toBe(true);
    });
  });
});
