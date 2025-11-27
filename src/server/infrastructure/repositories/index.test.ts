/**
 * Repository Factory Tests
 * Tests for repository creation and dependency injection
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock PrismaClient
const mockPrismaClient = {
  $disconnect: vi.fn(),
};

// Mock repository classes
const _mockGameRepository = { type: 'PrismaGameRepository' };
const _mockAnswerRepository = { type: 'PrismaAnswerRepository' };
const _mockParticipationRepository = { type: 'PrismaParticipationRepository' };

// Create mock class constructors
class MockPrismaClient {
  $disconnect = mockPrismaClient.$disconnect;
}

class MockPrismaGameRepository {
  type = 'PrismaGameRepository';
}

class MockPrismaAnswerRepository {
  type = 'PrismaAnswerRepository';
}

class MockPrismaParticipationRepository {
  type = 'PrismaParticipationRepository';
}

vi.mock('../../../generated/prisma/client', () => ({
  PrismaClient: MockPrismaClient,
}));

vi.mock('./PrismaGameRepository', () => ({
  PrismaGameRepository: MockPrismaGameRepository,
}));

vi.mock('./PrismaAnswerRepository', () => ({
  PrismaAnswerRepository: MockPrismaAnswerRepository,
}));

vi.mock('./PrismaParticipationRepository', () => ({
  PrismaParticipationRepository: MockPrismaParticipationRepository,
}));

// Import after mocks
const {
  createGameRepository,
  createAnswerRepository,
  createParticipationRepository,
  closeRepositoryConnections,
} = await import('./index');

describe('Repository Factory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up singleton between tests
    await closeRepositoryConnections();
  });

  describe('createGameRepository', () => {
    it('should create a PrismaGameRepository instance', () => {
      const repository = createGameRepository();

      expect(repository).toBeInstanceOf(MockPrismaGameRepository);
      expect(repository.type).toBe('PrismaGameRepository');
    });

    it('should return repository instances with same Prisma client (singleton)', () => {
      const repo1 = createGameRepository();
      const repo2 = createGameRepository();

      expect(repo1).toBeInstanceOf(MockPrismaGameRepository);
      expect(repo2).toBeInstanceOf(MockPrismaGameRepository);
      // PrismaClient should only be instantiated once
    });
  });

  describe('createAnswerRepository', () => {
    it('should create a PrismaAnswerRepository instance', () => {
      const repository = createAnswerRepository();

      expect(repository).toBeInstanceOf(MockPrismaAnswerRepository);
      expect(repository.type).toBe('PrismaAnswerRepository');
    });

    it('should return repository instances with same Prisma client (singleton)', () => {
      const repo1 = createAnswerRepository();
      const repo2 = createAnswerRepository();

      expect(repo1).toBeInstanceOf(MockPrismaAnswerRepository);
      expect(repo2).toBeInstanceOf(MockPrismaAnswerRepository);
    });
  });

  describe('createParticipationRepository', () => {
    it('should create a PrismaParticipationRepository instance', () => {
      const repository = createParticipationRepository();

      expect(repository).toBeInstanceOf(MockPrismaParticipationRepository);
      expect(repository.type).toBe('PrismaParticipationRepository');
    });

    it('should return repository instances with same Prisma client (singleton)', () => {
      const repo1 = createParticipationRepository();
      const repo2 = createParticipationRepository();

      expect(repo1).toBeInstanceOf(MockPrismaParticipationRepository);
      expect(repo2).toBeInstanceOf(MockPrismaParticipationRepository);
    });
  });

  describe('closeRepositoryConnections', () => {
    it('should disconnect Prisma client', async () => {
      // Create a repository to initialize Prisma client
      createGameRepository();

      await closeRepositoryConnections();

      expect(mockPrismaClient.$disconnect).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple close calls safely', async () => {
      // Create a repository to initialize Prisma client
      createGameRepository();

      await closeRepositoryConnections();
      await closeRepositoryConnections(); // Second call should be safe

      // Should only disconnect once (first call)
      expect(mockPrismaClient.$disconnect).toHaveBeenCalledTimes(1);
    });

    it('should handle close without initialization', async () => {
      // Don't create any repositories (Prisma client not initialized)

      await closeRepositoryConnections();

      // Should not throw and not call disconnect
      expect(mockPrismaClient.$disconnect).not.toHaveBeenCalled();
    });

    it('should reinitialize Prisma client after close', async () => {
      // First lifecycle
      const repo1 = createGameRepository();
      expect(repo1).toBeInstanceOf(MockPrismaGameRepository);

      await closeRepositoryConnections();
      expect(mockPrismaClient.$disconnect).toHaveBeenCalledTimes(1);

      // Second lifecycle - should create new Prisma client
      const repo2 = createGameRepository();
      expect(repo2).toBeInstanceOf(MockPrismaGameRepository);
    });
  });

  describe('Singleton Pattern', () => {
    it('should reuse same Prisma client across different repository types', () => {
      const gameRepo = createGameRepository();
      const answerRepo = createAnswerRepository();
      const participationRepo = createParticipationRepository();

      expect(gameRepo).toBeInstanceOf(MockPrismaGameRepository);
      expect(answerRepo).toBeInstanceOf(MockPrismaAnswerRepository);
      expect(participationRepo).toBeInstanceOf(MockPrismaParticipationRepository);
      // All should share the same PrismaClient instance
    });
  });
});
