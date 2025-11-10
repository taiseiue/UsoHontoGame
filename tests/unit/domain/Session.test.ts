// Unit tests for Session entity
// Tests entity invariants and validation

import { describe, expect, it } from 'vitest';
import { Session } from '@/server/domain/entities/Session';
import { Nickname } from '@/server/domain/value-objects/Nickname';
import { SessionId } from '@/server/domain/value-objects/SessionId';

describe('Session', () => {
  describe('constructor', () => {
    it('should create Session without nickname', () => {
      const sessionId = new SessionId('V1StGXR8_Z5jdHi6B-myT');
      const createdAt = new Date();
      const session = new Session(sessionId, null, createdAt);

      expect(session.sessionId).toBe(sessionId);
      expect(session.nickname).toBeNull();
      expect(session.createdAt).toBe(createdAt);
    });

    it('should create Session with nickname', () => {
      const sessionId = new SessionId('V1StGXR8_Z5jdHi6B-myT');
      const nickname = new Nickname('田中太郎');
      const createdAt = new Date();
      const session = new Session(sessionId, nickname, createdAt);

      expect(session.sessionId).toBe(sessionId);
      expect(session.nickname).toBe(nickname);
      expect(session.createdAt).toBe(createdAt);
    });

    it('should throw error if createdAt is in the future', () => {
      const sessionId = new SessionId('V1StGXR8_Z5jdHi6B-myT');
      const futureDate = new Date(Date.now() + 10000);

      expect(() => new Session(sessionId, null, futureDate)).toThrow();
    });
  });

  describe('setNickname', () => {
    it('should set nickname on session without nickname', () => {
      const sessionId = new SessionId('V1StGXR8_Z5jdHi6B-myT');
      const session = new Session(sessionId, null, new Date());
      const nickname = new Nickname('田中太郎');

      session.setNickname(nickname);
      expect(session.nickname).toBe(nickname);
    });

    it('should update existing nickname', () => {
      const sessionId = new SessionId('V1StGXR8_Z5jdHi6B-myT');
      const oldNickname = new Nickname('田中太郎');
      const session = new Session(sessionId, oldNickname, new Date());

      const newNickname = new Nickname('山田花子');
      session.setNickname(newNickname);
      expect(session.nickname).toBe(newNickname);
    });
  });

  describe('hasNickname', () => {
    it('should return false when nickname is null', () => {
      const sessionId = new SessionId('V1StGXR8_Z5jdHi6B-myT');
      const session = new Session(sessionId, null, new Date());
      expect(session.hasNickname()).toBe(false);
    });

    it('should return true when nickname is set', () => {
      const sessionId = new SessionId('V1StGXR8_Z5jdHi6B-myT');
      const nickname = new Nickname('田中太郎');
      const session = new Session(sessionId, nickname, new Date());
      expect(session.hasNickname()).toBe(true);
    });
  });

  describe('validate', () => {
    it('should validate session with valid data', () => {
      const sessionId = new SessionId('V1StGXR8_Z5jdHi6B-myT');
      const session = new Session(sessionId, null, new Date());
      expect(() => session.validate()).not.toThrow();
    });
  });
});
