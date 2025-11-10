// Session Data Transfer Object
// Contract for transferring session data between layers

/**
 * Session DTO for application layer
 * Used to transfer session data from domain to presentation layer
 */
export interface SessionDto {
  /** Session ID (unwrapped from value object) */
  sessionId: string;
  /** Nickname (null if not yet set) */
  nickname: string | null;
  /** Creation timestamp (ISO 8601 format) */
  createdAt: string;
}
