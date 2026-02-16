// Unit Tests: UpdateGameSettings Use Case
// Feature: 002-game-preparation

import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateGameSettings } from '@/server/application/use-cases/games/UpdateGameSettings';
import { Game } from '@/server/domain/entities/Game';
import { NotFoundError } from '@/server/domain/errors/NotFoundError';
import { ValidationError } from '@/server/domain/errors/ValidationError';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import { GameId } from '@/server/domain/value-objects/GameId';
import { GameStatus } from '@/server/domain/value-objects/GameStatus';
import { createMockGameRepository } from '../../../../../tests/utils/mockRepositories';

describe('UpdateGameSettings', () => {
  let repository: IGameRepository;
  let useCase: UpdateGameSettings;
  const creatorId = 'creator-session-123';
  const otherUserId = 'other-session-456';

  beforeEach(() => {
    repository = createMockGameRepository();
    useCase = new UpdateGameSettings(repository);
  });

  it('should update player limit for game in preparation status', async () => {
    // Given: Game in preparation status
    const gameId = '550e8400-e29b-41d4-a716-446655440001';
    const game = new Game(
      new GameId(gameId),
      'Test Game',
      new GameStatus('準備中'),
      10,
      0,
      new Date(),
      new Date(),
      creatorId
    );
    await repository.create(game);

    // When: Update player limit
    const result = await useCase.execute({
      gameId,
      playerLimit: 20,
      requesterId: creatorId,
    });

    // Then: Should update successfully
    expect(result.success).toBe(true);
    expect(result.game?.maxPlayers).toBe(20);

    const updatedGame = await repository.findById(new GameId(gameId));
    expect(updatedGame?.maxPlayers).toBe(20);
  });

  it('should throw NotFoundError if game does not exist', async () => {
    // Given: Non-existent game
    const gameId = '550e8400-e29b-41d4-a716-446655440999';

    // When/Then: Should throw NotFoundError
    await expect(
      useCase.execute({
        gameId,
        playerLimit: 15,
        requesterId: creatorId,
      })
    ).rejects.toThrow(NotFoundError);
  });

  it('should throw error if requester is not the creator', async () => {
    // Given: Game created by different user
    const gameId = '550e8400-e29b-41d4-a716-446655440001';
    const game = new Game(
      new GameId(gameId),
      'Test Game',
      new GameStatus('準備中'),
      10,
      0,
      new Date(),
      new Date(),
      creatorId
    );
    await repository.create(game);

    // When/Then: Should throw authorization error
    await expect(
      useCase.execute({
        gameId,
        playerLimit: 15,
        requesterId: otherUserId,
      })
    ).rejects.toThrow('Unauthorized');
  });

  it('should throw ValidationError if game is not in preparation status', async () => {
    // Given: Game in 出題中 status
    const gameId = '550e8400-e29b-41d4-a716-446655440001';
    const game = new Game(
      new GameId(gameId),
      'Test Game',
      new GameStatus('出題中'),
      10,
      5,
      new Date(),
      new Date(),
      creatorId
    );
    await repository.create(game);

    // When/Then: Should throw ValidationError
    await expect(
      useCase.execute({
        gameId,
        playerLimit: 20,
        requesterId: creatorId,
      })
    ).rejects.toThrow(ValidationError);
    await expect(
      useCase.execute({
        gameId,
        playerLimit: 20,
        requesterId: creatorId,
      })
    ).rejects.toThrow('準備中のみ');
  });

  it('should throw ValidationError if player limit is less than 1', async () => {
    // Given: Game in preparation
    const gameId = '550e8400-e29b-41d4-a716-446655440001';
    const game = new Game(
      new GameId(gameId),
      'Test Game',
      new GameStatus('準備中'),
      10,
      0,
      new Date(),
      new Date(),
      creatorId
    );
    await repository.create(game);

    // When/Then: Should throw ValidationError
    await expect(
      useCase.execute({
        gameId,
        playerLimit: 0,
        requesterId: creatorId,
      })
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError if player limit is greater than 100', async () => {
    // Given: Game in preparation
    const gameId = '550e8400-e29b-41d4-a716-446655440001';
    const game = new Game(
      new GameId(gameId),
      'Test Game',
      new GameStatus('準備中'),
      10,
      0,
      new Date(),
      new Date(),
      creatorId
    );
    await repository.create(game);

    // When/Then: Should throw ValidationError
    await expect(
      useCase.execute({
        gameId,
        playerLimit: 101,
        requesterId: creatorId,
      })
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError if new limit is less than current players', async () => {
    // Given: Game with 5 current players
    const gameId = '550e8400-e29b-41d4-a716-446655440001';
    const game = new Game(
      new GameId(gameId),
      'Test Game',
      new GameStatus('準備中'),
      10,
      5,
      new Date(),
      new Date(),
      creatorId
    );
    await repository.create(game);

    // When/Then: Should throw ValidationError
    await expect(
      useCase.execute({
        gameId,
        playerLimit: 3,
        requesterId: creatorId,
      })
    ).rejects.toThrow(ValidationError);
    await expect(
      useCase.execute({
        gameId,
        playerLimit: 3,
        requesterId: creatorId,
      })
    ).rejects.toThrow('参加者数');
  });

  it('should allow setting limit equal to current players', async () => {
    // Given: Game with 5 current players
    const gameId = '550e8400-e29b-41d4-a716-446655440001';
    const game = new Game(
      new GameId(gameId),
      'Test Game',
      new GameStatus('準備中'),
      10,
      5,
      new Date(),
      new Date(),
      creatorId
    );
    await repository.create(game);

    // When: Set limit equal to current players
    const result = await useCase.execute({
      gameId,
      playerLimit: 5,
      requesterId: creatorId,
    });

    // Then: Should succeed
    expect(result.success).toBe(true);
    expect(result.game?.maxPlayers).toBe(5);
  });

  it('should return complete game detail DTO', async () => {
    // Given: Game in preparation
    const gameId = '550e8400-e29b-41d4-a716-446655440001';
    const game = new Game(
      new GameId(gameId),
      'Test Game',
      new GameStatus('準備中'),
      10,
      3,
      new Date(),
      new Date(),
      creatorId
    );
    await repository.create(game);

    // When: Update settings
    const result = await useCase.execute({
      gameId,
      playerLimit: 15,
      requesterId: creatorId,
    });

    // Then: Should return complete DTO
    expect(result.success).toBe(true);
    expect(result.game).toBeDefined();
    expect(result.game?.id).toBe(gameId);
    expect(result.game?.name).toBe('Test Game');
    expect(result.game?.status).toBe('準備中');
    expect(result.game?.maxPlayers).toBe(15);
    expect(result.game?.currentPlayers).toBe(3);
    expect(result.game?.availableSlots).toBe(12);
    expect(result.game?.creatorId).toBe(creatorId);
    expect(result.game?.createdAt).toBeInstanceOf(Date);
    expect(result.game?.updatedAt).toBeInstanceOf(Date);
  });

  it('should update updatedAt timestamp', async () => {
    // Given: Game in preparation
    const gameId = '550e8400-e29b-41d4-a716-446655440001';
    const originalDate = new Date(Date.now() - 10000); // 10 seconds ago
    const game = new Game(
      new GameId(gameId),
      'Test Game',
      new GameStatus('準備中'),
      10,
      0,
      originalDate,
      originalDate,
      creatorId
    );
    await repository.create(game);

    // When: Update settings
    await new Promise((resolve) => setTimeout(resolve, 10));
    const result = await useCase.execute({
      gameId,
      playerLimit: 15,
      requesterId: creatorId,
    });

    // Then: updatedAt should be more recent
    expect(result.game?.updatedAt.getTime()).toBeGreaterThan(originalDate.getTime());
  });

  // Game Name Update Tests
  describe('Game Name Updates', () => {
    it('should update game name for game in preparation status', async () => {
      // Given: Game in preparation status with original name
      const gameId = '550e8400-e29b-41d4-a716-446655440001';
      const game = new Game(
        new GameId(gameId),
        'Original Game Name',
        new GameStatus('準備中'),
        10,
        0,
        new Date(),
        new Date(),
        creatorId
      );
      await repository.create(game);

      // When: Update game name
      const result = await useCase.execute({
        gameId,
        name: 'Updated Game Name',
        requesterId: creatorId,
      });

      // Then: Should update successfully
      expect(result.success).toBe(true);
      expect(result.game?.name).toBe('Updated Game Name');

      const updatedGame = await repository.findById(new GameId(gameId));
      expect(updatedGame?.name).toBe('Updated Game Name');
    });

    it('should update both name and player limit simultaneously', async () => {
      // Given: Game in preparation status
      const gameId = '550e8400-e29b-41d4-a716-446655440001';
      const game = new Game(
        new GameId(gameId),
        'Original Name',
        new GameStatus('準備中'),
        10,
        0,
        new Date(),
        new Date(),
        creatorId
      );
      await repository.create(game);

      // When: Update both name and player limit
      const result = await useCase.execute({
        gameId,
        name: 'New Name',
        playerLimit: 20,
        requesterId: creatorId,
      });

      // Then: Should update both successfully
      expect(result.success).toBe(true);
      expect(result.game?.name).toBe('New Name');
      expect(result.game?.maxPlayers).toBe(20);

      const updatedGame = await repository.findById(new GameId(gameId));
      expect(updatedGame?.name).toBe('New Name');
      expect(updatedGame?.maxPlayers).toBe(20);
    });

    it('should allow setting name to null (optional field)', async () => {
      // Given: Game with a name
      const gameId = '550e8400-e29b-41d4-a716-446655440001';
      const game = new Game(
        new GameId(gameId),
        'Has a Name',
        new GameStatus('準備中'),
        10,
        0,
        new Date(),
        new Date(),
        creatorId
      );
      await repository.create(game);

      // When: Update name to null
      const result = await useCase.execute({
        gameId,
        name: null,
        requesterId: creatorId,
      });

      // Then: Should update successfully
      expect(result.success).toBe(true);
      expect(result.game?.name).toBeNull();

      const updatedGame = await repository.findById(new GameId(gameId));
      expect(updatedGame?.name).toBeNull();
    });

    it('should throw ValidationError if name exceeds 100 characters', async () => {
      // Given: Game in preparation
      const gameId = '550e8400-e29b-41d4-a716-446655440001';
      const game = new Game(
        new GameId(gameId),
        'Original Name',
        new GameStatus('準備中'),
        10,
        0,
        new Date(),
        new Date(),
        creatorId
      );
      await repository.create(game);

      // When/Then: Should throw ValidationError for name > 100 chars
      const longName = 'a'.repeat(101);
      await expect(
        useCase.execute({
          gameId,
          name: longName,
          requesterId: creatorId,
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should update only name when playerLimit is not provided', async () => {
      // Given: Game with original settings
      const gameId = '550e8400-e29b-41d4-a716-446655440001';
      const game = new Game(
        new GameId(gameId),
        'Original Name',
        new GameStatus('準備中'),
        10,
        0,
        new Date(),
        new Date(),
        creatorId
      );
      await repository.create(game);

      // When: Update only name
      const result = await useCase.execute({
        gameId,
        name: 'Only Name Changed',
        requesterId: creatorId,
      });

      // Then: Should update name but keep playerLimit unchanged
      expect(result.success).toBe(true);
      expect(result.game?.name).toBe('Only Name Changed');
      expect(result.game?.maxPlayers).toBe(10);

      const updatedGame = await repository.findById(new GameId(gameId));
      expect(updatedGame?.name).toBe('Only Name Changed');
      expect(updatedGame?.maxPlayers).toBe(10);
    });
  });
});
