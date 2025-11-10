// Unit tests for SessionId value object
// Tests validation and immutability

import { describe, expect, it } from 'vitest';
import { InvalidSessionIdError, SessionId } from '@/server/domain/value-objects/SessionId';

describe('SessionId', () => {
  describe('constructor', () => {
    it('should create SessionId with valid 21-char nanoid', () => {
      const validId = 'V1StGXR8_Z5jdHi6B-myT';
      const sessionId = new SessionId(validId);
      expect(sessionId.value).toBe(validId);
    });

    it('should throw error for invalid format (wrong characters)', () => {
      expect(() => new SessionId('invalid!@#$%^&*()')).toThrow(InvalidSessionIdError);
    });

    it('should throw error for wrong length (too short)', () => {
      expect(() => new SessionId('short')).toThrow(InvalidSessionIdError);
    });

    it('should throw error for wrong length (too long)', () => {
      expect(() => new SessionId('V1StGXR8_Z5jdHi6B-myT123')).toThrow(InvalidSessionIdError);
    });

    it('should throw error for empty string', () => {
      expect(() => new SessionId('')).toThrow(InvalidSessionIdError);
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      const id1 = new SessionId('V1StGXR8_Z5jdHi6B-myT');
      const id2 = new SessionId('V1StGXR8_Z5jdHi6B-myT');
      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for different values', () => {
      const id1 = new SessionId('V1StGXR8_Z5jdHi6B-myT');
      const id2 = new SessionId('A2BcDEF9_X1yzABC1-3de');
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('isValid', () => {
    it('should validate correct nanoid format', () => {
      const sessionId = new SessionId('V1StGXR8_Z5jdHi6B-myT');
      expect(sessionId.isValid()).toBe(true);
    });
  });
});
