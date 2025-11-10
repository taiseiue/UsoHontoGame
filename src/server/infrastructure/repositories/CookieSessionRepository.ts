// CookieSessionRepository
// Implementation of ISessionRepository using Next.js cookies

import { COOKIE_NAMES } from '@/lib/constants';
import { deleteCookie, getCookie, setCookie } from '@/lib/cookies';
import { Session } from '@/server/domain/entities/Session';
import type { ISessionRepository } from '@/server/domain/repositories/ISessionRepository';
import { Nickname } from '@/server/domain/value-objects/Nickname';
import type { SessionId } from '@/server/domain/value-objects/SessionId';

/**
 * CookieSessionRepository
 * Stores session data in browser cookies
 * - sessionId: HTTP-only cookie for security
 * - nickname: Readable cookie for client-side display
 */
export class CookieSessionRepository implements ISessionRepository {
  /**
   * Creates a new session and stores it in cookies
   * @param session The session to create
   */
  async create(session: Session): Promise<void> {
    // Store session ID in HTTP-only cookie
    await setCookie(COOKIE_NAMES.SESSION_ID, session.sessionId.value, {
      httpOnly: true,
      secure: true,
    });

    // Store nickname if exists (readable by client)
    if (session.nickname) {
      await setCookie(COOKIE_NAMES.NICKNAME, session.nickname.value, {
        httpOnly: false,
        secure: true,
      });
    }
  }

  /**
   * Finds a session by its ID
   * @param sessionId The session ID to find
   * @returns Session if found, null otherwise
   */
  async findById(sessionId: SessionId): Promise<Session | null> {
    const sessionIdValue = await getCookie(COOKIE_NAMES.SESSION_ID);

    // Check if session ID matches
    if (!sessionIdValue || sessionIdValue !== sessionId.value) {
      return null;
    }

    // Get nickname if exists
    const nicknameValue = await getCookie(COOKIE_NAMES.NICKNAME);
    const nickname = nicknameValue ? new Nickname(nicknameValue) : null;

    // Create session entity
    // Note: We don't store createdAt in cookies, so we use current date
    // This is acceptable for MVP as we're not tracking session age
    const session = new Session(sessionId, nickname, new Date());

    return session;
  }

  /**
   * Updates an existing session
   * @param session The session to update
   */
  async update(session: Session): Promise<void> {
    // Update session ID cookie (in case it changed, though unlikely)
    await setCookie(COOKIE_NAMES.SESSION_ID, session.sessionId.value, {
      httpOnly: true,
      secure: true,
    });

    // Update nickname cookie
    if (session.nickname) {
      await setCookie(COOKIE_NAMES.NICKNAME, session.nickname.value, {
        httpOnly: false,
        secure: true,
      });
    } else {
      await deleteCookie(COOKIE_NAMES.NICKNAME);
    }
  }

  /**
   * Deletes a session
   * @param _sessionId The session ID to delete (unused - we delete all session cookies)
   */
  async delete(_sessionId: SessionId): Promise<void> {
    await deleteCookie(COOKIE_NAMES.SESSION_ID);
    await deleteCookie(COOKIE_NAMES.NICKNAME);
  }
}
