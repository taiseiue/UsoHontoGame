/**
 * CookieSessionRepository Tests
 * Tests for cookie-based session repository implementation
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COOKIE_NAMES } from '@/lib/constants';
import { Session } from '@/server/domain/entities/Session';
import { Nickname } from '@/server/domain/value-objects/Nickname';
import { SessionId } from '@/server/domain/value-objects/SessionId';
import { CookieSessionRepository } from './CookieSessionRepository';

// Mock cookie utilities
vi.mock('@/lib/cookies', () => ({
  getCookie: vi.fn(),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
}));

// Helper to create valid 21-char nanoid-format session IDs
function _createValidSessionId(prefix: string): string {
  return `${prefix}${'_'.repeat(21 - prefix.length)}`.substring(0, 21);
}

describe('CookieSessionRepository', () => {
  let repository: CookieSessionRepository;
  let mockGetCookie: ReturnType<typeof vi.fn>;
  let mockSetCookie: ReturnType<typeof vi.fn>;
  let mockDeleteCookie: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    repository = new CookieSessionRepository();

    // Get mock function references
    const cookies = await import('@/lib/cookies');
    mockGetCookie = cookies.getCookie as ReturnType<typeof vi.fn>;
    mockSetCookie = cookies.setCookie as ReturnType<typeof vi.fn>;
    mockDeleteCookie = cookies.deleteCookie as ReturnType<typeof vi.fn>;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create session with sessionId and nickname cookies', async () => {
      const sessionId = new SessionId('test_session_id_12345');
      const nickname = new Nickname('TestUser');
      const session = new Session(sessionId, nickname, new Date());

      await repository.create(session);

      // Verify sessionId cookie
      expect(mockSetCookie).toHaveBeenCalledWith(
        COOKIE_NAMES.SESSION_ID,
        'test_session_id_12345',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
        })
      );

      // Verify nickname cookie
      expect(mockSetCookie).toHaveBeenCalledWith(
        COOKIE_NAMES.NICKNAME,
        'TestUser',
        expect.objectContaining({
          httpOnly: false,
          secure: true,
        })
      );

      expect(mockSetCookie).toHaveBeenCalledTimes(2);
    });

    it('should create session with only sessionId when nickname is null', async () => {
      const sessionId = new SessionId('test_session_id_45678');
      const session = new Session(sessionId, null, new Date());

      await repository.create(session);

      // Verify sessionId cookie
      expect(mockSetCookie).toHaveBeenCalledWith(
        COOKIE_NAMES.SESSION_ID,
        'test_session_id_45678',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
        })
      );

      // Nickname cookie should not be set
      expect(mockSetCookie).toHaveBeenCalledTimes(1);
    });

    it('should set httpOnly flag correctly for sessionId', async () => {
      const session = new Session(new SessionId('secure_session_id_abc'), null, new Date());

      await repository.create(session);

      expect(mockSetCookie).toHaveBeenCalledWith(
        'sessionId',
        'secure_session_id_abc',
        expect.objectContaining({
          httpOnly: true,
        })
      );
    });

    it('should set httpOnly flag correctly for nickname', async () => {
      const session = new Session(
        new SessionId('session_nickname_1234'),
        new Nickname('ReadableNickname'),
        new Date()
      );

      await repository.create(session);

      expect(mockSetCookie).toHaveBeenCalledWith(
        'nickname',
        'ReadableNickname',
        expect.objectContaining({
          httpOnly: false,
        })
      );
    });

    it('should set secure flag for both cookies', async () => {
      const session = new Session(
        new SessionId('secure_test_id_123456'),
        new Nickname('SecureUser'),
        new Date()
      );

      await repository.create(session);

      expect(mockSetCookie).toHaveBeenNthCalledWith(
        1,
        'sessionId',
        'secure_test_id_123456',
        expect.objectContaining({ secure: true })
      );

      expect(mockSetCookie).toHaveBeenNthCalledWith(
        2,
        'nickname',
        'SecureUser',
        expect.objectContaining({ secure: true })
      );
    });
  });

  describe('findById', () => {
    it('should return session when sessionId matches', async () => {
      const sessionId = new SessionId('find_session_id_12345');
      const nicknameValue = 'FindUser';

      mockGetCookie.mockImplementation(async (name: string) => {
        if (name === COOKIE_NAMES.SESSION_ID) return 'find_session_id_12345';
        if (name === COOKIE_NAMES.NICKNAME) return nicknameValue;
        return null;
      });

      const result = await repository.findById(sessionId);

      expect(result).not.toBeNull();
      expect(result?.sessionId.value).toBe('find_session_id_12345');
      expect(result?.nickname?.value).toBe('FindUser');
      expect(result?.createdAt).toBeInstanceOf(Date);

      expect(mockGetCookie).toHaveBeenCalledWith(COOKIE_NAMES.SESSION_ID);
      expect(mockGetCookie).toHaveBeenCalledWith(COOKIE_NAMES.NICKNAME);
    });

    it('should return session without nickname when nickname cookie is missing', async () => {
      const sessionId = new SessionId('no_nickname_id_123456');

      mockGetCookie.mockImplementation(async (name: string) => {
        if (name === COOKIE_NAMES.SESSION_ID) return 'no_nickname_id_123456';
        return null;
      });

      const result = await repository.findById(sessionId);

      expect(result).not.toBeNull();
      expect(result?.sessionId.value).toBe('no_nickname_id_123456');
      expect(result?.nickname).toBeNull();
    });

    it('should return null when sessionId cookie does not exist', async () => {
      const sessionId = new SessionId('nonexistent_id_123456');

      mockGetCookie.mockResolvedValue(null);

      const result = await repository.findById(sessionId);

      expect(result).toBeNull();
    });

    it('should return null when sessionId does not match', async () => {
      const sessionId = new SessionId('expected_session-----');

      mockGetCookie.mockResolvedValue('different_session_123');

      const result = await repository.findById(sessionId);

      expect(result).toBeNull();
    });

    it('should check sessionId cookie before nickname cookie', async () => {
      const sessionId = new SessionId('check_order_id_123456');

      mockGetCookie.mockImplementation(async (name: string) => {
        if (name === COOKIE_NAMES.SESSION_ID) return 'check_order_id_123456';
        if (name === COOKIE_NAMES.NICKNAME) return 'OrderUser';
        return null;
      });

      await repository.findById(sessionId);

      expect(mockGetCookie).toHaveBeenNthCalledWith(1, COOKIE_NAMES.SESSION_ID);
      expect(mockGetCookie).toHaveBeenNthCalledWith(2, COOKIE_NAMES.NICKNAME);
    });

    it('should not check nickname cookie when sessionId does not match', async () => {
      const sessionId = new SessionId('expected_session-----');

      mockGetCookie.mockResolvedValue('different_session_123');

      await repository.findById(sessionId);

      // Should only call getCookie once for sessionId
      expect(mockGetCookie).toHaveBeenCalledTimes(1);
      expect(mockGetCookie).toHaveBeenCalledWith(COOKIE_NAMES.SESSION_ID);
    });

    it('should handle empty string sessionId cookie', async () => {
      const sessionId = new SessionId('valid_session--------');

      mockGetCookie.mockResolvedValue('');

      const result = await repository.findById(sessionId);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update both sessionId and nickname cookies', async () => {
      const session = new Session(
        new SessionId('update_session_id_123'),
        new Nickname('UpdatedUser'),
        new Date()
      );

      await repository.update(session);

      expect(mockSetCookie).toHaveBeenCalledWith(
        COOKIE_NAMES.SESSION_ID,
        'update_session_id_123',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
        })
      );

      expect(mockSetCookie).toHaveBeenCalledWith(
        COOKIE_NAMES.NICKNAME,
        'UpdatedUser',
        expect.objectContaining({
          httpOnly: false,
          secure: true,
        })
      );

      expect(mockSetCookie).toHaveBeenCalledTimes(2);
    });

    it('should delete nickname cookie when session has no nickname', async () => {
      const session = new Session(new SessionId('update_no_nick_123456'), null, new Date());

      await repository.update(session);

      // Should set sessionId
      expect(mockSetCookie).toHaveBeenCalledWith(
        COOKIE_NAMES.SESSION_ID,
        'update_no_nick_123456',
        expect.any(Object)
      );

      // Should delete nickname
      expect(mockDeleteCookie).toHaveBeenCalledWith(COOKIE_NAMES.NICKNAME);

      expect(mockSetCookie).toHaveBeenCalledTimes(1);
      expect(mockDeleteCookie).toHaveBeenCalledTimes(1);
    });

    it('should handle adding nickname to session that had none', async () => {
      const session = new Session(
        new SessionId('add_nickname_id_12345'),
        new Nickname('NewNickname'),
        new Date()
      );

      await repository.update(session);

      expect(mockSetCookie).toHaveBeenCalledWith('nickname', 'NewNickname', expect.any(Object));
    });

    it('should handle changing nickname', async () => {
      const session = new Session(
        new SessionId('change_nick_id_123456'),
        new Nickname('ChangedNickname'),
        new Date()
      );

      await repository.update(session);

      expect(mockSetCookie).toHaveBeenCalledWith('nickname', 'ChangedNickname', expect.any(Object));
    });

    it('should handle removing nickname', async () => {
      const session = new Session(new SessionId('remove_nick_id_123456'), null, new Date());

      await repository.update(session);

      expect(mockDeleteCookie).toHaveBeenCalledWith(COOKIE_NAMES.NICKNAME);
    });
  });

  describe('delete', () => {
    it('should delete both sessionId and nickname cookies', async () => {
      const sessionId = new SessionId('delete_session_id_123');

      await repository.delete(sessionId);

      expect(mockDeleteCookie).toHaveBeenCalledWith(COOKIE_NAMES.SESSION_ID);
      expect(mockDeleteCookie).toHaveBeenCalledWith(COOKIE_NAMES.NICKNAME);
      expect(mockDeleteCookie).toHaveBeenCalledTimes(2);
    });

    it('should delete cookies in correct order', async () => {
      const sessionId = new SessionId('order_test_id_1234567');

      await repository.delete(sessionId);

      expect(mockDeleteCookie).toHaveBeenNthCalledWith(1, COOKIE_NAMES.SESSION_ID);
      expect(mockDeleteCookie).toHaveBeenNthCalledWith(2, COOKIE_NAMES.NICKNAME);
    });

    it('should delete cookies regardless of sessionId parameter', async () => {
      // SessionId parameter is ignored - all session cookies are deleted
      const sessionId1 = new SessionId('ignored_session_id_12');
      const sessionId2 = new SessionId('ignored_session_id_34');

      await repository.delete(sessionId1);
      await repository.delete(sessionId2);

      // Both calls should delete the same cookies
      expect(mockDeleteCookie).toHaveBeenCalledTimes(4);
      expect(mockDeleteCookie).toHaveBeenNthCalledWith(1, COOKIE_NAMES.SESSION_ID);
      expect(mockDeleteCookie).toHaveBeenNthCalledWith(2, COOKIE_NAMES.NICKNAME);
      expect(mockDeleteCookie).toHaveBeenNthCalledWith(3, COOKIE_NAMES.SESSION_ID);
      expect(mockDeleteCookie).toHaveBeenNthCalledWith(4, COOKIE_NAMES.NICKNAME);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle create-find-update-delete lifecycle', async () => {
      const sessionId = new SessionId('lifecycle_session----');
      const nickname1 = new Nickname('FirstNickname');
      const nickname2 = new Nickname('UpdatedNickname');

      // Create
      const session1 = new Session(sessionId, nickname1, new Date());
      await repository.create(session1);
      expect(mockSetCookie).toHaveBeenCalledTimes(2);

      // Find
      mockGetCookie.mockImplementation(async (name: string) => {
        if (name === COOKIE_NAMES.SESSION_ID) return 'lifecycle_session----';
        if (name === COOKIE_NAMES.NICKNAME) return 'FirstNickname';
        return null;
      });

      const found = await repository.findById(sessionId);
      expect(found?.nickname?.value).toBe('FirstNickname');

      // Update
      const session2 = new Session(sessionId, nickname2, new Date());
      await repository.update(session2);
      expect(mockSetCookie).toHaveBeenCalledWith('nickname', 'UpdatedNickname', expect.any(Object));

      // Delete
      await repository.delete(sessionId);
      expect(mockDeleteCookie).toHaveBeenCalledTimes(2);
    });

    it('should handle session without nickname throughout lifecycle', async () => {
      const sessionId = new SessionId('no_nickname_lifecycl1');

      // Create without nickname
      const session = new Session(sessionId, null, new Date());
      await repository.create(session);
      expect(mockSetCookie).toHaveBeenCalledTimes(1); // Only sessionId

      // Find
      mockGetCookie.mockImplementation(async (name: string) => {
        if (name === COOKIE_NAMES.SESSION_ID) return 'no_nickname_lifecycl1';
        return null;
      });

      const found = await repository.findById(sessionId);
      expect(found?.nickname).toBeNull();

      // Update without nickname
      await repository.update(session);
      expect(mockDeleteCookie).toHaveBeenCalledWith(COOKIE_NAMES.NICKNAME);

      // Delete
      await repository.delete(sessionId);
    });

    it('should handle nickname changes', async () => {
      const sessionId = new SessionId('nickname_change------');

      // Start without nickname
      const session1 = new Session(sessionId, null, new Date());
      await repository.create(session1);

      // Add nickname
      const session2 = new Session(sessionId, new Nickname('AddedNickname'), new Date());
      await repository.update(session2);
      expect(mockSetCookie).toHaveBeenCalledWith('nickname', 'AddedNickname', expect.any(Object));

      // Change nickname
      const session3 = new Session(sessionId, new Nickname('ChangedNickname'), new Date());
      await repository.update(session3);
      expect(mockSetCookie).toHaveBeenCalledWith('nickname', 'ChangedNickname', expect.any(Object));

      // Remove nickname
      const session4 = new Session(sessionId, null, new Date());
      await repository.update(session4);
      expect(mockDeleteCookie).toHaveBeenCalledWith(COOKIE_NAMES.NICKNAME);
    });
  });
});
