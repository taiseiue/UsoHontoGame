import { describe, expect, it } from 'vitest';
import {
  GameStatus,
  InvalidGameStatusError,
  type GameStatusValue,
} from '@/server/domain/value-objects/GameStatus';

describe('GameStatus', () => {
  describe('constructor', () => {
    it('should create GameStatus with 準備中', () => {
      const status = new GameStatus('準備中');
      expect(status.value).toBe('準備中');
    });

    it('should create GameStatus with 出題中', () => {
      const status = new GameStatus('出題中');
      expect(status.value).toBe('出題中');
    });

    it('should create GameStatus with 締切', () => {
      const status = new GameStatus('締切');
      expect(status.value).toBe('締切');
    });

    it('should throw error for invalid status', () => {
      // @ts-expect-error Testing invalid input
      expect(() => new GameStatus('invalid')).toThrow(InvalidGameStatusError);
    });

    it('should throw error for empty string', () => {
      // @ts-expect-error Testing invalid input
      expect(() => new GameStatus('')).toThrow(InvalidGameStatusError);
    });

    it('should throw error for English equivalent', () => {
      // @ts-expect-error Testing invalid input
      expect(() => new GameStatus('accepting')).toThrow(InvalidGameStatusError);
    });
  });

  describe('isAcceptingResponses', () => {
    it('should return false for 準備中 status', () => {
      const status = new GameStatus('準備中');
      expect(status.isAcceptingResponses()).toBe(false);
    });

    it('should return true for 出題中 status', () => {
      const status = new GameStatus('出題中');
      expect(status.isAcceptingResponses()).toBe(true);
    });

    it('should return false for 締切 status', () => {
      const status = new GameStatus('締切');
      expect(status.isAcceptingResponses()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for same status value', () => {
      const status1 = new GameStatus('出題中');
      const status2 = new GameStatus('出題中');
      expect(status1.equals(status2)).toBe(true);
    });

    it('should return false for different status values', () => {
      const status1 = new GameStatus('準備中');
      const status2 = new GameStatus('出題中');
      expect(status1.equals(status2)).toBe(false);
    });

    it('should handle comparison with 締切 status', () => {
      const status1 = new GameStatus('締切');
      const status2 = new GameStatus('締切');
      expect(status1.equals(status2)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return string representation for 準備中', () => {
      const status = new GameStatus('準備中');
      expect(status.toString()).toBe('準備中');
    });

    it('should return string representation for 出題中', () => {
      const status = new GameStatus('出題中');
      expect(status.toString()).toBe('出題中');
    });

    it('should return string representation for 締切', () => {
      const status = new GameStatus('締切');
      expect(status.toString()).toBe('締切');
    });
  });

  describe('value getter', () => {
    it('should return the status value', () => {
      const statusValue: GameStatusValue = '出題中';
      const status = new GameStatus(statusValue);
      expect(status.value).toBe(statusValue);
    });

    it('should be immutable', () => {
      const status = new GameStatus('準備中');
      const value = status.value;
      expect(status.value).toBe(value);
    });
  });
});
