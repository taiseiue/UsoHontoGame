// Unit tests for ValidateSession use case
// Tests session validation business logic

import { beforeEach, describe, expect, it } from 'vitest';
import { ValidateSession } from '@/server/application/use-cases/session/ValidateSession';
import { Session } from '@/server/domain/entities/Session';
import type { ISessionRepository } from '@/server/domain/repositories/ISessionRepository';
import { Nickname } from '@/server/domain/value-objects/Nickname';
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

describe('ValidateSession', () => {
  let repository: MockSessionRepository;
  let useCase: ValidateSession;

  beforeEach(() => {
    repository = new MockSessionRepository();
    useCase = new ValidateSession(repository);
  });

  it('should return session data when session exists', async () => {
    const sessionId = new SessionId('V1StGXR8_Z5jdHi6B-myT');
    const nickname = new Nickname('田中太郎');
    const session = new Session(sessionId, nickname, new Date());
    await repository.create(session);

    const result = await useCase.execute('V1StGXR8_Z5jdHi6B-myT');

    expect(result).not.toBeNull();
    expect(result?.sessionId).toBe('V1StGXR8_Z5jdHi6B-myT');
    expect(result?.nickname).toBe('田中太郎');
  });

  it('should return null when session does not exist', async () => {
    const result = await useCase.execute('V1StGXR8_Z5jdHi6B-myT');

    expect(result).toBeNull();
  });

  it('should return null for invalid session ID format', async () => {
    const result = await useCase.execute('invalid-id');

    expect(result).toBeNull();
  });

  it('should return session with null nickname when nickname not set', async () => {
    const sessionId = new SessionId('V1StGXR8_Z5jdHi6B-myT');
    const session = new Session(sessionId, null, new Date());
    await repository.create(session);

    const result = await useCase.execute('V1StGXR8_Z5jdHi6B-myT');

    expect(result).not.toBeNull();
    expect(result?.sessionId).toBe('V1StGXR8_Z5jdHi6B-myT');
    expect(result?.nickname).toBeNull();
  });
});
