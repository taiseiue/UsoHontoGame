// GetAvailableGames use case
// Business logic for retrieving games accepting responses

import type { Game } from '@/server/domain/entities/Game';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import { GameStatus } from '@/server/domain/value-objects/GameStatus';
import type { GameDto } from '../../dto/GameDto';

/**
 * GetAvailableGames use case
 * Retrieves all games with "出題中" status
 */
export class GetAvailableGames {
  constructor(private readonly gameRepository: IGameRepository) {}

  /**
   * Executes the use case to get available games
   * @returns Array of GameDto for games accepting responses
   */
  async execute(): Promise<GameDto[]> {
    // Get games with "出題中" status
    const acceptingStatus = new GameStatus('出題中');
    const games = await this.gameRepository.findByStatus(acceptingStatus);

    // Convert to DTOs
    return games.map((game) => this.toDto(game));
  }

  /**
   * Converts Game entity to GameDto
   * @param game The game entity
   * @returns GameDto for presentation layer
   */
  private toDto(game: Game): GameDto {
    return {
      id: game.id.value,
      name: game.name,
      availableSlots: game.availableSlots,
    };
  }
}
