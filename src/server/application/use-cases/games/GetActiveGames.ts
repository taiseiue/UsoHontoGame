/**
 * GetActiveGames Use Case
 * Feature: 005-top-active-games
 * Feature: 007-game-closure - Updated to include both '出題中' and '締切' games
 *
 * Fetches active and closed games (出題中 and 締切 statuses) for display on TOP page
 * Ordered by creation date (newest first) with pagination support
 */

import { formatRelativeTime } from '@/lib/date-utils';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import type { ActiveGameListItem } from '@/types/game';

export interface GetActiveGamesParams {
  cursor?: string;
  limit?: number;
}

export interface GetActiveGamesResult {
  games: ActiveGameListItem[];
  hasMore: boolean;
  nextCursor: string | null;
  total: number;
}

export class GetActiveGames {
  constructor(private gameRepository: IGameRepository) {}

  async execute(params: GetActiveGamesParams = {}): Promise<GetActiveGamesResult> {
    const limit = params.limit || 20;
    const skip = params.cursor ? parseInt(params.cursor, 10) : 0;

    // Fetch active games from repository using the new method
    const result = await this.gameRepository.findActiveGamesWithPagination({
      limit,
      skip,
    });

    // Calculate pagination metadata
    const hasMore = skip + limit < result.total;
    const nextCursor = hasMore ? String(skip + limit) : null;

    // Transform to list items
    const gameListItems = result.games.map((game) => this.toListItem(game));

    return {
      games: gameListItems,
      hasMore,
      nextCursor,
      total: result.total,
    };
  }

  /**
   * Transform game entity to list item DTO
   */
  private toListItem(game: {
    id: string;
    title: string;
    createdAt: Date;
    playerCount: number;
    playerLimit: number | null;
    creatorId: string;
    status: '出題中' | '締切';
  }): ActiveGameListItem {
    return {
      id: game.id,
      title: game.title,
      createdAt: game.createdAt.toISOString(),
      playerCount: game.playerCount,
      playerLimit: game.playerLimit,
      formattedCreatedAt: formatRelativeTime(game.createdAt),
      creatorId: game.creatorId,
      status: game.status,
    };
  }
}
