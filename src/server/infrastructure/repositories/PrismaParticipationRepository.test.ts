// Integration Tests: PrismaParticipationRepository
// Test-Driven Development: Write FAILING tests first

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ParticipationEntity } from '@/server/domain/entities/Participation';
import { createTestDatabase, type TestDatabase } from '../../../../tests/utils/test-database';
import { PrismaParticipationRepository } from './PrismaParticipationRepository';

describe('PrismaParticipationRepository', () => {
  let testDb: TestDatabase;
  let repository: PrismaParticipationRepository;

  beforeAll(async () => {
    // Create isolated test database for this test file
    testDb = await createTestDatabase('PrismaParticipationRepository.test.ts');
    repository = new PrismaParticipationRepository(testDb.prisma);
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

  describe('create', () => {
    it('should create a new participation record in database', async () => {
      const gameId = 'game-123';
      await createTestGame(gameId);

      const participation = ParticipationEntity.create({
        sessionId: 'session-123',
        gameId: gameId,
        nickname: 'TestUser',
      });

      await repository.create(participation);

      const found = await repository.findBySessionAndGame('session-123', gameId);
      expect(found).not.toBeNull();
      expect(found?.nickname).toBe('TestUser');
    });

    it('should persist all participation properties', async () => {
      const gameId = 'game-456';
      await createTestGame(gameId);

      const participation = ParticipationEntity.create({
        sessionId: 'session-789',
        gameId: gameId,
        nickname: 'テストユーザー',
      });

      await repository.create(participation);

      const found = await repository.findBySessionAndGame('session-789', gameId);
      expect(found).not.toBeNull();
      expect(found?.id).toBeTruthy();
      expect(found?.sessionId).toBe('session-789');
      expect(found?.gameId).toBe(gameId);
      expect(found?.nickname).toBe('テストユーザー');
      expect(found?.joinedAt).toBeInstanceOf(Date);
    });

    it('should throw error on duplicate session/game combination', async () => {
      const gameId = 'game-123';
      await createTestGame(gameId);

      const participation1 = ParticipationEntity.create({
        sessionId: 'session-123',
        gameId: gameId,
        nickname: 'TestUser',
      });

      const participation2 = ParticipationEntity.create({
        sessionId: 'session-123',
        gameId: gameId,
        nickname: 'TestUser',
      });

      await repository.create(participation1);

      // Second create with same session/game should fail (unique constraint)
      await expect(repository.create(participation2)).rejects.toThrow();
    });

    it('should allow same session to participate in different games', async () => {
      const gameId1 = 'game-1';
      const gameId2 = 'game-2';
      await createTestGame(gameId1);
      await createTestGame(gameId2);

      const participation1 = ParticipationEntity.create({
        sessionId: 'session-123',
        gameId: gameId1,
        nickname: 'TestUser',
      });

      const participation2 = ParticipationEntity.create({
        sessionId: 'session-123',
        gameId: gameId2,
        nickname: 'TestUser',
      });

      await repository.create(participation1);
      await repository.create(participation2);

      const found1 = await repository.findBySessionAndGame('session-123', gameId1);
      const found2 = await repository.findBySessionAndGame('session-123', gameId2);

      expect(found1).not.toBeNull();
      expect(found2).not.toBeNull();
    });
  });

  describe('exists', () => {
    it('should return false when participation does not exist', async () => {
      const exists = await repository.exists('non-existent', 'game-123');
      expect(exists).toBe(false);
    });

    it('should return true when participation exists', async () => {
      const gameId = 'game-123';
      await createTestGame(gameId);

      const participation = ParticipationEntity.create({
        sessionId: 'session-123',
        gameId: gameId,
        nickname: 'TestUser',
      });

      await repository.create(participation);

      const exists = await repository.exists('session-123', gameId);
      expect(exists).toBe(true);
    });

    it('should distinguish between different sessions', async () => {
      const gameId = 'game-123';
      await createTestGame(gameId);

      const participation = ParticipationEntity.create({
        sessionId: 'session-1',
        gameId: gameId,
        nickname: 'User1',
      });

      await repository.create(participation);

      const exists1 = await repository.exists('session-1', gameId);
      const exists2 = await repository.exists('session-2', gameId);

      expect(exists1).toBe(true);
      expect(exists2).toBe(false);
    });

    it('should distinguish between different games', async () => {
      const gameId1 = 'game-1';
      const gameId2 = 'game-2';
      await createTestGame(gameId1);
      await createTestGame(gameId2);

      const participation = ParticipationEntity.create({
        sessionId: 'session-123',
        gameId: gameId1,
        nickname: 'TestUser',
      });

      await repository.create(participation);

      const exists1 = await repository.exists('session-123', gameId1);
      const exists2 = await repository.exists('session-123', gameId2);

      expect(exists1).toBe(true);
      expect(exists2).toBe(false);
    });
  });

  describe('countByGameId', () => {
    it('should return 0 when no participations exist', async () => {
      const count = await repository.countByGameId('game-123');
      expect(count).toBe(0);
    });

    it('should count participations for a game', async () => {
      const gameId = 'game-123';
      await createTestGame(gameId);

      const participation1 = ParticipationEntity.create({
        sessionId: 'session-1',
        gameId: gameId,
        nickname: 'User1',
      });

      const participation2 = ParticipationEntity.create({
        sessionId: 'session-2',
        gameId: gameId,
        nickname: 'User2',
      });

      const participation3 = ParticipationEntity.create({
        sessionId: 'session-3',
        gameId: gameId,
        nickname: 'User3',
      });

      await repository.create(participation1);
      await repository.create(participation2);
      await repository.create(participation3);

      const count = await repository.countByGameId(gameId);
      expect(count).toBe(3);
    });

    it('should not count participations from other games', async () => {
      const gameId1 = 'game-1';
      const gameId2 = 'game-2';
      await createTestGame(gameId1);
      await createTestGame(gameId2);

      const participation1 = ParticipationEntity.create({
        sessionId: 'session-1',
        gameId: gameId1,
        nickname: 'User1',
      });

      const participation2 = ParticipationEntity.create({
        sessionId: 'session-2',
        gameId: gameId2,
        nickname: 'User2',
      });

      const participation3 = ParticipationEntity.create({
        sessionId: 'session-3',
        gameId: gameId1,
        nickname: 'User3',
      });

      await repository.create(participation1);
      await repository.create(participation2);
      await repository.create(participation3);

      const count1 = await repository.countByGameId(gameId1);
      const count2 = await repository.countByGameId(gameId2);

      expect(count1).toBe(2);
      expect(count2).toBe(1);
    });

    it('should handle large number of participations (100)', async () => {
      const gameId = 'game-123';
      await createTestGame(gameId);

      // Create 100 participations
      for (let i = 1; i <= 100; i++) {
        const participation = ParticipationEntity.create({
          sessionId: `session-${i}`,
          gameId: gameId,
          nickname: `User${i}`,
        });
        await repository.create(participation);
      }

      const count = await repository.countByGameId(gameId);
      expect(count).toBe(100);
    });
  });

  describe('findBySessionAndGame', () => {
    it('should return null when participation does not exist', async () => {
      const found = await repository.findBySessionAndGame('non-existent', 'game-123');
      expect(found).toBeNull();
    });

    it('should find participation by session and game', async () => {
      const gameId = 'game-123';
      await createTestGame(gameId);

      const participation = ParticipationEntity.create({
        sessionId: 'session-123',
        gameId: gameId,
        nickname: 'TestUser',
      });

      await repository.create(participation);

      const found = await repository.findBySessionAndGame('session-123', gameId);
      expect(found).not.toBeNull();
      expect(found?.sessionId).toBe('session-123');
      expect(found?.gameId).toBe(gameId);
    });

    it('should distinguish between different sessions', async () => {
      const gameId = 'game-123';
      await createTestGame(gameId);

      const participation1 = ParticipationEntity.create({
        sessionId: 'session-1',
        gameId: gameId,
        nickname: 'User1',
      });

      const participation2 = ParticipationEntity.create({
        sessionId: 'session-2',
        gameId: gameId,
        nickname: 'User2',
      });

      await repository.create(participation1);
      await repository.create(participation2);

      const found1 = await repository.findBySessionAndGame('session-1', gameId);
      const found2 = await repository.findBySessionAndGame('session-2', gameId);

      expect(found1?.nickname).toBe('User1');
      expect(found2?.nickname).toBe('User2');
    });

    it('should distinguish between different games', async () => {
      const gameId1 = 'game-1';
      const gameId2 = 'game-2';
      await createTestGame(gameId1);
      await createTestGame(gameId2);

      const participation1 = ParticipationEntity.create({
        sessionId: 'session-123',
        gameId: gameId1,
        nickname: 'User1',
      });

      const participation2 = ParticipationEntity.create({
        sessionId: 'session-123',
        gameId: gameId2,
        nickname: 'User2',
      });

      await repository.create(participation1);
      await repository.create(participation2);

      const found1 = await repository.findBySessionAndGame('session-123', gameId1);
      const found2 = await repository.findBySessionAndGame('session-123', gameId2);

      expect(found1?.nickname).toBe('User1');
      expect(found2?.nickname).toBe('User2');
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in IDs', async () => {
      const gameId = 'game-abc-123-def';
      await createTestGame(gameId);

      const participation = ParticipationEntity.create({
        sessionId: 'session-xyz-456',
        gameId: gameId,
        nickname: 'TestUser',
      });

      await repository.create(participation);

      const found = await repository.findBySessionAndGame('session-xyz-456', gameId);
      expect(found).not.toBeNull();
    });

    it('should handle emojis in nickname', async () => {
      const gameId = 'game-123';
      await createTestGame(gameId);

      const participation = ParticipationEntity.create({
        sessionId: 'session-123',
        gameId: gameId,
        nickname: 'User🎮',
      });

      await repository.create(participation);

      const found = await repository.findBySessionAndGame('session-123', gameId);
      expect(found?.nickname).toBe('User🎮');
    });

    it('should preserve timestamp precision', async () => {
      const gameId = 'game-123';
      await createTestGame(gameId);

      const before = Date.now();
      const participation = ParticipationEntity.create({
        sessionId: 'session-123',
        gameId: gameId,
        nickname: 'TestUser',
      });

      await repository.create(participation);
      const after = Date.now() + 10; // Add 10ms buffer for async operations

      const found = await repository.findBySessionAndGame('session-123', gameId);
      expect(found?.joinedAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(found?.joinedAt.getTime()).toBeLessThanOrEqual(after);
    });
  });
});
