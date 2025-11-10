// Unit tests for Nickname value object
// Tests validation for nickname requirements

import { describe, expect, it } from 'vitest';
import {
  EmptyNicknameError,
  Nickname,
  NicknameTooLongError,
} from '@/server/domain/value-objects/Nickname';

describe('Nickname', () => {
  describe('constructor', () => {
    it('should create Nickname with valid value', () => {
      const nickname = new Nickname('田中太郎');
      expect(nickname.value).toBe('田中太郎');
    });

    it('should trim whitespace from nickname', () => {
      const nickname = new Nickname('  田中太郎  ');
      expect(nickname.value).toBe('田中太郎');
    });

    it('should throw error for empty string', () => {
      expect(() => new Nickname('')).toThrow(EmptyNicknameError);
    });

    it('should throw error for only whitespace', () => {
      expect(() => new Nickname('   ')).toThrow(EmptyNicknameError);
    });

    it('should throw error for nickname longer than 50 characters', () => {
      const longNickname = 'a'.repeat(51);
      expect(() => new Nickname(longNickname)).toThrow(NicknameTooLongError);
    });

    it('should accept nickname exactly 50 characters', () => {
      const nickname = new Nickname('a'.repeat(50));
      expect(nickname.length).toBe(50);
    });

    it('should accept nickname with 1 character', () => {
      const nickname = new Nickname('a');
      expect(nickname.length).toBe(1);
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      const nick1 = new Nickname('田中太郎');
      const nick2 = new Nickname('田中太郎');
      expect(nick1.equals(nick2)).toBe(true);
    });

    it('should return false for different values', () => {
      const nick1 = new Nickname('田中太郎');
      const nick2 = new Nickname('山田花子');
      expect(nick1.equals(nick2)).toBe(false);
    });

    it('should handle trimmed values for equality', () => {
      const nick1 = new Nickname('田中太郎');
      const nick2 = new Nickname('  田中太郎  ');
      expect(nick1.equals(nick2)).toBe(true);
    });
  });

  describe('length', () => {
    it('should return correct length', () => {
      const nickname = new Nickname('田中太郎');
      expect(nickname.length).toBe(4);
    });
  });

  describe('isEmpty', () => {
    it('should return false for valid nickname', () => {
      const nickname = new Nickname('田中太郎');
      expect(nickname.isEmpty()).toBe(false);
    });
  });
});
