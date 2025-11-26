// Integration Tests: PrismaAnswerRepository
// Test-Driven Development: Write FAILING tests first

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AnswerEntity } from '@/server/domain/entities/Answer';
import { createTestDatabase, type TestDatabase } from '../../../../tests/utils/test-database';
import { PrismaAnswerRepository } from './PrismaAnswerRepository';

describe('PrismaAnswerRepository', () => {
  let testDb: TestDatabase;
  let repository: PrismaAnswerRepository;

  beforeAll(async () => {
    // Create isolated test database for this test file
    testDb = await createTestDatabase('PrismaAnswerRepository.test.ts');
    repository = new PrismaAnswerRepository(testDb.prisma);
  });

  beforeEach(async () => {
    // Clean up database before each test (in order due to foreign keys)
    await testDb.prisma.answer.deleteMany();
    await testDb.prisma.participation.deleteMany();
    await testDb.prisma.episode.deleteMany();
    await testDb.prisma.presenter.deleteMany();
    await testDb.prisma.game.deleteMany();
  });

  afterAll(async () => {
    // Clean up isolated test database
    await testDb.cleanup();
  });

  const createTestGame = async (gameId: string) => {
    await testDb.prisma.game.create({
      data: {
        id: gameId,
        name: 'Test Game',
        creatorId: 'creator-session',
        maxPlayers: 10,
        currentPlayers: 0,
        status: '出題中',
      },
    });
  };

  describe('upsert', () => {
    it('should create a new answer in database', async () => {
      const gameId = 'game-123';
      await createTestGame(gameId);

      const answer = AnswerEntity.create({
        sessionId: 'session-123',
        gameId: gameId,
        nickname: 'TestUser',
        selections: { 'presenter-1': 'episode-1' },
      });

      await repository.upsert(answer);

      const found = await repository.findBySessionAndGame('session-123', gameId);
      expect(found).not.toBeNull();
      expect(found?.nickname).toBe('TestUser');
      expect(found?.selections.get('presenter-1')).toBe('episode-1');
    });

    it('should update existing answer (upsert behavior)', async () => {
      const gameId = 'game-123';
      await createTestGame(gameId);

      const answer1 = AnswerEntity.create({
        sessionId: 'session-123',
        gameId: gameId,
        nickname: 'TestUser',
        selections: { 'presenter-1': 'episode-1' },
      });

      await repository.upsert(answer1);

      // Update with new selections
      const answer2 = AnswerEntity.create({
        sessionId: 'session-123',
        gameId: gameId,
        nickname: 'TestUser',
        selections: { 'presenter-1': 'episode-2', 'presenter-2': 'episode-3' },
      });

      await repository.upsert(answer2);

      const found = await repository.findBySessionAndGame('session-123', gameId);
      expect(found).not.toBeNull();
      expect(found?.selections.size).toBe(2);
      expect(found?.selections.get('presenter-1')).toBe('episode-2');
      expect(found?.selections.get('presenter-2')).toBe('episode-3');
    });

    it('should persist all answer properties', async () => {
      const gameId = 'game-456';
      await createTestGame(gameId);

      const answer = AnswerEntity.create({
        sessionId: 'session-789',
        gameId: gameId,
        nickname: 'テストユーザー',
        selections: {
          'presenter-1': 'episode-1',
          'presenter-2': 'episode-2',
          'presenter-3': 'episode-3',
        },
      });

      await repository.upsert(answer);

      const found = await repository.findBySessionAndGame('session-789', gameId);
      expect(found).not.toBeNull();
      expect(found?.id).toBeTruthy();
      expect(found?.sessionId).toBe('session-789');
      expect(found?.gameId).toBe(gameId);
      expect(found?.nickname).toBe('テストユーザー');
      expect(found?.selections.size).toBe(3);
      expect(found?.createdAt).toBeInstanceOf(Date);
      expect(found?.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('findBySessionAndGame', () => {
    it('should return null when answer does not exist', async () => {
      const found = await repository.findBySessionAndGame('non-existent', 'game-123');
      expect(found).toBeNull();
    });

    it('should find answer by session and game', async () => {
      const gameId = 'game-123';
      await createTestGame(gameId);

      const answer = AnswerEntity.create({
        sessionId: 'session-123',
        gameId: gameId,
        nickname: 'TestUser',
        selections: { 'presenter-1': 'episode-1' },
      });

      await repository.upsert(answer);

      const found = await repository.findBySessionAndGame('session-123', gameId);
      expect(found).not.toBeNull();
      expect(found?.sessionId).toBe('session-123');
      expect(found?.gameId).toBe(gameId);
    });

    it('should distinguish between different sessions', async () => {
      const gameId = 'game-123';
      await createTestGame(gameId);

      const answer1 = AnswerEntity.create({
        sessionId: 'session-1',
        gameId: gameId,
        nickname: 'User1',
        selections: { 'presenter-1': 'episode-1' },
      });

      const answer2 = AnswerEntity.create({
        sessionId: 'session-2',
        gameId: gameId,
        nickname: 'User2',
        selections: { 'presenter-1': 'episode-2' },
      });

      await repository.upsert(answer1);
      await repository.upsert(answer2);

      const found1 = await repository.findBySessionAndGame('session-1', gameId);
      const found2 = await repository.findBySessionAndGame('session-2', gameId);

      expect(found1?.nickname).toBe('User1');
      expect(found2?.nickname).toBe('User2');
    });
  });

  describe('findByGameId', () => {
    it('should return empty array when no answers exist', async () => {
      const answers = await repository.findByGameId('game-123');
      expect(answers).toEqual([]);
    });

    it('should find all answers for a game', async () => {
      const gameId = 'game-123';
      await createTestGame(gameId);

      const answer1 = AnswerEntity.create({
        sessionId: 'session-1',
        gameId: gameId,
        nickname: 'User1',
        selections: { 'presenter-1': 'episode-1' },
      });

      const answer2 = AnswerEntity.create({
        sessionId: 'session-2',
        gameId: gameId,
        nickname: 'User2',
        selections: { 'presenter-1': 'episode-2' },
      });

      const answer3 = AnswerEntity.create({
        sessionId: 'session-3',
        gameId: gameId,
        nickname: 'User3',
        selections: { 'presenter-1': 'episode-3' },
      });

      await repository.upsert(answer1);
      await repository.upsert(answer2);
      await repository.upsert(answer3);

      const answers = await repository.findByGameId(gameId);
      expect(answers).toHaveLength(3);
      expect(answers.map((a) => a.nickname)).toEqual(
        expect.arrayContaining(['User1', 'User2', 'User3'])
      );
    });

    it('should not return answers from other games', async () => {
      const gameId1 = 'game-1';
      const gameId2 = 'game-2';
      await createTestGame(gameId1);
      await createTestGame(gameId2);

      const answer1 = AnswerEntity.create({
        sessionId: 'session-1',
        gameId: gameId1,
        nickname: 'User1',
        selections: { 'presenter-1': 'episode-1' },
      });

      const answer2 = AnswerEntity.create({
        sessionId: 'session-2',
        gameId: gameId2,
        nickname: 'User2',
        selections: { 'presenter-1': 'episode-2' },
      });

      await repository.upsert(answer1);
      await repository.upsert(answer2);

      const answers1 = await repository.findByGameId(gameId1);
      const answers2 = await repository.findByGameId(gameId2);

      expect(answers1).toHaveLength(1);
      expect(answers1[0]?.nickname).toBe('User1');
      expect(answers2).toHaveLength(1);
      expect(answers2[0]?.nickname).toBe('User2');
    });
  });

  describe('delete', () => {
    it('should delete answer from database', async () => {
      const gameId = 'game-123';
      await createTestGame(gameId);

      const answer = AnswerEntity.create({
        sessionId: 'session-123',
        gameId: gameId,
        nickname: 'TestUser',
        selections: { 'presenter-1': 'episode-1' },
      });

      await repository.upsert(answer);

      const foundBefore = await repository.findBySessionAndGame('session-123', gameId);
      expect(foundBefore).not.toBeNull();

      await repository.delete('session-123', gameId);

      const foundAfter = await repository.findBySessionAndGame('session-123', gameId);
      expect(foundAfter).toBeNull();
    });

    it('should not throw error when deleting non-existent answer', async () => {
      await expect(repository.delete('non-existent', 'game-123')).resolves.not.toThrow();
    });

    it('should only delete specified answer', async () => {
      const gameId = 'game-123';
      await createTestGame(gameId);

      const answer1 = AnswerEntity.create({
        sessionId: 'session-1',
        gameId: gameId,
        nickname: 'User1',
        selections: { 'presenter-1': 'episode-1' },
      });

      const answer2 = AnswerEntity.create({
        sessionId: 'session-2',
        gameId: gameId,
        nickname: 'User2',
        selections: { 'presenter-1': 'episode-2' },
      });

      await repository.upsert(answer1);
      await repository.upsert(answer2);

      await repository.delete('session-1', gameId);

      const found1 = await repository.findBySessionAndGame('session-1', gameId);
      const found2 = await repository.findBySessionAndGame('session-2', gameId);

      expect(found1).toBeNull();
      expect(found2).not.toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle large selections Map (10 presenters)', async () => {
      const gameId = 'game-123';
      await createTestGame(gameId);

      const selections: Record<string, string> = {};
      for (let i = 1; i <= 10; i++) {
        selections[`presenter-${i}`] = `episode-${i}`;
      }

      const answer = AnswerEntity.create({
        sessionId: 'session-123',
        gameId: gameId,
        nickname: 'TestUser',
        selections,
      });

      await repository.upsert(answer);

      const found = await repository.findBySessionAndGame('session-123', gameId);
      expect(found?.selections.size).toBe(10);
    });

    it('should handle special characters in IDs', async () => {
      const gameId = 'game-abc-123-def';
      await createTestGame(gameId);

      const answer = AnswerEntity.create({
        sessionId: 'session-xyz-456',
        gameId: gameId,
        nickname: 'TestUser',
        selections: { 'presenter-uuid-1': 'episode-uuid-a' },
      });

      await repository.upsert(answer);

      const found = await repository.findBySessionAndGame('session-xyz-456', gameId);
      expect(found).not.toBeNull();
    });

    it('should handle concurrent upserts to same session/game', async () => {
      const gameId = 'game-123';
      await createTestGame(gameId);

      const answer1 = AnswerEntity.create({
        sessionId: 'session-123',
        gameId: gameId,
        nickname: 'TestUser',
        selections: { 'presenter-1': 'episode-1' },
      });

      const answer2 = AnswerEntity.create({
        sessionId: 'session-123',
        gameId: gameId,
        nickname: 'TestUser',
        selections: { 'presenter-1': 'episode-2' },
      });

      // Both upserts should succeed (last write wins)
      await Promise.all([repository.upsert(answer1), repository.upsert(answer2)]);

      const found = await repository.findBySessionAndGame('session-123', gameId);
      expect(found).not.toBeNull();
      // Either episode-1 or episode-2 is acceptable (race condition)
      expect(['episode-1', 'episode-2']).toContain(found?.selections.get('presenter-1'));
    });
  });
});
