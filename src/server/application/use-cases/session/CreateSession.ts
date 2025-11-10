// CreateSession use case
// Business logic for creating a new user session

import { nanoid } from 'nanoid';
import { Session } from '@/server/domain/entities/Session';
import type { ISessionRepository } from '@/server/domain/repositories/ISessionRepository';
import { SessionId } from '@/server/domain/value-objects/SessionId';
import type { SessionDto } from '../../dto/SessionDto';

/**
 * CreateSession use case
 * Creates a new session with a unique ID and stores it
 */
export class CreateSession {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  /**
   * Executes the use case to create a new session
   * @returns SessionDto with newly created session data
   */
  async execute(): Promise<SessionDto> {
    // Generate unique session ID using nanoid
    const sessionIdValue = nanoid();
    const sessionId = new SessionId(sessionIdValue);

    // Create session entity without nickname (will be set later)
    const session = new Session(sessionId, null, new Date());

    // Save to repository
    await this.sessionRepository.create(session);

    // Return DTO
    return this.toDto(session);
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
