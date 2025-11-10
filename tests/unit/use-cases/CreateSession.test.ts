// Unit tests for CreateSession use case
// Tests session creation business logic

import { beforeEach, describe, expect, it } from 'vitest';
import { CreateSession } from '@/server/application/use-cases/session/CreateSession';
import type { Session } from '@/server/domain/entities/Session';
import type { ISessionRepository } from '@/server/domain/repositories/ISessionRepository';
import { SessionId } from '@/server/domain/value-objects/SessionId';

// Mock repository
class MockSessionRepository implements ISessionRepository {
  private sessions: Map<string, Session> = new Map();

  async create(session: Session): Promise<void> {
    this.sessions.set(session.sessionId.value, session);
  }

  async findById(sessionId: SessionId): Promise<Session | null> {
    return this.sessions.get(sessionId.value) ?? null;
  }

  async update(session: Session): Promise<void> {
    this.sessions.set(session.sessionId.value, session);
  }

  async delete(sessionId: SessionId): Promise<void> {
    this.sessions.delete(sessionId.value);
  }
}

describe('CreateSession', () => {
  let repository: MockSessionRepository;
  let useCase: CreateSession;

  beforeEach(() => {
    repository = new MockSessionRepository();
    useCase = new CreateSession(repository);
  });

  it('should create a new session with generated ID', async () => {
    const result = await useCase.execute();

    expect(result.sessionId).toBeDefined();
    expect(result.sessionId.length).toBe(21);
    expect(result.nickname).toBeNull();
    expect(result.createdAt).toBeDefined();
  });

  it('should create session with unique IDs on multiple calls', async () => {
    const result1 = await useCase.execute();
    const result2 = await useCase.execute();

    expect(result1.sessionId).not.toBe(result2.sessionId);
  });

  it('should save session to repository', async () => {
    const result = await useCase.execute();
    const sessionId = new SessionId(result.sessionId);

    const savedSession = await repository.findById(sessionId);
    expect(savedSession).not.toBeNull();
    expect(savedSession?.sessionId.value).toBe(result.sessionId);
  });

  it('should return SessionDto with correct structure', async () => {
    const result = await useCase.execute();

    expect(result).toHaveProperty('sessionId');
    expect(result).toHaveProperty('nickname');
    expect(result).toHaveProperty('createdAt');
    expect(typeof result.sessionId).toBe('string');
    expect(typeof result.createdAt).toBe('string');
  });
});
