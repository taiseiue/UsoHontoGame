// PrismaGameRepository
// Feature: 002-game-preparation
// Implementation of IGameRepository using Prisma ORM for SQLite persistence

import { Episode } from '@/server/domain/entities/Episode';
import { Game } from '@/server/domain/entities/Game';
import { Presenter } from '@/server/domain/entities/Presenter';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import { GameId } from '@/server/domain/value-objects/GameId';
import { GameStatus } from '@/server/domain/value-objects/GameStatus';
import type { PrismaClient } from '../../../generated/prisma/client';

/**
 * PrismaGameRepository
 * Persists game data to SQLite database using Prisma ORM
 * Maps between domain entities and Prisma models
 */
export class PrismaGameRepository implements IGameRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Find all games
   */
  async findAll(): Promise<Game[]> {
    const games = await this.prisma.game.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return games.map((game) => this.toDomain(game));
  }

  /**
   * Find games by status
   * @param status Game status to filter by
   */
  async findByStatus(status: GameStatus): Promise<Game[]> {
    const games = await this.prisma.game.findMany({
      where: { status: status.toString() },
      orderBy: { createdAt: 'desc' },
    });

    return games.map((game) => this.toDomain(game));
  }

  /**
   * Find games by creator ID
   * @param creatorId Creator/moderator session ID
   */
  async findByCreatorId(creatorId: string): Promise<Game[]> {
    const games = await this.prisma.game.findMany({
      where: { creatorId },
      orderBy: { createdAt: 'desc' },
    });

    return games.map((game) => this.toDomain(game));
  }

  /**
   * Find game by ID
   * @param id Game ID
   */
  async findById(id: GameId): Promise<Game | null> {
    const game = await this.prisma.game.findUnique({
      where: { id: id.value },
    });

    return game ? this.toDomain(game) : null;
  }

  /**
   * Create a new game
   * @param game Game entity to create
   */
  async create(game: Game): Promise<void> {
    await this.prisma.game.create({
      data: {
        id: game.id.value,
        name: game.name,
        creatorId: game.creatorId,
        status: game.status.toString(),
        maxPlayers: game.maxPlayers,
        currentPlayers: game.currentPlayers,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
      },
    });
  }

  /**
   * Update existing game
   * @param game Game entity with updated data
   */
  async update(game: Game): Promise<void> {
    await this.prisma.game.update({
      where: { id: game.id.value },
      data: {
        name: game.name,
        status: game.status.toString(),
        maxPlayers: game.maxPlayers,
        currentPlayers: game.currentPlayers,
        updatedAt: game.updatedAt,
      },
    });
  }

  /**
   * Delete game
   * @param id Game ID to delete
   */
  async delete(id: GameId): Promise<void> {
    await this.prisma.game.delete({
      where: { id: id.value },
    });
  }

  // Presenter operations

  /**
   * Find all presenters for a game
   * @param gameId Game ID to find presenters for
   */
  async findPresentersByGameId(gameId: string): Promise<Presenter[]> {
    const presenters = await this.prisma.presenter.findMany({
      where: { gameId },
      include: {
        episodes: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return presenters.map((presenter) => this.presenterToDomain(presenter));
  }

  /**
   * Find a single presenter by ID
   * @param presenterId Presenter ID to search for
   */
  async findPresenterById(presenterId: string): Promise<Presenter | null> {
    const presenter = await this.prisma.presenter.findUnique({
      where: { id: presenterId },
      include: {
        episodes: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return presenter ? this.presenterToDomain(presenter) : null;
  }

  /**
   * Add a presenter to a game
   * @param presenter Presenter entity to create
   */
  async addPresenter(presenter: Presenter): Promise<void> {
    const presenterData = {
      id: presenter.id,
      gameId: presenter.gameId,
      nickname: presenter.nickname,
      createdAt: presenter.createdAt,
    };

    const episodesData = presenter.episodes.map((episode) => ({
      id: episode.id,
      presenterId: presenter.id,
      text: episode.text,
      isLie: episode.isLie,
      createdAt: episode.createdAt,
    }));

    await this.prisma.$transaction(async (tx) => {
      await tx.presenter.create({
        data: presenterData,
      });

      if (episodesData.length > 0) {
        await tx.episode.createMany({
          data: episodesData,
        });
      }
    });
  }

  /**
   * Create a presenter with episodes in atomic operation (all-or-nothing)
   * @param presenter Presenter entity to create
   * @param episodes Array of exactly 3 Episode entities
   * @returns Created presenter with episodes for verification
   */
  async createPresenterWithEpisodes(presenter: Presenter, episodes: Episode[]): Promise<Presenter> {
    const presenterData = {
      id: presenter.id,
      gameId: presenter.gameId,
      nickname: presenter.nickname,
      createdAt: presenter.createdAt,
    };

    const episodesData = episodes.map((episode) => ({
      id: episode.id,
      presenterId: presenter.id,
      text: episode.text,
      isLie: episode.isLie,
      createdAt: episode.createdAt,
    }));

    await this.prisma.$transaction(async (tx) => {
      await tx.presenter.create({
        data: presenterData,
      });

      await tx.episode.createMany({
        data: episodesData,
      });
    });

    // Return the created presenter with episodes
    return Presenter.create({
      id: presenter.id,
      gameId: presenter.gameId,
      nickname: presenter.nickname,
      episodes,
      createdAt: presenter.createdAt,
    });
  }

  /**
   * Remove a presenter from a game (cascade deletes episodes)
   * @param presenterId Presenter ID to delete
   */
  async removePresenter(presenterId: string): Promise<void> {
    // Delete presenter - cascade delete will handle episodes automatically
    await this.prisma.presenter.delete({
      where: { id: presenterId },
    });
  }

  // Episode operations

  /**
   * Find all episodes for a presenter
   * @param presenterId Presenter ID to find episodes for
   */
  async findEpisodesByPresenterId(presenterId: string): Promise<Episode[]> {
    const episodes = await this.prisma.episode.findMany({
      where: { presenterId },
      orderBy: { createdAt: 'asc' },
    });

    return episodes.map((episode) => this.episodeToDomain(episode));
  }

  /**
   * Add an episode to a presenter
   * @param episode Episode entity to create
   */
  async addEpisode(episode: Episode): Promise<void> {
    await this.prisma.episode.create({
      data: {
        id: episode.id,
        presenterId: episode.presenterId,
        text: episode.text,
        isLie: episode.isLie,
        createdAt: episode.createdAt,
      },
    });
  }

  /**
   * Remove an episode
   * @param episodeId Episode ID to delete
   */
  async removeEpisode(episodeId: string): Promise<void> {
    await this.prisma.episode.delete({
      where: { id: episodeId },
    });
  }

  /**
   * Update an episode
   * @param episode Episode entity with updated data
   */
  async updateEpisode(episode: Episode): Promise<void> {
    await this.prisma.episode.update({
      where: { id: episode.id },
      data: {
        text: episode.text,
        isLie: episode.isLie,
      },
    });
  }

  /**
   * Maps Prisma presenter with episodes to domain entity
   */
  private presenterToDomain(prismaPresenter: {
    id: string;
    gameId: string;
    nickname: string;
    createdAt: Date;
    episodes: {
      id: string;
      presenterId: string;
      text: string;
      isLie: boolean;
      createdAt: Date;
    }[];
  }): Presenter {
    const episodes = prismaPresenter.episodes.map((episode) =>
      Episode.create({
        id: episode.id,
        presenterId: episode.presenterId,
        text: episode.text,
        isLie: episode.isLie,
        createdAt: episode.createdAt,
      })
    );

    // Use createIncomplete to allow partial episode sets during creation
    return Presenter.createIncomplete({
      id: prismaPresenter.id,
      gameId: prismaPresenter.gameId,
      nickname: prismaPresenter.nickname,
      episodes,
      createdAt: prismaPresenter.createdAt,
    });
  }

  /**
   * Maps Prisma episode to domain entity
   */
  private episodeToDomain(prismaEpisode: {
    id: string;
    presenterId: string;
    text: string;
    isLie: boolean;
    createdAt: Date;
  }): Episode {
    return Episode.create({
      id: prismaEpisode.id,
      presenterId: prismaEpisode.presenterId,
      text: prismaEpisode.text,
      isLie: prismaEpisode.isLie,
      createdAt: prismaEpisode.createdAt,
    });
  }

  /**
   * Find active games with pagination and player count
   * Feature: 005-top-active-games
   * Note: Uses actual participation count from database for accuracy
   */
  async findActiveGamesWithPagination(params: { limit: number; skip: number }): Promise<{
    games: Array<{
      id: string;
      title: string;
      createdAt: Date;
      playerCount: number;
      playerLimit: number | null;
    }>;
    total: number;
  }> {
    // Fetch games with actual participation count
    const games = await this.prisma.game.findMany({
      where: { status: '出題中' },
      orderBy: { createdAt: 'desc' },
      take: params.limit,
      skip: params.skip,
      include: {
        _count: {
          select: { participations: true },
        },
      },
    });

    // Get total count
    const total = await this.prisma.game.count({
      where: { status: '出題中' },
    });

    // Map to expected format
    return {
      games: games.map((game) => ({
        id: game.id,
        title: game.name || 'Untitled Game',
        createdAt: game.createdAt,
        playerCount: game._count.participations, // Use actual participation count
        playerLimit: game.maxPlayers,
      })),
      total,
    };
  }

  /**
   * Maps Prisma game model to domain entity
   */
  private toDomain(prismaGame: {
    id: string;
    name: string | null;
    status: string;
    maxPlayers: number;
    currentPlayers: number;
    createdAt: Date;
    updatedAt: Date;
    creatorId?: string;
  }): Game {
    return new Game(
      new GameId(prismaGame.id),
      prismaGame.name,
      new GameStatus(prismaGame.status as '準備中' | '出題中' | '締切'),
      prismaGame.maxPlayers,
      prismaGame.currentPlayers,
      prismaGame.createdAt,
      prismaGame.updatedAt,
      prismaGame.creatorId || ''
    );
  }
}
