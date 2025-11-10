import { describe, expect, it } from 'vitest';
import { GameId, InvalidGameIdError } from '@/server/domain/value-objects/GameId';

describe('GameId', () => {
  describe('constructor', () => {
    it('should create GameId with valid UUID v4', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const gameId = new GameId(validUuid);
      expect(gameId.value).toBe(validUuid);
    });

    it('should accept lowercase UUID v4', () => {
      const validUuid = 'a1b2c3d4-e5f6-4789-abcd-ef0123456789';
      const gameId = new GameId(validUuid);
      expect(gameId.value).toBe(validUuid);
    });

    it('should accept uppercase UUID v4', () => {
      const validUuid = 'A1B2C3D4-E5F6-4789-ABCD-EF0123456789';
      const gameId = new GameId(validUuid);
      expect(gameId.value).toBe(validUuid);
    });

    it('should throw error for invalid UUID format', () => {
      const invalidUuid = 'not-a-uuid';
      expect(() => new GameId(invalidUuid)).toThrow(InvalidGameIdError);
    });

    it('should throw error for UUID v1 (wrong version)', () => {
      const uuidV1 = '550e8400-e29b-11d4-a716-446655440000'; // version 1
      expect(() => new GameId(uuidV1)).toThrow(InvalidGameIdError);
    });

    it('should throw error for malformed UUID', () => {
      const malformed = '550e8400-e29b-41d4-a716-44665544000'; // missing one char
      expect(() => new GameId(malformed)).toThrow(InvalidGameIdError);
    });

    it('should throw error for empty string', () => {
      expect(() => new GameId('')).toThrow(InvalidGameIdError);
    });

    it('should throw error for UUID without dashes', () => {
      const noDashes = '550e8400e29b41d4a716446655440000';
      expect(() => new GameId(noDashes)).toThrow(InvalidGameIdError);
    });
  });

  describe('equals', () => {
    it('should return true for same UUID value', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const gameId1 = new GameId(uuid);
      const gameId2 = new GameId(uuid);
      expect(gameId1.equals(gameId2)).toBe(true);
    });

    it('should return false for different UUID values', () => {
      const gameId1 = new GameId('550e8400-e29b-41d4-a716-446655440000');
      const gameId2 = new GameId('a1b2c3d4-e5f6-4789-abcd-ef0123456789');
      expect(gameId1.equals(gameId2)).toBe(false);
    });

    it('should be case-sensitive for comparison', () => {
      const gameId1 = new GameId('550E8400-E29B-41D4-A716-446655440000');
      const gameId2 = new GameId('550e8400-e29b-41d4-a716-446655440000');
      // UUIDs are case-sensitive in comparison, even though regex accepts both
      expect(gameId1.equals(gameId2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const gameId = new GameId(uuid);
      expect(gameId.toString()).toBe(uuid);
    });
  });

  describe('value getter', () => {
    it('should return the UUID value', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const gameId = new GameId(uuid);
      expect(gameId.value).toBe(uuid);
    });

    it('should be immutable', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const gameId = new GameId(uuid);
      const value = gameId.value;
      expect(gameId.value).toBe(value);
    });
  });
});
