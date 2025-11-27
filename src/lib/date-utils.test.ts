/**
 * Date Utility Functions Tests
 * Feature: 005-top-active-games
 *
 * Tests for date formatting utilities
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { formatFullDate, formatRelativeTime } from './date-utils';

describe('formatRelativeTime', () => {
  beforeEach(() => {
    // Mock current time to 2025-11-18 12:00:00
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-11-18T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('with Date object input', () => {
    it('should return "たった今" for dates less than 1 minute ago', () => {
      const date = new Date('2025-11-18T11:59:30Z'); // 30 seconds ago
      expect(formatRelativeTime(date)).toBe('たった今');
    });

    it('should return "たった今" for current time', () => {
      const date = new Date('2025-11-18T12:00:00Z'); // now
      expect(formatRelativeTime(date)).toBe('たった今');
    });

    it('should return "1分前" for 1 minute ago', () => {
      const date = new Date('2025-11-18T11:59:00Z'); // 1 minute ago
      expect(formatRelativeTime(date)).toBe('1分前');
    });

    it('should return "5分前" for 5 minutes ago', () => {
      const date = new Date('2025-11-18T11:55:00Z'); // 5 minutes ago
      expect(formatRelativeTime(date)).toBe('5分前');
    });

    it('should return "59分前" for 59 minutes ago', () => {
      const date = new Date('2025-11-18T11:01:00Z'); // 59 minutes ago
      expect(formatRelativeTime(date)).toBe('59分前');
    });

    it('should return "1時間前" for 1 hour ago', () => {
      const date = new Date('2025-11-18T11:00:00Z'); // 1 hour ago
      expect(formatRelativeTime(date)).toBe('1時間前');
    });

    it('should return "2時間前" for 2 hours ago', () => {
      const date = new Date('2025-11-18T10:00:00Z'); // 2 hours ago
      expect(formatRelativeTime(date)).toBe('2時間前');
    });

    it('should return "23時間前" for 23 hours ago', () => {
      const date = new Date('2025-11-17T13:00:00Z'); // 23 hours ago
      expect(formatRelativeTime(date)).toBe('23時間前');
    });

    it('should return "1日前" for 24 hours ago', () => {
      const date = new Date('2025-11-17T12:00:00Z'); // 24 hours ago
      expect(formatRelativeTime(date)).toBe('1日前');
    });

    it('should return "3日前" for 3 days ago', () => {
      const date = new Date('2025-11-15T12:00:00Z'); // 3 days ago
      expect(formatRelativeTime(date)).toBe('3日前');
    });

    it('should return "30日前" for 30 days ago', () => {
      const date = new Date('2025-10-19T12:00:00Z'); // 30 days ago
      expect(formatRelativeTime(date)).toBe('30日前');
    });
  });

  describe('with ISO string input', () => {
    it('should return "たった今" for ISO string less than 1 minute ago', () => {
      const date = '2025-11-18T11:59:30Z'; // 30 seconds ago
      expect(formatRelativeTime(date)).toBe('たった今');
    });

    it('should return "5分前" for ISO string 5 minutes ago', () => {
      const date = '2025-11-18T11:55:00Z'; // 5 minutes ago
      expect(formatRelativeTime(date)).toBe('5分前');
    });

    it('should return "2時間前" for ISO string 2 hours ago', () => {
      const date = '2025-11-18T10:00:00Z'; // 2 hours ago
      expect(formatRelativeTime(date)).toBe('2時間前');
    });

    it('should return "3日前" for ISO string 3 days ago', () => {
      const date = '2025-11-15T12:00:00Z'; // 3 days ago
      expect(formatRelativeTime(date)).toBe('3日前');
    });
  });

  describe('edge cases', () => {
    it('should handle exactly 60 minutes (1 hour)', () => {
      const date = new Date('2025-11-18T11:00:00Z'); // exactly 60 minutes ago
      expect(formatRelativeTime(date)).toBe('1時間前');
    });

    it('should handle exactly 1440 minutes (24 hours)', () => {
      const date = new Date('2025-11-17T12:00:00Z'); // exactly 1440 minutes ago
      expect(formatRelativeTime(date)).toBe('1日前');
    });

    it('should handle 90 minutes (1.5 hours)', () => {
      const date = new Date('2025-11-18T10:30:00Z'); // 90 minutes ago
      expect(formatRelativeTime(date)).toBe('1時間前'); // floor(1.5) = 1
    });

    it('should handle 30 hours (1.25 days)', () => {
      const date = new Date('2025-11-17T06:00:00Z'); // 30 hours ago
      expect(formatRelativeTime(date)).toBe('1日前'); // floor(1.25) = 1
    });
  });
});

describe('formatFullDate', () => {
  describe('with Date object input', () => {
    it('should format date with single-digit month and day', () => {
      const date = new Date(2025, 0, 5, 8, 30, 0); // Local time: 2025-01-05 08:30:00
      expect(formatFullDate(date)).toBe('2025年1月5日 08:30');
    });

    it('should format date with double-digit month and day', () => {
      const date = new Date(2025, 10, 18, 15, 45, 0); // Local time: 2025-11-18 15:45:00
      expect(formatFullDate(date)).toBe('2025年11月18日 15:45');
    });

    it('should zero-pad single-digit hours', () => {
      const date = new Date(2025, 5, 15, 9, 30, 0); // Local time: 2025-06-15 09:30:00
      expect(formatFullDate(date)).toBe('2025年6月15日 09:30');
    });

    it('should zero-pad single-digit minutes', () => {
      const date = new Date(2025, 5, 15, 12, 5, 0); // Local time: 2025-06-15 12:05:00
      expect(formatFullDate(date)).toBe('2025年6月15日 12:05');
    });

    it('should zero-pad both hours and minutes when single-digit', () => {
      const date = new Date(2025, 2, 8, 3, 7, 0); // Local time: 2025-03-08 03:07:00
      expect(formatFullDate(date)).toBe('2025年3月8日 03:07');
    });

    it('should not zero-pad double-digit hours and minutes', () => {
      const date = new Date(2025, 11, 25, 23, 59, 0); // Local time: 2025-12-25 23:59:00
      expect(formatFullDate(date)).toBe('2025年12月25日 23:59');
    });

    it('should handle midnight (00:00)', () => {
      const date = new Date(2025, 6, 20, 0, 0, 0); // Local time: 2025-07-20 00:00:00
      expect(formatFullDate(date)).toBe('2025年7月20日 00:00');
    });

    it('should handle noon (12:00)', () => {
      const date = new Date(2025, 8, 10, 12, 0, 0); // Local time: 2025-09-10 12:00:00
      expect(formatFullDate(date)).toBe('2025年9月10日 12:00');
    });
  });

  describe('with ISO string input', () => {
    it('should format ISO string with single-digit month and day', () => {
      const date = '2025-01-05T08:30:00'; // Local time string (no timezone)
      expect(formatFullDate(date)).toBe('2025年1月5日 08:30');
    });

    it('should format ISO string with double-digit month and day', () => {
      const date = '2025-11-18T15:45:00'; // Local time string (no timezone)
      expect(formatFullDate(date)).toBe('2025年11月18日 15:45');
    });

    it('should format ISO string with zero-padded time', () => {
      const date = '2025-03-08T03:07:00'; // Local time string (no timezone)
      expect(formatFullDate(date)).toBe('2025年3月8日 03:07');
    });

    it('should format ISO string at midnight', () => {
      const date = '2025-07-20T00:00:00'; // Local time string (no timezone)
      expect(formatFullDate(date)).toBe('2025年7月20日 00:00');
    });
  });

  describe('edge cases', () => {
    it('should handle leap year date', () => {
      const date = new Date(2024, 1, 29, 10, 30, 0); // Local time: 2024-02-29 10:30:00
      expect(formatFullDate(date)).toBe('2024年2月29日 10:30');
    });

    it('should handle year boundary', () => {
      const date = new Date(2024, 11, 31, 23, 59, 0); // Local time: 2024-12-31 23:59:00
      expect(formatFullDate(date)).toBe('2024年12月31日 23:59');
    });

    it('should handle new year', () => {
      const date = new Date(2025, 0, 1, 0, 0, 0); // Local time: 2025-01-01 00:00:00
      expect(formatFullDate(date)).toBe('2025年1月1日 00:00');
    });
  });
});
