// SetNickname use case
// Business logic for setting/updating a user's nickname

import type { Session } from '@/server/domain/entities/Session';
import type { ISessionRepository } from '@/server/domain/repositories/ISessionRepository';
import { Nickname } from '@/server/domain/value-objects/Nickname';
import { SessionId } from '@/server/domain/value-objects/SessionId';
import type { SessionDto } from '../../dto/SessionDto';

/**
 * SetNickname use case
 * Sets or updates a nickname for an existing session
 */
export class SetNickname {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  /**
   * Executes the use case to set a nickname
   * @param sessionIdValue The session ID string
   * @param nicknameValue The nickname string
   * @returns SessionDto with updated nickname if successful, null otherwise
   */
  async execute(sessionIdValue: string, nicknameValue: string): Promise<SessionDto | null> {
    try {
      // Validate inputs
      const sessionId = new SessionId(sessionIdValue);
      const nickname = new Nickname(nicknameValue);

      // Find session
      const session = await this.sessionRepository.findById(sessionId);

      if (!session) {
        return null;
      }

      // Update nickname
      session.setNickname(nickname);

      // Save to repository
      await this.sessionRepository.update(session);

      // Return DTO
      return this.toDto(session);
    } catch {
      // Invalid session ID or nickname format
      return null;
    }
  }

  /**
   * Converts Session entity to SessionDto
   * @param session The session entity
   * @returns SessionDto for presentation layer
   */
  private toDto(session: Session): SessionDto {
    return {
      sessionId: session.sessionId.value,
      nickname: session.nickname?.value ?? null,
      createdAt: session.createdAt.toISOString(),
    };
  }
}
