// Unit Tests: GetResults Use Case
// Feature: 006-results-dashboard, User Story 3
// Tests for average and median score calculations

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AnswerEntity } from '@/server/domain/entities/Answer';
import type { EpisodeEntity } from '@/server/domain/entities/Episode';
import type { GameEntity } from '@/server/domain/entities/Game';
import type { PresenterEntity } from '@/server/domain/entities/Presenter';
import type { IAnswerRepository } from '@/server/domain/repositories/IAnswerRepository';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import { GameId } from '@/server/domain/value-objects/GameId';
import { GameStatus } from '@/server/domain/value-objects/GameStatus';
import { GetResults } from './GetResults';

describe('GetResults Use Case', () => {
  let mockGameRepository: IGameRepository;
  let mockAnswerRepository: IAnswerRepository;
  let useCase: GetResults;

  beforeEach(() => {
    mockGameRepository = {
      findById: vi.fn(),
      findPresentersByGameId: vi.fn(),
      findEpisodesByPresenterId: vi.fn(),
    } as unknown as IGameRepository;

    mockAnswerRepository = {
      findByGameId: vi.fn(),
    } as unknown as IAnswerRepository;

    useCase = new GetResults(mockGameRepository, mockAnswerRepository);
  });

  describe('Statistics Calculations', () => {
    it('should calculate correct average and median for basic scenario (3 participants: 20, 10, 0)', async () => {
      // Arrange: 3 participants with scores 20, 10, 0
      // Expected: average = 10.0, median = 10.0
      const gameId = '550e8400-e29b-41d4-a716-446655440000';
      const mockGame: Partial<GameEntity> = {
        id: new GameId(gameId),
        name: 'Test Game',
        status: GameStatus.fromString('締切'),
      };

      const presenter: Partial<PresenterEntity> = {
        id: 'presenter-1',
        nickname: 'Presenter A',
      };

      const episodes: Partial<EpisodeEntity>[] = [
        { id: 'ep-1', text: 'Episode 1', isLie: false },
        { id: 'ep-2', text: 'Episode 2 (LIE)', isLie: true },
        { id: 'ep-3', text: 'Episode 3', isLie: false },
      ];

      const answers: Partial<AnswerEntity>[] = [
        {
          nickname: 'Alice',
          selections: new Map([['presenter-1', 'ep-2']]), // Correct (10 points)
        },
        {
          nickname: 'Bob',
          selections: new Map([['presenter-1', 'ep-2']]), // Correct (10 points)
        },
        {
          nickname: 'Charlie',
          selections: new Map([['presenter-1', 'ep-1']]), // Wrong (0 points)
        },
      ];

      vi.mocked(mockGameRepository.findById).mockResolvedValue(mockGame as GameEntity);
      vi.mocked(mockGameRepository.findPresentersByGameId).mockResolvedValue([
        presenter as PresenterEntity,
      ]);
      vi.mocked(mockGameRepository.findEpisodesByPresenterId).mockResolvedValue(
        episodes as EpisodeEntity[]
      );
      vi.mocked(mockAnswerRepository.findByGameId).mockResolvedValue(answers as AnswerEntity[]);

      // Act
      const result = await useCase.execute(gameId);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.averageScore).toBe(10.0);
        expect(result.data.medianScore).toBe(10.0);
        expect(result.data.highestScore).toBe(10);
        expect(result.data.totalParticipants).toBe(3);
      }
    });

    it('should calculate correct average and median for odd participants (5 participants)', async () => {
      // Arrange: 5 participants with scores 30, 20, 15, 10, 5
      // Expected: average = 16.0, median = 15.0 (middle value)
      const gameId = '550e8400-e29b-41d4-a716-446655440001';
      const mockGame: Partial<GameEntity> = {
        id: new GameId(gameId),
        name: 'Test Game',
        status: GameStatus.fromString('締切'),
      };

      const _presenter: Partial<PresenterEntity> = {
        id: 'presenter-1',
        nickname: 'Presenter A',
      };

      const episodes: Partial<EpisodeEntity>[] = [
        { id: 'ep-1', text: 'Episode 1', isLie: true },
        { id: 'ep-2', text: 'Episode 2', isLie: false },
        { id: 'ep-3', text: 'Episode 3', isLie: false },
      ];

      // Create 3 presenters to achieve various scores
      const presenters: Partial<PresenterEntity>[] = [
        { id: 'presenter-1', nickname: 'Presenter 1' },
        { id: 'presenter-2', nickname: 'Presenter 2' },
        { id: 'presenter-3', nickname: 'Presenter 3' },
      ];

      const answers: Partial<AnswerEntity>[] = [
        {
          nickname: 'Alice',
          selections: new Map([
            ['presenter-1', 'ep-1'],
            ['presenter-2', 'ep-1'],
            ['presenter-3', 'ep-1'],
          ]), // 3 correct = 30 points
        },
        {
          nickname: 'Bob',
          selections: new Map([
            ['presenter-1', 'ep-1'],
            ['presenter-2', 'ep-1'],
            ['presenter-3', 'ep-2'],
          ]), // 2 correct = 20 points
        },
        {
          nickname: 'Charlie',
          selections: new Map([
            ['presenter-1', 'ep-2'],
            ['presenter-2', 'ep-1'],
            ['presenter-3', 'ep-1'],
          ]), // 2 correct, but different = 20 points
          // To get 15 points, let's make it 1.5 correct somehow... Actually, let's adjust
        },
        {
          nickname: 'David',
          selections: new Map([
            ['presenter-1', 'ep-1'],
            ['presenter-2', 'ep-2'],
            ['presenter-3', 'ep-2'],
          ]), // 1 correct = 10 points
        },
        {
          nickname: 'Eve',
          selections: new Map([
            ['presenter-1', 'ep-2'],
            ['presenter-2', 'ep-2'],
            ['presenter-3', 'ep-2'],
          ]), // 0 correct = 0 points
        },
      ];

      // Adjust to get exact scores: 30, 20, 20, 10, 0 = average 16.0, median 20.0
      // Let me recalculate to match the expected values from the plan

      vi.mocked(mockGameRepository.findById).mockResolvedValue(mockGame as GameEntity);
      vi.mocked(mockGameRepository.findPresentersByGameId).mockResolvedValue(
        presenters as PresenterEntity[]
      );
      vi.mocked(mockGameRepository.findEpisodesByPresenterId).mockResolvedValue(
        episodes as EpisodeEntity[]
      );
      vi.mocked(mockAnswerRepository.findByGameId).mockResolvedValue(answers as AnswerEntity[]);

      // Act
      const result = await useCase.execute(gameId);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        // With scores [30, 20, 20, 10, 0]: average = 80/5 = 16.0, median = 20 (middle value in sorted [0, 10, 20, 20, 30])
        expect(result.data.averageScore).toBe(16.0);
        expect(result.data.medianScore).toBe(20.0); // Middle value
      }
    });

    it('should calculate correct median for even participants using average of two middle values', async () => {
      // Arrange: 4 participants with scores 30, 20, 10, 0
      // Expected: average = 15.0, median = 15.0 (average of 20 and 10)
      const gameId = '550e8400-e29b-41d4-a716-446655440002';
      const mockGame: Partial<GameEntity> = {
        id: new GameId(gameId),
        name: 'Test Game',
        status: GameStatus.fromString('締切'),
      };

      const presenters: Partial<PresenterEntity>[] = [
        { id: 'presenter-1', nickname: 'Presenter 1' },
        { id: 'presenter-2', nickname: 'Presenter 2' },
        { id: 'presenter-3', nickname: 'Presenter 3' },
      ];

      const episodes: Partial<EpisodeEntity>[] = [
        { id: 'ep-1', text: 'Episode 1', isLie: true },
        { id: 'ep-2', text: 'Episode 2', isLie: false },
      ];

      const answers: Partial<AnswerEntity>[] = [
        {
          nickname: 'Alice',
          selections: new Map([
            ['presenter-1', 'ep-1'],
            ['presenter-2', 'ep-1'],
            ['presenter-3', 'ep-1'],
          ]), // 3 correct = 30 points
        },
        {
          nickname: 'Bob',
          selections: new Map([
            ['presenter-1', 'ep-1'],
            ['presenter-2', 'ep-1'],
            ['presenter-3', 'ep-2'],
          ]), // 2 correct = 20 points
        },
        {
          nickname: 'Charlie',
          selections: new Map([
            ['presenter-1', 'ep-1'],
            ['presenter-2', 'ep-2'],
            ['presenter-3', 'ep-2'],
          ]), // 1 correct = 10 points
        },
        {
          nickname: 'David',
          selections: new Map([
            ['presenter-1', 'ep-2'],
            ['presenter-2', 'ep-2'],
            ['presenter-3', 'ep-2'],
          ]), // 0 correct = 0 points
        },
      ];

      vi.mocked(mockGameRepository.findById).mockResolvedValue(mockGame as GameEntity);
      vi.mocked(mockGameRepository.findPresentersByGameId).mockResolvedValue(
        presenters as PresenterEntity[]
      );
      vi.mocked(mockGameRepository.findEpisodesByPresenterId).mockResolvedValue(
        episodes as EpisodeEntity[]
      );
      vi.mocked(mockAnswerRepository.findByGameId).mockResolvedValue(answers as AnswerEntity[]);

      // Act
      const result = await useCase.execute(gameId);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        // Scores: [30, 20, 10, 0], sorted: [0, 10, 20, 30]
        // Median = (10 + 20) / 2 = 15.0
        expect(result.data.averageScore).toBe(15.0);
        expect(result.data.medianScore).toBe(15.0);
      }
    });

    it('should handle single participant correctly', async () => {
      // Arrange: 1 participant with score 20
      // Expected: average = 20.0, median = 20.0
      const gameId = '550e8400-e29b-41d4-a716-446655440003';
      const mockGame: Partial<GameEntity> = {
        id: new GameId(gameId),
        name: 'Test Game',
        status: GameStatus.fromString('締切'),
      };

      const _presenter: Partial<PresenterEntity> = {
        id: 'presenter-1',
        nickname: 'Presenter A',
      };

      const episodes: Partial<EpisodeEntity>[] = [
        { id: 'ep-1', text: 'Episode 1', isLie: true },
        { id: 'ep-2', text: 'Episode 2', isLie: false },
      ];

      const _answers: Partial<AnswerEntity>[] = [
        {
          nickname: 'Alice',
          selections: new Map([['presenter-1', 'ep-1']]), // 1 correct = 10 points
        },
      ];

      // Actually, to get 20 points, I need 2 presenters
      const presenters: Partial<PresenterEntity>[] = [
        { id: 'presenter-1', nickname: 'Presenter 1' },
        { id: 'presenter-2', nickname: 'Presenter 2' },
      ];

      const singleAnswer: Partial<AnswerEntity>[] = [
        {
          nickname: 'Alice',
          selections: new Map([
            ['presenter-1', 'ep-1'],
            ['presenter-2', 'ep-1'],
          ]), // 2 correct = 20 points
        },
      ];

      vi.mocked(mockGameRepository.findById).mockResolvedValue(mockGame as GameEntity);
      vi.mocked(mockGameRepository.findPresentersByGameId).mockResolvedValue(
        presenters as PresenterEntity[]
      );
      vi.mocked(mockGameRepository.findEpisodesByPresenterId).mockResolvedValue(
        episodes as EpisodeEntity[]
      );
      vi.mocked(mockAnswerRepository.findByGameId).mockResolvedValue(
        singleAnswer as AnswerEntity[]
      );

      // Act
      const result = await useCase.execute(gameId);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.averageScore).toBe(20.0);
        expect(result.data.medianScore).toBe(20.0);
        expect(result.data.totalParticipants).toBe(1);
      }
    });

    it('should handle zero participants correctly', async () => {
      // Arrange: 0 participants
      // Expected: average = 0, median = 0
      const gameId = '550e8400-e29b-41d4-a716-446655440004';
      const mockGame: Partial<GameEntity> = {
        id: new GameId(gameId),
        name: 'Test Game',
        status: GameStatus.fromString('締切'),
      };

      vi.mocked(mockGameRepository.findById).mockResolvedValue(mockGame as GameEntity);
      vi.mocked(mockGameRepository.findPresentersByGameId).mockResolvedValue([]);
      vi.mocked(mockAnswerRepository.findByGameId).mockResolvedValue([]);

      // Act
      const result = await useCase.execute(gameId);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.averageScore).toBe(0);
        expect(result.data.medianScore).toBe(0);
        expect(result.data.highestScore).toBe(0);
        expect(result.data.totalParticipants).toBe(0);
      }
    });

    it('should round decimal values to exactly 1 decimal place', async () => {
      // Arrange: 3 participants with scores that produce decimal average
      // Scores: 10, 15, 18 => average = 43/3 = 14.333... => rounded to 14.3
      const gameId = '550e8400-e29b-41d4-a716-446655440005';
      const mockGame: Partial<GameEntity> = {
        id: new GameId(gameId),
        name: 'Test Game',
        status: GameStatus.fromString('締切'),
      };

      const _presenter: Partial<PresenterEntity> = {
        id: 'presenter-1',
        nickname: 'Presenter A',
      };

      const episodes: Partial<EpisodeEntity>[] = [
        { id: 'ep-1', text: 'Episode 1', isLie: true },
        { id: 'ep-2', text: 'Episode 2', isLie: false },
      ];

      // To get scores 10, 15, 18, I need to be creative
      // Let's use different numbers of presenters for each answer
      // But wait, all answers must have the same presenters...
      // I can't easily get 18 points (not divisible by 10)
      // Let me adjust: use 10, 15, 15 which gives average = 40/3 = 13.333... = 13.3
      // Actually, let me recalculate with a different approach

      // Let's just test with 3 participants having scores 10, 10, 10 to verify rounding works
      // Then manually verify that 43/3 = 14.333 rounds to 14.3
      // Better approach: Use 3 participants with carefully chosen scores

      const presenters: Partial<PresenterEntity>[] = [
        { id: 'presenter-1', nickname: 'Presenter 1' },
        { id: 'presenter-2', nickname: 'Presenter 2' },
        { id: 'presenter-3', nickname: 'Presenter 3' },
      ];

      // To get decimal: 1 person gets 10 (1 correct), 1 gets 20 (2 correct), 1 gets 30 (3 correct)
      // Average = 60/3 = 20.0 (no decimal)
      // Let me use a different combination: 10, 10, 20 => 40/3 = 13.333... = 13.3
      const answers: Partial<AnswerEntity>[] = [
        {
          nickname: 'Alice',
          selections: new Map([
            ['presenter-1', 'ep-1'],
            ['presenter-2', 'ep-2'],
            ['presenter-3', 'ep-2'],
          ]), // 1 correct = 10 points
        },
        {
          nickname: 'Bob',
          selections: new Map([
            ['presenter-1', 'ep-1'],
            ['presenter-2', 'ep-2'],
            ['presenter-3', 'ep-2'],
          ]), // 1 correct = 10 points
        },
        {
          nickname: 'Charlie',
          selections: new Map([
            ['presenter-1', 'ep-1'],
            ['presenter-2', 'ep-1'],
            ['presenter-3', 'ep-2'],
          ]), // 2 correct = 20 points
        },
      ];

      vi.mocked(mockGameRepository.findById).mockResolvedValue(mockGame as GameEntity);
      vi.mocked(mockGameRepository.findPresentersByGameId).mockResolvedValue(
        presenters as PresenterEntity[]
      );
      vi.mocked(mockGameRepository.findEpisodesByPresenterId).mockResolvedValue(
        episodes as EpisodeEntity[]
      );
      vi.mocked(mockAnswerRepository.findByGameId).mockResolvedValue(answers as AnswerEntity[]);

      // Act
      const result = await useCase.execute(gameId);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        // 10 + 10 + 20 = 40, 40/3 = 13.333... => 13.3
        expect(result.data.averageScore).toBe(13.3);
        // Median of [10, 10, 20] = 10
        expect(result.data.medianScore).toBe(10.0);
      }
    });
  });

  describe('Error Cases', () => {
    it('should return error when game not found', async () => {
      // Arrange
      const gameId = '550e8400-e29b-41d4-a716-446655440006';
      vi.mocked(mockGameRepository.findById).mockResolvedValue(null);

      // Act
      const result = await useCase.execute(gameId);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain('Game not found');
      }
    });

    it('should return error when game status is not 締切', async () => {
      // Arrange
      const gameId = '550e8400-e29b-41d4-a716-446655440007';
      const mockGame: Partial<GameEntity> = {
        id: new GameId(gameId),
        name: 'Test Game',
        status: GameStatus.fromString('出題中'), // Wrong status
      };

      vi.mocked(mockGameRepository.findById).mockResolvedValue(mockGame as GameEntity);

      // Act
      const result = await useCase.execute(gameId);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form[0]).toContain('Results only available when game status is');
      }
    });

    it('should return error when game status is 準備中', async () => {
      // Arrange
      const gameId = '550e8400-e29b-41d4-a716-446655440008';
      const mockGame: Partial<GameEntity> = {
        id: new GameId(gameId),
        name: 'Test Game',
        status: GameStatus.fromString('準備中'), // Wrong status
      };

      vi.mocked(mockGameRepository.findById).mockResolvedValue(mockGame as GameEntity);

      // Act
      const result = await useCase.execute(gameId);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form[0]).toContain('Results only available when game status is');
      }
    });
  });

  describe('Rankings and Winner Detection', () => {
    it('should correctly identify winners (rank === 1)', async () => {
      // Arrange
      const gameId = '550e8400-e29b-41d4-a716-446655440009';
      const mockGame: Partial<GameEntity> = {
        id: new GameId(gameId),
        name: 'Test Game',
        status: GameStatus.fromString('締切'),
      };

      const presenter: Partial<PresenterEntity> = {
        id: 'presenter-1',
        nickname: 'Presenter A',
      };

      const episodes: Partial<EpisodeEntity>[] = [
        { id: 'ep-1', text: 'Episode 1', isLie: true },
        { id: 'ep-2', text: 'Episode 2', isLie: false },
      ];

      const answers: Partial<AnswerEntity>[] = [
        {
          nickname: 'Alice',
          selections: new Map([['presenter-1', 'ep-1']]), // Correct
        },
        {
          nickname: 'Bob',
          selections: new Map([['presenter-1', 'ep-2']]), // Wrong
        },
      ];

      vi.mocked(mockGameRepository.findById).mockResolvedValue(mockGame as GameEntity);
      vi.mocked(mockGameRepository.findPresentersByGameId).mockResolvedValue([
        presenter as PresenterEntity,
      ]);
      vi.mocked(mockGameRepository.findEpisodesByPresenterId).mockResolvedValue(
        episodes as EpisodeEntity[]
      );
      vi.mocked(mockAnswerRepository.findByGameId).mockResolvedValue(answers as AnswerEntity[]);

      // Act
      const result = await useCase.execute(gameId);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        const winner = result.data.rankings.find((r) => r.isWinner);
        expect(winner).toBeDefined();
        expect(winner?.nickname).toBe('Alice');
        expect(winner?.rank).toBe(1);
        expect(winner?.totalScore).toBe(10);
      }
    });

    it('should handle tied winners correctly', async () => {
      // Arrange: Both participants get same score
      const gameId = '550e8400-e29b-41d4-a716-44665544000a';
      const mockGame: Partial<GameEntity> = {
        id: new GameId(gameId),
        name: 'Test Game',
        status: GameStatus.fromString('締切'),
      };

      const presenter: Partial<PresenterEntity> = {
        id: 'presenter-1',
        nickname: 'Presenter A',
      };

      const episodes: Partial<EpisodeEntity>[] = [
        { id: 'ep-1', text: 'Episode 1', isLie: true },
        { id: 'ep-2', text: 'Episode 2', isLie: false },
      ];

      const answers: Partial<AnswerEntity>[] = [
        {
          nickname: 'Alice',
          selections: new Map([['presenter-1', 'ep-1']]), // Correct
        },
        {
          nickname: 'Bob',
          selections: new Map([['presenter-1', 'ep-1']]), // Correct
        },
      ];

      vi.mocked(mockGameRepository.findById).mockResolvedValue(mockGame as GameEntity);
      vi.mocked(mockGameRepository.findPresentersByGameId).mockResolvedValue([
        presenter as PresenterEntity,
      ]);
      vi.mocked(mockGameRepository.findEpisodesByPresenterId).mockResolvedValue(
        episodes as EpisodeEntity[]
      );
      vi.mocked(mockAnswerRepository.findByGameId).mockResolvedValue(answers as AnswerEntity[]);

      // Act
      const result = await useCase.execute(gameId);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        const winners = result.data.rankings.filter((r) => r.isWinner);
        expect(winners).toHaveLength(2); // Both are winners
        expect(winners[0].rank).toBe(1);
        expect(winners[1].rank).toBe(1);
      }
    });
  });
});
