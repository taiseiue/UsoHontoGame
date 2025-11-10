// Nickname value object
// Encapsulates user nickname with validation

import { VALIDATION } from '@/lib/constants';

/**
 * Error thrown when nickname is empty or only whitespace
 */
export class EmptyNicknameError extends Error {
  constructor() {
    super('Nickname cannot be empty or only whitespace');
    this.name = 'EmptyNicknameError';
  }
}

/**
 * Error thrown when nickname exceeds maximum length
 */
export class NicknameTooLongError extends Error {
  constructor(length: number) {
    super(`Nickname too long: ${length} characters (max: ${VALIDATION.NICKNAME_MAX_LENGTH})`);
    this.name = 'NicknameTooLongError';
  }
}

/**
 * Nickname value object
 * Enforces 1-50 character limit and non-empty constraint
 */
export class Nickname {
  private readonly _value: string;

  /**
   * Creates a new Nickname
   * @param value The nickname string (trimmed, 1-50 characters)
   * @throws EmptyNicknameError if empty or only whitespace
   * @throws NicknameTooLongError if exceeds 50 characters
   */
  constructor(value: string) {
    const trimmed = value.trim();

    if (trimmed === '') {
      throw new EmptyNicknameError();
    }

    if (trimmed.length > VALIDATION.NICKNAME_MAX_LENGTH) {
      throw new NicknameTooLongError(trimmed.length);
    }

    this._value = trimmed;
  }

  /**
   * Gets the nickname value
   */
  get value(): string {
    return this._value;
  }

  /**
   * Gets the length of the nickname
   */
  get length(): number {
    return this._value.length;
  }

  /**
   * Checks if nickname is empty (should never be true after construction)
   * @returns false (nicknames are validated to be non-empty)
   */
  isEmpty(): boolean {
    return this._value.trim() === '';
  }

  /**
   * Checks equality with another Nickname
   * @param other The Nickname to compare with
   * @returns true if values are equal
   */
  equals(other: Nickname): boolean {
    return this._value === other._value;
  }

  /**
   * Returns string representation
   */
  toString(): string {
    return this._value;
  }
}
