import { beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest';
import type { Game } from '../../../domain/entities/Game';
import { StatusTransitionError } from '../../../domain/errors/StatusTransitionError';
import type { IGameRepository } from '../../../domain/repositories/IGameRepository';
import { GameStatus } from '../../../domain/value-objects/GameStatus';
import { ValidateStatusTransition } from './ValidateStatusTransition';

describe('ValidateStatusTransition', () => {
  let validateStatusTransition: ValidateStatusTransition;
  let mockGameRepository: {
    findById: MockedFunction<(...args: never[]) => unknown>;
    findByCreatorId: MockedFunction<(...args: never[]) => unknown>;
    findAll: MockedFunction<(...args: never[]) => unknown>;
    findByStatus: MockedFunction<(...args: never[]) => unknown>;
    create: MockedFunction<(...args: never[]) => unknown>;
    update: MockedFunction<(...args: never[]) => unknown>;
    delete: MockedFunction<(...args: never[]) => unknown>;
    findPresentersByGameId: MockedFunction<(...args: never[]) => unknown>;
    findPresenterById: MockedFunction<(...args: never[]) => unknown>;
    addPresenter: MockedFunction<(...args: never[]) => unknown>;
    createPresenterWithEpisodes: MockedFunction<(...args: never[]) => unknown>;
    removePresenter: MockedFunction<(...args: never[]) => unknown>;
    findEpisodesByPresenterId: MockedFunction<(...args: never[]) => unknown>;
    addEpisode: MockedFunction<(...args: never[]) => unknown>;
    removeEpisode: MockedFunction<(...args: never[]) => unknown>;
    updateEpisode: MockedFunction<(...args: never[]) => unknown>;
  };

  const mockGameBase = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Test Game',
    playerLimit: 10,
    creatorId: 'session-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    presenters: [],
  };

  beforeEach(() => {
    mockGameRepository = {
      findById: vi.fn(),
      findByCreatorId: vi.fn(),
      findAll: vi.fn(),
      findByStatus: vi.fn(),
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
    };

    validateStatusTransition = new ValidateStatusTransition(mockGameRepository as IGameRepository);
  });

  describe('準備中 → 出題中 transition', () => {
    it('should validate successful transition with complete presenters', async () => {
      // Arrange
      const game: Game = {
        ...mockGameBase,
        status: GameStatus.preparation(),
        presenters: [
          {
            id: 'presenter-1',
            gameId: '550e8400-e29b-41d4-a716-446655440001',
            nickname: 'Test Presenter',
            episodes: [
              { id: 'ep1', presenterId: 'presenter-1', text: 'Truth 1', isLie: false },
              { id: 'ep2', presenterId: 'presenter-1', text: 'Truth 2', isLie: false },
              { id: 'ep3', presenterId: 'presenter-1', text: 'Lie', isLie: true },
            ],
          },
        ],
      };

      mockGameRepository.findById.mockResolvedValue(game);
      mockGameRepository.findPresentersByGameId.mockResolvedValue(game.presenters);
      mockGameRepository.findEpisodesByPresenterId.mockResolvedValue(game.presenters[0].episodes);

      // Act
      const result = await validateStatusTransition.execute(
        '550e8400-e29b-41d4-a716-446655440001',
        '出題中',
        'session-123'
      );

      // Assert
      expect(result.canTransition).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.currentStatus).toBe('準備中');
      expect(result.targetStatus).toBe('出題中');
    });

    it('should reject transition with no presenters', async () => {
      // Arrange
      const game: Game = {
        ...mockGameBase,
        status: GameStatus.preparation(),
        presenters: [],
      };

      mockGameRepository.findById.mockResolvedValue(game);
      mockGameRepository.findPresentersByGameId.mockResolvedValue([]);

      // Act
      const result = await validateStatusTransition.execute(
        '550e8400-e29b-41d4-a716-446655440001',
        '出題中',
        'session-123'
      );

      // Assert
      expect(result.canTransition).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('NO_PRESENTERS');
      expect(result.errors[0].message).toBe('ゲームを開始するには出題者が必要です');
    });

    it('should reject transition with incomplete presenter (less than 3 episodes)', async () => {
      // Arrange
      const game: Game = {
        ...mockGameBase,
        status: GameStatus.preparation(),
        presenters: [
          {
            id: 'presenter-1',
            gameId: '550e8400-e29b-41d4-a716-446655440001',
            nickname: 'Incomplete Presenter',
            episodes: [
              { id: 'ep1', presenterId: 'presenter-1', text: 'Truth 1', isLie: false },
              { id: 'ep2', presenterId: 'presenter-1', text: 'Truth 2', isLie: false },
            ],
          },
        ],
      };

      mockGameRepository.findById.mockResolvedValue(game);
      mockGameRepository.findPresentersByGameId.mockResolvedValue(game.presenters);
      mockGameRepository.findEpisodesByPresenterId.mockResolvedValue(game.presenters[0].episodes);

      // Act
      const result = await validateStatusTransition.execute(
        '550e8400-e29b-41d4-a716-446655440001',
        '出題中',
        'session-123'
      );

      // Assert
      expect(result.canTransition).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('INCOMPLETE_PRESENTER');
      expect(result.errors[0].message).toBe('出題者 Incomplete Presenter のエピソードが不完全です');
    });

    it('should reject transition with invalid lie count (no lies)', async () => {
      // Arrange
      const game: Game = {
        ...mockGameBase,
        status: GameStatus.preparation(),
        presenters: [
          {
            id: 'presenter-1',
            gameId: '550e8400-e29b-41d4-a716-446655440001',
            nickname: 'No Lie Presenter',
            episodes: [
              { id: 'ep1', presenterId: 'presenter-1', text: 'Truth 1', isLie: false },
              { id: 'ep2', presenterId: 'presenter-1', text: 'Truth 2', isLie: false },
              { id: 'ep3', presenterId: 'presenter-1', text: 'Truth 3', isLie: false },
            ],
          },
        ],
      };

      mockGameRepository.findById.mockResolvedValue(game);
      mockGameRepository.findPresentersByGameId.mockResolvedValue(game.presenters);
      mockGameRepository.findEpisodesByPresenterId.mockResolvedValue(game.presenters[0].episodes);

      // Act
      const result = await validateStatusTransition.execute(
        '550e8400-e29b-41d4-a716-446655440001',
        '出題中',
        'session-123'
      );

      // Assert
      expect(result.canTransition).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('INVALID_LIE_COUNT');
      expect(result.errors[0].message).toBe(
        '出題者 No Lie Presenter はウソを1つ選択する必要があります'
      );
    });

    it('should reject transition with invalid lie count (multiple lies)', async () => {
      // Arrange
      const game: Game = {
        ...mockGameBase,
        status: GameStatus.preparation(),
        presenters: [
          {
            id: 'presenter-1',
            gameId: '550e8400-e29b-41d4-a716-446655440001',
            nickname: 'Multiple Lies Presenter',
            episodes: [
              { id: 'ep1', presenterId: 'presenter-1', text: 'Lie 1', isLie: true },
              { id: 'ep2', presenterId: 'presenter-1', text: 'Truth', isLie: false },
              { id: 'ep3', presenterId: 'presenter-1', text: 'Lie 2', isLie: true },
            ],
          },
        ],
      };

      mockGameRepository.findById.mockResolvedValue(game);
      mockGameRepository.findPresentersByGameId.mockResolvedValue(game.presenters);
      mockGameRepository.findEpisodesByPresenterId.mockResolvedValue(game.presenters[0].episodes);

      // Act
      const result = await validateStatusTransition.execute(
        '550e8400-e29b-41d4-a716-446655440001',
        '出題中',
        'session-123'
      );

      // Assert
      expect(result.canTransition).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('INVALID_LIE_COUNT');
      expect(result.errors[0].message).toBe(
        '出題者 Multiple Lies Presenter はウソを1つ選択する必要があります'
      );
    });
  });

  describe('出題中 → 締切 transition', () => {
    it('should validate successful transition from accepting responses to closed', async () => {
      // Arrange
      const game: Game = {
        ...mockGameBase,
        status: GameStatus.acceptingResponses(),
      };

      mockGameRepository.findById.mockResolvedValue(game);

      // Act
      const result = await validateStatusTransition.execute(
        '550e8400-e29b-41d4-a716-446655440001',
        '締切',
        'session-123'
      );

      // Assert
      expect(result.canTransition).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.currentStatus).toBe('出題中');
      expect(result.targetStatus).toBe('締切');
    });
  });

  describe('Invalid transitions', () => {
    it('should reject transition from 締切 status', async () => {
      // Arrange
      const game: Game = {
        ...mockGameBase,
        status: GameStatus.closed(),
      };

      mockGameRepository.findById.mockResolvedValue(game);

      // Act
      const result = await validateStatusTransition.execute(
        '550e8400-e29b-41d4-a716-446655440001',
        '出題中',
        'session-123'
      );

      // Assert
      expect(result.canTransition).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('GAME_ALREADY_CLOSED');
      expect(result.errors[0].message).toBe('締切状態のゲームは変更できません');
    });

    it('should reject invalid transition path (出題中 → 準備中)', async () => {
      // Arrange
      const game: Game = {
        ...mockGameBase,
        status: GameStatus.acceptingResponses(),
      };

      mockGameRepository.findById.mockResolvedValue(game);

      // Act & Assert
      await expect(
        validateStatusTransition.execute(
          '550e8400-e29b-41d4-a716-446655440001',
          '準備中' as never,
          'session-123'
        )
      ).rejects.toThrow(StatusTransitionError);
    });
  });

  describe('Authorization', () => {
    it('should reject transition by non-creator', async () => {
      // Arrange
      const game: Game = {
        ...mockGameBase,
        status: GameStatus.preparation(),
        creatorId: 'different-session',
      };

      mockGameRepository.findById.mockResolvedValue(game);

      // Act
      const result = await validateStatusTransition.execute(
        '550e8400-e29b-41d4-a716-446655440001',
        '出題中',
        'session-123'
      );

      // Assert
      expect(result.canTransition).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('UNAUTHORIZED');
      expect(result.errors[0].message).toBe('このゲームを変更する権限がありません');
    });
  });

  describe('Error handling', () => {
    it('should handle game not found', async () => {
      // Arrange
      mockGameRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        validateStatusTransition.execute(
          '550e8400-e29b-41d4-a716-446655440999',
          '出題中',
          'session-123'
        )
      ).rejects.toThrow('ゲームが見つかりません');
    });
  });
});
