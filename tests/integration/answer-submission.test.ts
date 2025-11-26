/**
 * Integration Test: Answer Submission Flow
 * Feature: 001-lie-detection-answers (User Story 1)
 * Task: T046
 *
 * Tests the complete answer submission flow:
 * 1. Create participation record
 * 2. Submit answer (upsert)
 * 3. Verify database state
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { GetGameForAnswers } from '@/server/application/use-cases/answers/GetGameForAnswers';
import { SubmitAnswer } from '@/server/application/use-cases/answers/SubmitAnswer';
import { AddPresenterWithEpisodes } from '@/server/application/use-cases/games/AddPresenterWithEpisodes';
import { CreateGame } from '@/server/application/use-cases/games/CreateGame';
import { StartAcceptingResponses } from '@/server/application/use-cases/games/StartAcceptingResponses';
import type { IAnswerRepository } from '@/server/domain/repositories/IAnswerRepository';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import type { IParticipationRepository } from '@/server/domain/repositories/IParticipationRepository';
import { GameId } from '@/server/domain/value-objects/GameId';
import { PrismaAnswerRepository } from '@/server/infrastructure/repositories/PrismaAnswerRepository';
import { PrismaGameRepository } from '@/server/infrastructure/repositories/PrismaGameRepository';
import { PrismaParticipationRepository } from '@/server/infrastructure/repositories/PrismaParticipationRepository';
import { createTestDatabase, type TestDatabase } from '../utils/test-database';

describe('Answer Submission Integration', () => {
  let testDb: TestDatabase;
  let gameRepository: IGameRepository;
  let answerRepository: IAnswerRepository;
  let participationRepository: IParticipationRepository;
  let gameId: string;
  let presenter1Id: string;
  let presenter2Id: string;
  let episode1LieId: string;
  let episode2LieId: string;
  const creatorSessionId = 'creator-session-123';
  const participantSessionId = 'participant-session-456';
  const participantNickname = 'Test Participant';

  beforeAll(async () => {
    // Create isolated test database for this test file
    testDb = await createTestDatabase('answer-submission.test.ts');
    gameRepository = new PrismaGameRepository(testDb.prisma);
    answerRepository = new PrismaAnswerRepository(testDb.prisma);
    participationRepository = new PrismaParticipationRepository(testDb.prisma);
  });

  beforeEach(async () => {
    // Clean database before each test
    await testDb.prisma.answer.deleteMany();
    await testDb.prisma.participation.deleteMany();
    await testDb.prisma.episode.deleteMany();
    await testDb.prisma.presenter.deleteMany();
    await testDb.prisma.game.deleteMany();

    // Setup: Create a game with presenters in 出題中 status
    const createGame = new CreateGame(gameRepository);
    const gameResult = await createGame.execute({
      creatorId: creatorSessionId,
      playerLimit: 10,
    });
    gameId = gameResult.id;

    // Add first presenter with episodes
    const addPresenter = new AddPresenterWithEpisodes(gameRepository);
    const presenter1Result = await addPresenter.execute({
      gameId,
      nickname: 'Presenter 1',
      episodes: [
        { text: 'Truth 1-1', isLie: false },
        { text: 'Lie 1', isLie: true },
        { text: 'Truth 1-2', isLie: false },
      ],
    });
    presenter1Id = presenter1Result.presenter.id;

    // Get lie episode ID from presenter result
    episode1LieId = presenter1Result.presenter.episodes.find((e) => e.isLie)?.id || '';

    // Add second presenter with episodes
    const presenter2Result = await addPresenter.execute({
      gameId,
      nickname: 'Presenter 2',
      episodes: [
        { text: 'Truth 2-1', isLie: false },
        { text: 'Truth 2-2', isLie: false },
        { text: 'Lie 2', isLie: true },
      ],
    });
    presenter2Id = presenter2Result.presenter.id;

    // Get lie episode ID from presenter result
    episode2LieId = presenter2Result.presenter.episodes.find((e) => e.isLie)?.id || '';

    // Start the game (準備中 → 出題中)
    const startUseCase = new StartAcceptingResponses(gameRepository);
    await startUseCase.execute({ gameId });
  });

  afterAll(async () => {
    // Clean up isolated test database
    await testDb.cleanup();
  });

  describe('Full Answer Submission Flow', () => {
    it('should successfully submit answer and create participation', async () => {
      // Act: Submit answer
      const submitAnswer = new SubmitAnswer(
        answerRepository,
        participationRepository,
        gameRepository
      );

      const result = await submitAnswer.execute({
        gameId,
        sessionId: participantSessionId,
        nickname: participantNickname,
        selections: {
          [presenter1Id]: episode1LieId,
          [presenter2Id]: episode2LieId,
        },
      });

      // Assert: Submission successful
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.answerId).toBeDefined();
        expect(result.data.message).toContain('回答を送信しました');
      }

      // Verify: Participation created
      const participation = await participationRepository.findBySessionAndGame(
        participantSessionId,
        gameId
      );
      expect(participation).toBeDefined();
      expect(participation?.nickname).toBe(participantNickname);
      expect(participation?.gameId).toBe(gameId);
      expect(participation?.sessionId).toBe(participantSessionId);

      // Verify: Answer created in database
      const answer = await answerRepository.findBySessionAndGame(participantSessionId, gameId);
      expect(answer).toBeDefined();
      expect(answer?.gameId).toBe(gameId);
      expect(answer?.sessionId).toBe(participantSessionId);
      expect(answer?.nickname).toBe(participantNickname);

      // Verify: Selections stored correctly
      const selections = await answerRepository.findSelectionsByAnswer(answer!.id);
      expect(selections).toHaveLength(2);
      expect(
        selections.some((s) => s.presenterId === presenter1Id && s.episodeId === episode1LieId)
      ).toBe(true);
      expect(
        selections.some((s) => s.presenterId === presenter2Id && s.episodeId === episode2LieId)
      ).toBe(true);
    });

    it('should update existing answer on resubmission (upsert)', async () => {
      // Arrange: Submit initial answer
      const submitAnswer = new SubmitAnswer(
        answerRepository,
        participationRepository,
        gameRepository
      );

      const initialResult = await submitAnswer.execute({
        gameId,
        sessionId: participantSessionId,
        nickname: participantNickname,
        selections: {
          [presenter1Id]: episode1LieId,
          [presenter2Id]: episode2LieId,
        },
      });

      expect(initialResult.success).toBe(true);
      const initialAnswerId = initialResult.success ? initialResult.data.answerId : '';

      // Get non-lie episode IDs for updated submission
      const presenters = await gameRepository.findPresentersByGameId(gameId);
      const p1Episodes = presenters.find((p) => p.id === presenter1Id)?.episodes || [];
      const p2Episodes = presenters.find((p) => p.id === presenter2Id)?.episodes || [];
      const episode1TruthId = p1Episodes.find((e) => !e.isLie)?.id || '';
      const episode2TruthId = p2Episodes.find((e) => !e.isLie)?.id || '';

      // Act: Resubmit with different selections
      const updatedResult = await submitAnswer.execute({
        gameId,
        sessionId: participantSessionId,
        nickname: participantNickname,
        selections: {
          [presenter1Id]: episode1TruthId, // Changed from lie to truth
          [presenter2Id]: episode2TruthId, // Changed from lie to truth
        },
      });

      // Assert: Update successful
      expect(updatedResult.success).toBe(true);

      // Verify: Same answer ID (upsert, not new record)
      if (updatedResult.success) {
        expect(updatedResult.data.answerId).toBe(initialAnswerId);
      }

      // Verify: Selections updated in database
      const selections = await answerRepository.findSelectionsByAnswer(initialAnswerId);
      expect(selections).toHaveLength(2);
      expect(
        selections.some((s) => s.presenterId === presenter1Id && s.episodeId === episode1TruthId)
      ).toBe(true);
      expect(
        selections.some((s) => s.presenterId === presenter2Id && s.episodeId === episode2TruthId)
      ).toBe(true);

      // Verify: Old selections removed
      expect(selections.some((s) => s.episodeId === episode1LieId)).toBe(false);
      expect(selections.some((s) => s.episodeId === episode2LieId)).toBe(false);

      // Verify: Only one participation record exists
      const participations = await testDb.prisma.participation.findMany({
        where: {
          gameId,
          sessionId: participantSessionId,
        },
      });
      expect(participations).toHaveLength(1);
    });

    it('should reject submission for game in 準備中 status', async () => {
      // Arrange: Create new game in 準備中 status
      const createGame = new CreateGame(gameRepository);
      const newGameResult = await createGame.execute({
        creatorId: creatorSessionId,
        playerLimit: 10,
      });
      const newGameId = newGameResult.id;

      // Add presenters
      const addPresenter = new AddPresenterWithEpisodes(gameRepository);
      await addPresenter.execute({
        gameId: newGameId,
        nickname: 'Test Presenter',
        episodes: [
          { text: 'Truth', isLie: false },
          { text: 'Lie', isLie: true },
          { text: 'Truth 2', isLie: false },
        ],
        sessionId: creatorSessionId,
      });

      // Act: Try to submit answer to 準備中 game
      const submitAnswer = new SubmitAnswer(
        answerRepository,
        participationRepository,
        gameRepository
      );

      const result = await submitAnswer.execute({
        gameId: newGameId,
        sessionId: participantSessionId,
        nickname: participantNickname,
        selections: {
          'presenter-id': 'episode-id',
        },
      });

      // Assert: Submission rejected
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toContain('GAME_NOT_STARTED');
      }
    });

    it('should reject submission with incomplete selections', async () => {
      // Act: Submit with only one presenter selected (incomplete)
      const submitAnswer = new SubmitAnswer(
        answerRepository,
        participationRepository,
        gameRepository
      );

      const result = await submitAnswer.execute({
        gameId,
        sessionId: participantSessionId,
        nickname: participantNickname,
        selections: {
          [presenter1Id]: episode1LieId,
          // Missing presenter2Id selection
        },
      });

      // Assert: Submission rejected
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INCOMPLETE_SELECTIONS');
        expect(result.error.message).toContain('すべての出題者');
      }
    });
  });

  describe('GetGameForAnswers Integration', () => {
    it('should fetch basic game data for validation', async () => {
      // Act: Fetch game for answers
      const getGame = new GetGameForAnswers(gameRepository);
      const result = await getGame.execute(gameId);

      // Assert: Game data retrieved
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(gameId);
        expect(result.data.name).toBeDefined();
        expect(result.data.status).toBe('出題中');
        expect(result.data.maxPlayers).toBe(10);
        expect(result.data.currentPlayers).toBeGreaterThanOrEqual(0);
      }
    });

    it('should reject closed games', async () => {
      // Arrange: Close the game
      const game = await gameRepository.findById(new GameId(gameId));
      if (game) {
        game.close();
        await gameRepository.update(game);
      }

      // Act: Try to fetch closed game
      const getGame = new GetGameForAnswers(gameRepository);
      const result = await getGame.execute(gameId);

      // Assert: Rejected with GAME_CLOSED
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('GAME_CLOSED');
        expect(result.error.message).toContain('締め切られました');
      }
    });
  });
});
