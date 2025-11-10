// ValidateSession use case
// Business logic for validating an existing session

import type { Session } from '@/server/domain/entities/Session';
import type { ISessionRepository } from '@/server/domain/repositories/ISessionRepository';
import { SessionId } from '@/server/domain/value-objects/SessionId';
import type { SessionDto } from '../../dto/SessionDto';

/**
 * ValidateSession use case
 * Validates a session ID and returns session data if valid
 */
export class ValidateSession {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  /**
   * Executes the use case to validate a session
   * @param sessionIdValue The session ID string to validate
   * @returns SessionDto if session exists, null otherwise
   */
  async execute(sessionIdValue: string): Promise<SessionDto | null> {
    try {
      // Validate session ID format
      const sessionId = new SessionId(sessionIdValue);

      // Find session in repository
      const session = await this.sessionRepository.findById(sessionId);

      if (!session) {
        return null;
      }

      // Return DTO
      return this.toDto(session);
    } catch {
      // Invalid session ID format
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
