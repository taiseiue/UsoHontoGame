// Use Case: GetGameForAnswers
// Fetches game data for answer submission screen (hides isLie)

import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import { GameId } from '@/server/domain/value-objects/GameId';

export interface GetGameForAnswersResult {
  success: true;
  data: {
    id: string;
    name: string;
    status: string;
    maxPlayers: number;
    currentPlayers: number;
  };
}

export interface GetGameForAnswersError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type GetGameForAnswersResponse = GetGameForAnswersResult | GetGameForAnswersError;

export class GetGameForAnswers {
  constructor(private readonly gameRepository: IGameRepository) {}

  async execute(gameId: string): Promise<GetGameForAnswersResponse> {
    // Validate game ID
    if (!gameId || gameId.trim() === '') {
      return {
        success: false,
        error: {
          code: 'INVALID_GAME_ID',
          message: 'ゲームIDが無効です',
        },
      };
    }

    // Fetch game
    let gameIdObj: GameId;
    try {
      gameIdObj = new GameId(gameId);
    } catch {
      // Invalid UUID format - treat as not found
      return {
        success: false,
        error: {
          code: 'GAME_NOT_FOUND',
          message: 'ゲームが見つかりません',
        },
      };
    }

    const game = await this.gameRepository.findById(gameIdObj);

    if (!game) {
      return {
        success: false,
        error: {
          code: 'GAME_NOT_FOUND',
          message: 'ゲームが見つかりません',
        },
      };
    }

    // Validate game status (reject closed games)
    if (game.status.toString() === '締切') {
      return {
        success: false,
        error: {
          code: 'GAME_CLOSED',
          message: 'このゲームは締め切られました',
        },
      };
    }

    // Return game data (without isLie)
    return {
      success: true,
      data: {
        id: game.id.toString(),
        name: game.name ?? '',
        status: game.status.toString(),
        maxPlayers: game.maxPlayers,
        currentPlayers: game.currentPlayers,
      },
    };
  }
}
