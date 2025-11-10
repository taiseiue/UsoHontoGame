// Session-related type definitions
// Foundation types for session management across the application

/**
 * Session ID type - uniquely identifies a user session
 * Generated using nanoid (21 characters, URL-safe)
 */
export type SessionId = string;

/**
 * Nickname type - user's chosen display name
 * Must be 1-50 characters
 */
export type Nickname = string;

/**
 * Complete session data structure
 * Represents a user's persistent identity across browser sessions
 */
export interface SessionData {
  /** Unique session identifier (nanoid) */
  sessionId: SessionId;
  /** User's display name (optional until set) */
  nickname: Nickname | null;
  /** Timestamp when session was created */
  createdAt: Date;
}
