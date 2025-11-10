// SessionId value object
// Encapsulates session identifier with validation

import { VALIDATION } from '@/lib/constants';

/**
 * Error thrown when SessionId format is invalid
 */
export class InvalidSessionIdError extends Error {
  constructor(value: string) {
    super(`Invalid session ID format: ${value}`);
    this.name = 'InvalidSessionIdError';
  }
}

/**
 * SessionId value object
 * Enforces 21-character nanoid format (URL-safe characters only)
 */
export class SessionId {
  private readonly _value: string;

  /**
   * Creates a new SessionId
   * @param value The session ID string (must be 21-char nanoid)
   * @throws InvalidSessionIdError if format is invalid
   */
  constructor(value: string) {
    if (!this.validateFormat(value)) {
      throw new InvalidSessionIdError(value);
    }
    this._value = value;
  }

  /**
   * Gets the session ID value
   */
  get value(): string {
    return this._value;
  }

  /**
   * Validates the session ID format
   * @param value The value to validate
   * @returns true if valid nanoid format
   */
  private validateFormat(value: string): boolean {
    // nanoid format: 21 characters, A-Z, a-z, 0-9, underscore, hyphen
    const nanoidRegex = /^[A-Za-z0-9_-]{21}$/;
    return nanoidRegex.test(value) && value.length === VALIDATION.SESSION_ID_LENGTH;
  }

  /**
   * Checks if this SessionId is valid
   * @returns true if valid
   */
  isValid(): boolean {
    return this.validateFormat(this._value);
  }

  /**
   * Checks equality with another SessionId
   * @param other The SessionId to compare with
   * @returns true if values are equal
   */
  equals(other: SessionId): boolean {
    return this._value === other._value;
  }

  /**
   * Returns string representation
   */
  toString(): string {
    return this._value;
  }
}
