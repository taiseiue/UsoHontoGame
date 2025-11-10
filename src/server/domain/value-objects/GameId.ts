// GameId value object
// Encapsulates game identifier with UUID validation

/**
 * Error thrown when GameId format is invalid
 */
export class InvalidGameIdError extends Error {
  constructor(value: string) {
    super(`Invalid game ID format: ${value}`);
    this.name = 'InvalidGameIdError';
  }
}

/**
 * GameId value object
 * Enforces UUID v4 format for game identifiers
 */
export class GameId {
  private readonly _value: string;

  /**
   * Creates a new GameId
   * @param value The game ID string (must be valid UUID v4)
   * @throws InvalidGameIdError if format is invalid
   */
  constructor(value: string) {
    if (!this.validateFormat(value)) {
      throw new InvalidGameIdError(value);
    }
    this._value = value;
  }

  /**
   * Gets the game ID value
   */
  get value(): string {
    return this._value;
  }

  /**
   * Validates the game ID format
   * @param value The value to validate
   * @returns true if valid UUID v4 format
   */
  private validateFormat(value: string): boolean {
    // UUID v4 format: 8-4-4-4-12 hexadecimal characters
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  /**
   * Checks equality with another GameId
   * @param other The GameId to compare with
   * @returns true if values are equal
   */
  equals(other: GameId): boolean {
    return this._value === other._value;
  }

  /**
   * Returns string representation
   */
  toString(): string {
    return this._value;
  }
}
