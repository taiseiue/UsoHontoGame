// Session Repository Interface
// Abstraction for session storage operations

import type { Session } from '../entities/Session';
import type { SessionId } from '../value-objects/SessionId';

/**
 * Session repository interface
 * Defines contract for session storage operations
 */
export interface ISessionRepository {
  /**
   * Create a new session
   * @param session Session entity to create
   */
  create(session: Session): Promise<void>;

  /**
   * Find session by ID
   * @param sessionId Session ID to search for
   * @returns Session entity or null if not found
   */
  findById(sessionId: SessionId): Promise<Session | null>;

  /**
   * Update existing session
   * @param session Session entity with updated data
   */
  update(session: Session): Promise<void>;

  /**
   * Delete session
   * @param sessionId Session ID to delete
   */
  delete(sessionId: SessionId): Promise<void>;
}
