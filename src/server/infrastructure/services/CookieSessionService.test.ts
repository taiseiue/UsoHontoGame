/**
 * CookieSessionService Tests
 * Tests for cookie-based session service implementation
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COOKIE_NAMES } from '@/lib/constants';
import { CookieSessionService } from './CookieSessionService';

// Mock cookie utilities
vi.mock('@/lib/cookies', () => ({
  getCookie: vi.fn(),
}));

describe('CookieSessionService', () => {
  let service: CookieSessionService;
  let mockGetCookie: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    service = new CookieSessionService();

    // Get mock function reference
    const cookies = await import('@/lib/cookies');
    mockGetCookie = cookies.getCookie as ReturnType<typeof vi.fn>;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentSessionId', () => {
    it('should return session ID when cookie exists', async () => {
      const mockSessionId = 'test_session_id_12345';
      mockGetCookie.mockResolvedValue(mockSessionId);

      const result = await service.getCurrentSessionId();

      expect(result).toBe(mockSessionId);
      expect(mockGetCookie).toHaveBeenCalledWith(COOKIE_NAMES.SESSION_ID);
      expect(mockGetCookie).toHaveBeenCalledTimes(1);
    });

    it('should return null when session cookie does not exist', async () => {
      mockGetCookie.mockResolvedValue(null);

      const result = await service.getCurrentSessionId();

      expect(result).toBeNull();
      expect(mockGetCookie).toHaveBeenCalledWith(COOKIE_NAMES.SESSION_ID);
    });

    it('should handle multiple sequential calls', async () => {
      mockGetCookie
        .mockResolvedValueOnce('session_1234567890123')
        .mockResolvedValueOnce('session_234567890123A')
        .mockResolvedValueOnce(null);

      const result1 = await service.getCurrentSessionId();
      const result2 = await service.getCurrentSessionId();
      const result3 = await service.getCurrentSessionId();

      expect(result1).toBe('session_1234567890123');
      expect(result2).toBe('session_234567890123A');
      expect(result3).toBeNull();
      expect(mockGetCookie).toHaveBeenCalledTimes(3);
    });

    it('should use correct cookie name constant', async () => {
      mockGetCookie.mockResolvedValue('test_session_id_12345');

      await service.getCurrentSessionId();

      expect(mockGetCookie).toHaveBeenCalledWith('sessionId');
    });
  });

  describe('validateCurrentSession', () => {
    it('should return valid result when session exists', async () => {
      const mockSessionId = 'valid_session_id_12345_123456789012323';
      mockGetCookie.mockResolvedValue(mockSessionId);

      const result = await service.validateCurrentSession();

      expect(result).toEqual({
        valid: true,
        sessionId: mockSessionId,
      });
      expect(mockGetCookie).toHaveBeenCalledWith(COOKIE_NAMES.SESSION_ID);
    });

    it('should return invalid result when session does not exist', async () => {
      mockGetCookie.mockResolvedValue(null);

      const result = await service.validateCurrentSession();

      expect(result).toEqual({
        valid: false,
        sessionId: null,
      });
    });

    it('should validate multiple session checks', async () => {
      mockGetCookie
        .mockResolvedValueOnce('valid_session_id_12345')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('another-valid_session_id_12345');

      const result1 = await service.validateCurrentSession();
      const result2 = await service.validateCurrentSession();
      const result3 = await service.validateCurrentSession();

      expect(result1.valid).toBe(true);
      expect(result1.sessionId).toBe('valid_session_id_12345');

      expect(result2.valid).toBe(false);
      expect(result2.sessionId).toBeNull();

      expect(result3.valid).toBe(true);
      expect(result3.sessionId).toBe('another-valid_session_id_12345');

      expect(mockGetCookie).toHaveBeenCalledTimes(3);
    });

    it('should handle empty string session ID as valid', async () => {
      // Even though empty string is falsy, it's technically a non-null value
      mockGetCookie.mockResolvedValue('');

      const result = await service.validateCurrentSession();

      // Empty string is not null, so it's considered valid (sessionId !== null)
      expect(result.valid).toBe(true);
      expect(result.sessionId).toBe('');
    });
  });

  describe('requireCurrentSession', () => {
    it('should return session ID when session exists', async () => {
      const mockSessionId = 'required_session_id_4';
      mockGetCookie.mockResolvedValue(mockSessionId);

      const result = await service.requireCurrentSession();

      expect(result).toBe(mockSessionId);
      expect(mockGetCookie).toHaveBeenCalledWith(COOKIE_NAMES.SESSION_ID);
    });

    it('should throw error when session does not exist', async () => {
      mockGetCookie.mockResolvedValue(null);

      await expect(service.requireCurrentSession()).rejects.toThrow(
        'セッションが見つかりません。ログインし直してください。'
      );

      expect(mockGetCookie).toHaveBeenCalledWith(COOKIE_NAMES.SESSION_ID);
    });

    it('should throw error with Japanese message', async () => {
      mockGetCookie.mockResolvedValue(null);

      try {
        await service.requireCurrentSession();
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('セッションが見つかりません');
        expect((error as Error).message).toContain('ログインし直してください');
      }
    });

    it('should throw error when session is empty string', async () => {
      mockGetCookie.mockResolvedValue('');

      await expect(service.requireCurrentSession()).rejects.toThrow();
    });

    it('should succeed on second call if session is restored', async () => {
      // First call - no session
      mockGetCookie.mockResolvedValueOnce(null);

      await expect(service.requireCurrentSession()).rejects.toThrow();

      // Second call - session restored
      mockGetCookie.mockResolvedValueOnce('restored_session_1234');

      const result = await service.requireCurrentSession();
      expect(result).toBe('restored_session_1234');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle validate-then-require flow for valid session', async () => {
      const mockSessionId = 'integration_id_123456';
      mockGetCookie.mockResolvedValue(mockSessionId);

      // Validate first
      const validation = await service.validateCurrentSession();
      expect(validation.valid).toBe(true);

      // Then require
      const sessionId = await service.requireCurrentSession();
      expect(sessionId).toBe(mockSessionId);

      expect(mockGetCookie).toHaveBeenCalledTimes(2);
    });

    it('should handle validate-then-require flow for invalid session', async () => {
      mockGetCookie.mockResolvedValue(null);

      // Validate first
      const validation = await service.validateCurrentSession();
      expect(validation.valid).toBe(false);

      // Then require - should throw
      await expect(service.requireCurrentSession()).rejects.toThrow();

      expect(mockGetCookie).toHaveBeenCalledTimes(2);
    });

    it('should handle getCurrentSessionId-then-validateCurrentSession flow', async () => {
      const mockSessionId = 'flow-test_session_id_12345';
      mockGetCookie.mockResolvedValue(mockSessionId);

      // Get current session ID
      const currentId = await service.getCurrentSessionId();
      expect(currentId).toBe(mockSessionId);

      // Validate
      const validation = await service.validateCurrentSession();
      expect(validation.valid).toBe(true);
      expect(validation.sessionId).toBe(mockSessionId);

      expect(mockGetCookie).toHaveBeenCalledTimes(2);
    });
  });
});
