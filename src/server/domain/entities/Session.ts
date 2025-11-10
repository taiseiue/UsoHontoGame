// Session entity
// Represents a user's persistent identity across browser sessions

import type { Nickname } from '../value-objects/Nickname';
import type { SessionId } from '../value-objects/SessionId';

/**
 * Error thrown when session creation date is invalid
 */
export class InvalidTimestampError extends Error {
  constructor() {
    super('Session creation timestamp cannot be in the future');
    this.name = 'InvalidTimestampError';
  }
}

/**
 * Session entity
 * Represents a user's persistent identity with session ID and optional nickname
 */
export class Session {
  private _sessionId: SessionId;
  private _nickname: Nickname | null;
  private _createdAt: Date;

  /**
   * Creates a new Session
   * @param sessionId Unique session identifier
   * @param nickname User's display name (can be null initially)
   * @param createdAt When the session was created
   * @throws InvalidTimestampError if createdAt is in the future
   */
  constructor(sessionId: SessionId, nickname: Nickname | null, createdAt: Date) {
    this._sessionId = sessionId;
    this._nickname = nickname;
    this._createdAt = createdAt;
    this.validate();
  }

  /**
   * Gets the session ID
   */
  get sessionId(): SessionId {
    return this._sessionId;
  }

  /**
   * Gets the nickname
   */
  get nickname(): Nickname | null {
    return this._nickname;
  }

  /**
   * Gets the creation timestamp
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Sets or updates the nickname
   * @param nickname The new nickname
   */
  setNickname(nickname: Nickname): void {
    this._nickname = nickname;
  }

  /**
   * Checks if session has a nickname set
   * @returns true if nickname exists
   */
  hasNickname(): boolean {
    return this._nickname !== null;
  }

  /**
   * Validates session invariants
   * @throws InvalidTimestampError if createdAt is in the future
   */
  validate(): void {
    const now = new Date();
    if (this._createdAt > now) {
      throw new InvalidTimestampError();
    }
  }

  /**
   * Creates a copy of the session with a new nickname
   * @param nickname The new nickname
   * @returns New Session instance with updated nickname
   */
  withNickname(nickname: Nickname): Session {
    return new Session(this._sessionId, nickname, this._createdAt);
  }
}
