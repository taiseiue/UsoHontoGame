// Unit tests for SetNickname use case
// Tests nickname setting business logic

import { beforeEach, describe, expect, it } from 'vitest';
import { SetNickname } from '@/server/application/use-cases/session/SetNickname';
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

describe('SetNickname', () => {
  let repository: MockSessionRepository;
  let useCase: SetNickname;

  beforeEach(() => {
    repository = new MockSessionRepository();
    useCase = new SetNickname(repository);
  });

  it('should set nickname on session without nickname', async () => {
    const sessionId = new SessionId('V1StGXR8_Z5jdHi6B-myT');
    const session = new Session(sessionId, null, new Date());
    await repository.create(session);

    const result = await useCase.execute('V1StGXR8_Z5jdHi6B-myT', '田中太郎');

    expect(result).not.toBeNull();
    expect(result?.nickname).toBe('田中太郎');
  });

  it('should update existing nickname', async () => {
    const sessionId = new SessionId('V1StGXR8_Z5jdHi6B-myT');
    const oldNickname = new Nickname('山田花子');
    const session = new Session(sessionId, oldNickname, new Date());
    await repository.create(session);

    const result = await useCase.execute('V1StGXR8_Z5jdHi6B-myT', '田中太郎');

    expect(result).not.toBeNull();
    expect(result?.nickname).toBe('田中太郎');
  });

  it('should return null when session does not exist', async () => {
    const result = await useCase.execute('V1StGXR8_Z5jdHi6B-myT', '田中太郎');

    expect(result).toBeNull();
  });

  it('should return null for invalid session ID', async () => {
    const result = await useCase.execute('invalid-id', '田中太郎');

    expect(result).toBeNull();
  });

  it('should return null for empty nickname', async () => {
    const sessionId = new SessionId('V1StGXR8_Z5jdHi6B-myT');
    const session = new Session(sessionId, null, new Date());
    await repository.create(session);

    const result = await useCase.execute('V1StGXR8_Z5jdHi6B-myT', '');

    expect(result).toBeNull();
  });

  it('should trim whitespace from nickname', async () => {
    const sessionId = new SessionId('V1StGXR8_Z5jdHi6B-myT');
    const session = new Session(sessionId, null, new Date());
    await repository.create(session);

    const result = await useCase.execute('V1StGXR8_Z5jdHi6B-myT', '  田中太郎  ');

    expect(result).not.toBeNull();
    expect(result?.nickname).toBe('田中太郎');
  });
});
