// Use Case Tests: SubmitAnswer
// Test-Driven Development: Write FAILING tests first

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SubmitAnswerRequest } from '@/server/application/dto/requests/SubmitAnswerRequest';
import { Game } from '@/server/domain/entities/Game';
import type { IAnswerRepository } from '@/server/domain/repositories/IAnswerRepository';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import type { IParticipationRepository } from '@/server/domain/repositories/IParticipationRepository';
import { GameId } from '@/server/domain/value-objects/GameId';
import { GameStatus } from '@/server/domain/value-objects/GameStatus';
import { SubmitAnswer } from './SubmitAnswer';

describe('SubmitAnswer Use Case', () => {
  let answerRepository: IAnswerRepository;
  let participationRepository: IParticipationRepository;
  let gameRepository: IGameRepository;
  let useCase: SubmitAnswer;

  beforeEach(() => {
    // Mock repositories
    answerRepository = {
      upsert: async () => {},
      findBySessionAndGame: async () => null,
      findByGameId: async () => [],
      delete: async () => {},
      findSelectionsByAnswer: async () => [],
    };

    participationRepository = {
      create: async () => {},
      exists: async () => false,
      countByGameId: async () => 0,
      findBySessionAndGame: async () => null,
    };

    gameRepository = {
      findById: async () => null,
      create: async () => {},
      update: async () => {},
      delete: async () => {},
      findAll: async () => [],
      findByCreatorId: async () => [],
      findByStatus: async () => [],
      findPresentersByGameId: async () => [
        {
          id: 'presenter-1',
          gameId: 'game-123',
          sessionId: 'session-123',
          nickname: 'Presenter 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          getEpisodes: () => [],
          addEpisode: () => {},
          toJSON: () => ({
            id: 'presenter-1',
            gameId: 'game-123',
            sessionId: 'session-123',
            nickname: 'Presenter 1',
            createdAt: new Date(),
            updatedAt: new Date(),
            episodes: [],
          }),
        },
      ],
    };

    useCase = new SubmitAnswer(answerRepository, participationRepository, gameRepository);
  });

  describe('successful submission', () => {
    it('should create participation and upsert answer', async () => {
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
      participationRepository.exists = async () => false;

      const request: SubmitAnswerRequest = {
        gameId,
        sessionId: 'session-123',
        nickname: 'TestUser',
        selections: {
          'presenter-1': 'episode-1',
        },
      };

      const result = await useCase.execute(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.answerId).toBeTruthy();
        expect(result.data.message).toContain('回答を送信しました');
      }
    });

    it('should overwrite existing answer', async () => {
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
      participationRepository.exists = async () => true;

      const request: SubmitAnswerRequest = {
        gameId,
        sessionId: 'session-123',
        nickname: 'TestUser',
        selections: {
          'presenter-1': 'episode-2',
        },
      };

      const result = await useCase.execute(request);

      expect(result.success).toBe(true);
    });

    it('should increment currentPlayers and update game when new participant joins', async () => {
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

      const initialPlayerCount = game.currentPlayers;

      gameRepository.findById = async () => game;
      participationRepository.exists = async () => false;

      const updateSpy = vi.fn();
      gameRepository.update = updateSpy;

      const request: SubmitAnswerRequest = {
        gameId,
        sessionId: 'session-123',
        nickname: 'TestUser',
        selections: {
          'presenter-1': 'episode-1',
        },
      };

      const result = await useCase.execute(request);

      expect(result.success).toBe(true);
      expect(game.currentPlayers).toBe(initialPlayerCount + 1);
      expect(updateSpy).toHaveBeenCalledWith(game);
      expect(updateSpy).toHaveBeenCalledTimes(1);
    });

    it('should NOT increment currentPlayers when existing participant resubmits', async () => {
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

      const initialPlayerCount = game.currentPlayers;

      gameRepository.findById = async () => game;
      participationRepository.exists = async () => true; // Existing participant

      const updateSpy = vi.fn();
      gameRepository.update = updateSpy;

      const request: SubmitAnswerRequest = {
        gameId,
        sessionId: 'session-123',
        nickname: 'TestUser',
        selections: {
          'presenter-1': 'episode-2',
        },
      };

      const result = await useCase.execute(request);

      expect(result.success).toBe(true);
      expect(game.currentPlayers).toBe(initialPlayerCount); // Should not change
      expect(updateSpy).not.toHaveBeenCalled(); // Should not be called
    });
  });

  describe('validation errors', () => {
    it('should reject when game not found', async () => {
      gameRepository.findById = async () => null;

      const request: SubmitAnswerRequest = {
        gameId: '550e8400-e29b-41d4-a716-446655440002',
        sessionId: 'session-123',
        nickname: 'TestUser',
        selections: {
          'presenter-1': 'episode-1',
        },
      };

      const result = await useCase.execute(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('GAME_NOT_FOUND');
      }
    });

    it('should reject when game is closed', async () => {
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

      const request: SubmitAnswerRequest = {
        gameId,
        sessionId: 'session-123',
        nickname: 'TestUser',
        selections: {
          'presenter-1': 'episode-1',
        },
      };

      const result = await useCase.execute(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('GAME_CLOSED');
      }
    });

    it('should reject empty selections', async () => {
      const gameId = '550e8400-e29b-41d4-a716-446655440004';
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

      const request: SubmitAnswerRequest = {
        gameId,
        sessionId: 'session-123',
        nickname: 'TestUser',
        selections: {},
      };

      const result = await useCase.execute(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_SELECTIONS');
      }
    });

    it('should reject when participant limit reached', async () => {
      const gameId = '550e8400-e29b-41d4-a716-446655440005';
      const game = new Game(
        new GameId(gameId),
        'Test Game',
        new GameStatus('出題中'),
        5,
        5,
        new Date(),
        new Date()
      );

      gameRepository.findById = async () => game;
      participationRepository.exists = async () => false;
      participationRepository.countByGameId = async () => 5;

      const request: SubmitAnswerRequest = {
        gameId,
        sessionId: 'new-session',
        nickname: 'NewUser',
        selections: {
          'presenter-1': 'episode-1',
        },
      };

      const result = await useCase.execute(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('PARTICIPANT_LIMIT_REACHED');
      }
    });
  });
});
