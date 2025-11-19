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
import { nanoid } from 'nanoid';
import { CreateGame } from '@/server/application/use-cases/games/CreateGame';
import { AddPresenterWithEpisodes } from '@/server/application/use-cases/games/AddPresenterWithEpisodes';
import { StartAcceptingResponses } from '@/server/application/use-cases/games/StartAcceptingResponses';
import { SubmitAnswer } from '@/server/application/use-cases/answers/SubmitAnswer';
import { GetGameForAnswers } from '@/server/application/use-cases/answers/GetGameForAnswers';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import type { IAnswerRepository } from '@/server/domain/repositories/IAnswerRepository';
import type { IParticipationRepository } from '@/server/domain/repositories/IParticipationRepository';
import { PrismaGameRepository } from '@/server/infrastructure/repositories/PrismaGameRepository';
import { PrismaAnswerRepository } from '@/server/infrastructure/repositories/PrismaAnswerRepository';
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
			sessionId: creatorSessionId,
		});
		presenter1Id = presenter1Result.presenterId;

		// Get lie episode ID for presenter 1
		const presenters1 = await gameRepository.findPresentersByGameId(gameId);
		const p1Episodes = presenters1.find((p) => p.id === presenter1Id)?.episodes || [];
		episode1LieId = p1Episodes.find((e) => e.isLie)?.id || '';

		// Add second presenter with episodes
		const presenter2Result = await addPresenter.execute({
			gameId,
			nickname: 'Presenter 2',
			episodes: [
				{ text: 'Truth 2-1', isLie: false },
				{ text: 'Truth 2-2', isLie: false },
				{ text: 'Lie 2', isLie: true },
			],
			sessionId: creatorSessionId,
		});
		presenter2Id = presenter2Result.presenterId;

		// Get lie episode ID for presenter 2
		const presenters2 = await gameRepository.findPresentersByGameId(gameId);
		const p2Episodes = presenters2.find((p) => p.id === presenter2Id)?.episodes || [];
		episode2LieId = p2Episodes.find((e) => e.isLie)?.id || '';

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
				gameRepository,
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
				gameId,
			);
			expect(participation).toBeDefined();
			expect(participation?.nickname).toBe(participantNickname);
			expect(participation?.gameId).toBe(gameId);
			expect(participation?.sessionId).toBe(participantSessionId);

			// Verify: Answer created in database
			const answer = await answerRepository.findBySessionAndGame(
				participantSessionId,
				gameId,
			);
			expect(answer).toBeDefined();
			expect(answer?.gameId).toBe(gameId);
			expect(answer?.sessionId).toBe(participantSessionId);
			expect(answer?.nickname).toBe(participantNickname);

			// Verify: Selections stored correctly
			const selections = await answerRepository.findSelectionsByAnswer(answer!.id);
			expect(selections).toHaveLength(2);
			expect(selections.some((s) => s.presenterId === presenter1Id && s.episodeId === episode1LieId)).toBe(true);
			expect(selections.some((s) => s.presenterId === presenter2Id && s.episodeId === episode2LieId)).toBe(true);
		});

		it('should update existing answer on resubmission (upsert)', async () => {
			// Arrange: Submit initial answer
			const submitAnswer = new SubmitAnswer(
				answerRepository,
				participationRepository,
				gameRepository,
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
			expect(selections.some((s) => s.presenterId === presenter1Id && s.episodeId === episode1TruthId)).toBe(true);
			expect(selections.some((s) => s.presenterId === presenter2Id && s.episodeId === episode2TruthId)).toBe(true);

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
				gameRepository,
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
				expect(result.error.code).toContain('GAME_NOT_ACCEPTING');
			}
		});

		it('should reject submission with incomplete selections', async () => {
			// Act: Submit with only one presenter selected (incomplete)
			const submitAnswer = new SubmitAnswer(
				answerRepository,
				participationRepository,
				gameRepository,
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
		it('should fetch game with presenters and episodes', async () => {
			// Act: Fetch game for answers
			const getGame = new GetGameForAnswers(gameRepository);
			const result = await getGame.execute({
				gameId,
				sessionId: participantSessionId,
			});

			// Assert: Game data retrieved
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.game.id).toBe(gameId);
				expect(result.game.presenters).toHaveLength(2);

				// Verify presenter structure
				const presenter1 = result.game.presenters.find((p) => p.id === presenter1Id);
				expect(presenter1).toBeDefined();
				expect(presenter1?.name).toBe('Presenter 1');
				expect(presenter1?.episodes).toHaveLength(3);

				// Verify episodes don't expose isLie flag
				presenter1?.episodes.forEach((episode) => {
					expect(episode).toHaveProperty('id');
					expect(episode).toHaveProperty('text');
					expect(episode).not.toHaveProperty('isLie');
				});
			}
		});

		it('should load existing selections for returning participant', async () => {
			// Arrange: Submit initial answer
			const submitAnswer = new SubmitAnswer(
				answerRepository,
				participationRepository,
				gameRepository,
			);

			await submitAnswer.execute({
				gameId,
				sessionId: participantSessionId,
				nickname: participantNickname,
				selections: {
					[presenter1Id]: episode1LieId,
					[presenter2Id]: episode2LieId,
				},
			});

			// Act: Fetch game with existing selections
			const getGame = new GetGameForAnswers(gameRepository);
			const result = await getGame.execute({
				gameId,
				sessionId: participantSessionId,
			});

			// Assert: Previous selections loaded
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.existingSelections).toBeDefined();
				expect(result.existingSelections?.[presenter1Id]).toBe(episode1LieId);
				expect(result.existingSelections?.[presenter2Id]).toBe(episode2LieId);
			}
		});
	});
});
