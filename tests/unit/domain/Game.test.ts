import { describe, expect, it } from 'vitest';
import {
  Game,
  EmptyGameNameError,
  InvalidPlayerCountError,
} from '@/server/domain/entities/Game';
import { GameId } from '@/server/domain/value-objects/GameId';
import { GameStatus } from '@/server/domain/value-objects/GameStatus';

describe('Game', () => {
  const validGameId = new GameId('550e8400-e29b-41d4-a716-446655440000');
  const acceptingStatus = new GameStatus('出題中');
  const preparingStatus = new GameStatus('準備中');
  const closedStatus = new GameStatus('締切');
  const now = new Date();

  describe('constructor', () => {
    it('should create a valid Game', () => {
      const game = new Game(validGameId, 'Test Game', acceptingStatus, 10, 5, now, now);

      expect(game.id).toBe(validGameId);
      expect(game.name).toBe('Test Game');
      expect(game.status).toBe(acceptingStatus);
      expect(game.maxPlayers).toBe(10);
      expect(game.currentPlayers).toBe(5);
      expect(game.createdAt).toBe(now);
      expect(game.updatedAt).toBe(now);
    });

    it('should throw error for empty game name', () => {
      expect(
        () => new Game(validGameId, '', acceptingStatus, 10, 5, now, now)
      ).toThrow(EmptyGameNameError);
    });

    it('should throw error for whitespace-only game name', () => {
      expect(
        () => new Game(validGameId, '   ', acceptingStatus, 10, 5, now, now)
      ).toThrow(EmptyGameNameError);
    });

    it('should throw error for negative max players', () => {
      expect(
        () => new Game(validGameId, 'Test Game', acceptingStatus, -1, 0, now, now)
      ).toThrow(InvalidPlayerCountError);
    });

    it('should throw error for zero max players', () => {
      expect(
        () => new Game(validGameId, 'Test Game', acceptingStatus, 0, 0, now, now)
      ).toThrow(InvalidPlayerCountError);
    });

    it('should throw error for negative current players', () => {
      expect(
        () => new Game(validGameId, 'Test Game', acceptingStatus, 10, -1, now, now)
      ).toThrow(InvalidPlayerCountError);
    });

    it('should throw error when current players exceeds max players', () => {
      expect(
        () => new Game(validGameId, 'Test Game', acceptingStatus, 10, 11, now, now)
      ).toThrow(InvalidPlayerCountError);
    });

    it('should accept game with current players equal to max players', () => {
      const game = new Game(validGameId, 'Full Game', acceptingStatus, 10, 10, now, now);
      expect(game.currentPlayers).toBe(10);
      expect(game.maxPlayers).toBe(10);
    });

    it('should accept game with zero current players', () => {
      const game = new Game(validGameId, 'New Game', preparingStatus, 10, 0, now, now);
      expect(game.currentPlayers).toBe(0);
    });
  });

  describe('availableSlots', () => {
    it('should calculate available slots correctly', () => {
      const game = new Game(validGameId, 'Test Game', acceptingStatus, 10, 3, now, now);
      expect(game.availableSlots).toBe(7);
    });

    it('should return 0 when game is full', () => {
      const game = new Game(validGameId, 'Full Game', acceptingStatus, 10, 10, now, now);
      expect(game.availableSlots).toBe(0);
    });

    it('should return max players when no players joined', () => {
      const game = new Game(validGameId, 'Empty Game', preparingStatus, 10, 0, now, now);
      expect(game.availableSlots).toBe(10);
    });
  });

  describe('isAcceptingResponses', () => {
    it('should return true for 出題中 status', () => {
      const game = new Game(validGameId, 'Test Game', acceptingStatus, 10, 5, now, now);
      expect(game.isAcceptingResponses).toBe(true);
    });

    it('should return false for 準備中 status', () => {
      const game = new Game(validGameId, 'Test Game', preparingStatus, 10, 5, now, now);
      expect(game.isAcceptingResponses).toBe(false);
    });

    it('should return false for 締切 status', () => {
      const game = new Game(validGameId, 'Test Game', closedStatus, 10, 5, now, now);
      expect(game.isAcceptingResponses).toBe(false);
    });
  });

  describe('setStatus', () => {
    it('should update game status', () => {
      const game = new Game(validGameId, 'Test Game', preparingStatus, 10, 5, now, now);
      const initialUpdatedAt = game.updatedAt;

      // Wait a tiny bit to ensure timestamp changes
      const newStatus = acceptingStatus;
      game.setStatus(newStatus);

      expect(game.status).toBe(newStatus);
      expect(game.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime());
    });

    it('should allow changing from 出題中 to 締切', () => {
      const game = new Game(validGameId, 'Test Game', acceptingStatus, 10, 5, now, now);
      game.setStatus(closedStatus);
      expect(game.status).toBe(closedStatus);
      expect(game.isAcceptingResponses).toBe(false);
    });
  });

  describe('addPlayer', () => {
    it('should increment current players', () => {
      const game = new Game(validGameId, 'Test Game', acceptingStatus, 10, 5, now, now);
      game.addPlayer();
      expect(game.currentPlayers).toBe(6);
    });

    it('should update timestamp when adding player', () => {
      const game = new Game(validGameId, 'Test Game', acceptingStatus, 10, 5, now, now);
      const initialUpdatedAt = game.updatedAt;
      game.addPlayer();
      expect(game.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime());
    });

    it('should throw error when game is full', () => {
      const game = new Game(validGameId, 'Full Game', acceptingStatus, 10, 10, now, now);
      expect(() => game.addPlayer()).toThrow(InvalidPlayerCountError);
      expect(() => game.addPlayer()).toThrow('Game is full');
    });

    it('should allow adding player to bring count to max', () => {
      const game = new Game(validGameId, 'Almost Full', acceptingStatus, 10, 9, now, now);
      game.addPlayer();
      expect(game.currentPlayers).toBe(10);
      expect(game.availableSlots).toBe(0);
    });
  });

  describe('removePlayer', () => {
    it('should decrement current players', () => {
      const game = new Game(validGameId, 'Test Game', acceptingStatus, 10, 5, now, now);
      game.removePlayer();
      expect(game.currentPlayers).toBe(4);
    });

    it('should update timestamp when removing player', () => {
      const game = new Game(validGameId, 'Test Game', acceptingStatus, 10, 5, now, now);
      const initialUpdatedAt = game.updatedAt;
      game.removePlayer();
      expect(game.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime());
    });

    it('should throw error when no players to remove', () => {
      const game = new Game(validGameId, 'Empty Game', preparingStatus, 10, 0, now, now);
      expect(() => game.removePlayer()).toThrow(InvalidPlayerCountError);
      expect(() => game.removePlayer()).toThrow('No players to remove');
    });

    it('should allow removing last player', () => {
      const game = new Game(validGameId, 'One Player', acceptingStatus, 10, 1, now, now);
      game.removePlayer();
      expect(game.currentPlayers).toBe(0);
    });
  });

  describe('validate', () => {
    it('should not throw for valid game state', () => {
      const game = new Game(validGameId, 'Valid Game', acceptingStatus, 10, 5, now, now);
      expect(() => game.validate()).not.toThrow();
    });

    it('should throw for empty name', () => {
      expect(
        () => new Game(validGameId, '', acceptingStatus, 10, 5, now, now)
      ).toThrow(EmptyGameNameError);
    });

    it('should throw for invalid player counts', () => {
      expect(
        () => new Game(validGameId, 'Test', acceptingStatus, -1, 0, now, now)
      ).toThrow(InvalidPlayerCountError);
    });
  });

  describe('getters', () => {
    it('should have immutable id', () => {
      const game = new Game(validGameId, 'Test Game', acceptingStatus, 10, 5, now, now);
      const id = game.id;
      expect(game.id).toBe(id);
    });

    it('should expose all properties correctly', () => {
      const game = new Game(validGameId, 'Test Game', acceptingStatus, 10, 5, now, now);

      expect(game.id).toBe(validGameId);
      expect(game.name).toBe('Test Game');
      expect(game.status).toBe(acceptingStatus);
      expect(game.maxPlayers).toBe(10);
      expect(game.currentPlayers).toBe(5);
      expect(game.createdAt).toBe(now);
      expect(game.updatedAt).toBe(now);
    });
  });
});
