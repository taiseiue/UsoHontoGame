// UpdateGameSettings Use Case
// Feature: 002-game-preparation
// Update game settings (player limit) when in preparation status

import type {
  GameDetailDto,
  UpdateGameSettingsInput,
  UpdateGameSettingsOutput,
} from '@/server/application/dto/GameDetailDto';
import { NotFoundError } from '@/server/domain/errors/NotFoundError';
import { ValidationError } from '@/server/domain/errors/ValidationError';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import { GameId } from '@/server/domain/value-objects/GameId';

/**
 * UpdateGameSettings Use Case
 * Updates game settings (player limit) when game is in preparation status
 *
 * Business Rules:
 * - Game must exist
 * - Only creator can update game settings (authorization)
 * - Can only edit when status is 準備中
 * - Player limit must be between 1-100
 * - New player limit must be >= current players
 */
export class UpdateGameSettings {
  constructor(private readonly gameRepository: IGameRepository) {}

  async execute(input: UpdateGameSettingsInput): Promise<UpdateGameSettingsOutput> {
    const { gameId, name, playerLimit, requesterId } = input;

    // Find game
    const game = await this.gameRepository.findById(new GameId(gameId));

    if (!game) {
      throw new NotFoundError(`Game ${gameId} not found`);
    }

    // Authorization: Only creator can update
    if (game.creatorId !== requesterId) {
      throw new Error('Unauthorized: You can only edit games you created');
    }

    // Can only edit when in preparation status
    if (game.status.toString() !== '準備中') {
      throw new ValidationError('ゲームの設定を変更できるのは準備中のみです');
    }

    // Update game name if provided
    if (name !== undefined) {
      // Validate name length (max 100 chars)
      if (name !== null && name.length > 100) {
        throw new ValidationError('ゲーム名は100文字以内で指定してください');
      }

      // Update via entity method
      game.updateName(name);
    }

    // Update player limit if provided
    if (playerLimit !== undefined) {
      // Validate player limit range
      if (playerLimit < 1 || playerLimit > 100) {
        throw new ValidationError('参加人数は1〜100人の範囲で指定してください');
      }

      // New limit must be >= current players
      if (playerLimit < game.currentPlayers) {
        throw new ValidationError(
          `参加人数は現在の参加者数(${game.currentPlayers}人)以上である必要があります`
        );
      }

      // Update via entity method (uses updatePlayerLimit)
      game.updatePlayerLimit(playerLimit);
    }

    // Save changes
    await this.gameRepository.update(game);

    // Map to DTO
    const gameDetailDto: GameDetailDto = {
      id: game.id.toString(),
      name: game.name,
      status: game.status.toString(),
      maxPlayers: game.maxPlayers,
      currentPlayers: game.currentPlayers,
      availableSlots: game.availableSlots,
      creatorId: game.creatorId,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    };

    return {
      success: true,
      game: gameDetailDto,
    };
  }
}
