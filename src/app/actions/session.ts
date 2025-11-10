'use server';

// Server Actions for session management
// Provides server-side functions for session operations

import { COOKIE_NAMES } from '@/lib/constants';
import { getCookie } from '@/lib/cookies';
import { CreateSession } from '@/server/application/use-cases/session/CreateSession';
import { SetNickname } from '@/server/application/use-cases/session/SetNickname';
import { ValidateSession } from '@/server/application/use-cases/session/ValidateSession';
import { EmptyNicknameError, NicknameTooLongError } from '@/server/domain/value-objects/Nickname';
import { CookieSessionRepository } from '@/server/infrastructure/repositories/CookieSessionRepository';

// Create singleton repository instance
const sessionRepository = new CookieSessionRepository();

/**
 * Result type for createSessionAction
 */
export type CreateSessionResult =
  | { success: true; sessionId: string }
  | { success: false; error: { code: string; message: string } };

/**
 * Result type for setNicknameAction
 */
export type SetNicknameResult =
  | { success: true; nickname: string }
  | { success: false; error: { code: string; message: string } };

/**
 * Result type for validateSessionAction
 */
export type ValidateSessionResult = {
  valid: boolean;
  sessionId: string | null;
  nickname: string | null;
  hasNickname: boolean;
};

/**
 * Creates a new session with a unique session ID
 * Stores session ID in HTTP-only cookie
 * @returns Session ID and success status
 */
export async function createSessionAction(): Promise<CreateSessionResult> {
  try {
    const useCase = new CreateSession(sessionRepository);
    const session = await useCase.execute();

    return {
      success: true,
      sessionId: session.sessionId,
    };
  } catch {
    return {
      success: false,
      error: {
        code: 'SESSION_CREATION_FAILED',
        message: 'Failed to create session',
      },
    };
  }
}

/**
 * Sets or updates the nickname for the current session
 * @param nickname The nickname to set (1-50 characters)
 * @returns Success status and nickname
 */
export async function setNicknameAction(nickname: string): Promise<SetNicknameResult> {
  try {
    const createSessionUseCase = new CreateSession(sessionRepository);
    const session = await createSessionUseCase.execute();

      // Execute use case
    const useCase = new SetNickname(sessionRepository);
    const result = await useCase.execute(session.sessionId, nickname);

    if (!result) {
      return {
        success: false,
        error: {
          code: 'NICKNAME_UPDATE_FAILED',
          message: 'ニックネームの設定に失敗しました',
        },
      };
    }

    return {
      success: true,
      nickname: result.nickname ?? '',
    };
  } catch (error) {
    if (error instanceof EmptyNicknameError) {
      return {
        success: false,
        error: {
          code: 'EMPTY_NICKNAME',
          message: 'ニックネームを入力してください',
        },
      };
    }

    if (error instanceof NicknameTooLongError) {
      return {
        success: false,
        error: {
          code: 'NICKNAME_TOO_LONG',
          message: 'ニックネームは50文字以内で入力してください',
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'NICKNAME_UPDATE_FAILED',
        message: 'ニックネームの設定に失敗しました',
      },
    };
  }
}

/**
 * Validates the current session from cookies
 * @returns Session validity status and data
 */
export async function validateSessionAction(): Promise<ValidateSessionResult> {
  try {
    // Get session ID from cookie
    const sessionId = await getCookie(COOKIE_NAMES.SESSION_ID);

    if (!sessionId) {
      return {
        valid: false,
        sessionId: null,
        nickname: null,
        hasNickname: false,
      };
    }

    // Validate session
    const useCase = new ValidateSession(sessionRepository);
    const session = await useCase.execute(sessionId);

    if (!session) {
      return {
        valid: false,
        sessionId: null,
        nickname: null,
        hasNickname: false,
      };
    }

    return {
      valid: true,
      sessionId: session.sessionId,
      nickname: session.nickname,
      hasNickname: session.nickname !== null,
    };
  } catch {
    return {
      valid: false,
      sessionId: null,
      nickname: null,
      hasNickname: false,
    };
  }
}
