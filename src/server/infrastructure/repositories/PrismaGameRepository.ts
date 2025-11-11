// PrismaGameRepository
// Feature: 002-game-preparation
// Implementation of IGameRepository using Prisma ORM for SQLite persistence

import { PrismaClient } from "@prisma/client";
import type { IGameRepository } from "@/server/domain/repositories/IGameRepository";
import { Game } from "@/server/domain/entities/Game";
import { GameId } from "@/server/domain/value-objects/GameId";
import { GameStatus } from "@/server/domain/value-objects/GameStatus";
import type { Presenter } from "@/server/domain/entities/Presenter";
import type { Episode } from "@/server/domain/entities/Episode";

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
			orderBy: { createdAt: "desc" },
		});

		return games.map((game: {
			id: string;
			name: string;
			status: string;
			maxPlayers: number;
			currentPlayers: number;
			createdAt: Date;
			updatedAt: Date;
		}) => this.toDomain(game));
	}

	/**
	 * Find games by status
	 * @param status Game status to filter by
	 */
	async findByStatus(status: GameStatus): Promise<Game[]> {
		const games = await this.prisma.game.findMany({
			where: { status: status.toString() },
			orderBy: { createdAt: "desc" },
		});

		return games.map((game: {
			id: string;
			name: string;
			status: string;
			maxPlayers: number;
			currentPlayers: number;
			createdAt: Date;
			updatedAt: Date;
		}) => this.toDomain(game));
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
		// TODO: Implement presenter operations with Prisma
		// For now, return empty array (will be implemented in future)
		return [];
	}

	/**
	 * Find a single presenter by ID
	 * @param presenterId Presenter ID to search for
	 */
	async findPresenterById(presenterId: string): Promise<Presenter | null> {
		// TODO: Implement presenter operations with Prisma
		return null;
	}

	/**
	 * Add a presenter to a game
	 * @param presenter Presenter entity to create
	 */
	async addPresenter(presenter: Presenter): Promise<void> {
		// TODO: Implement presenter operations with Prisma
	}

	/**
	 * Remove a presenter from a game (cascade deletes episodes)
	 * @param presenterId Presenter ID to delete
	 */
	async removePresenter(presenterId: string): Promise<void> {
		// TODO: Implement presenter operations with Prisma
	}

	// Episode operations

	/**
	 * Find all episodes for a presenter
	 * @param presenterId Presenter ID to find episodes for
	 */
	async findEpisodesByPresenterId(presenterId: string): Promise<Episode[]> {
		// TODO: Implement episode operations with Prisma
		return [];
	}

	/**
	 * Add an episode to a presenter
	 * @param episode Episode entity to create
	 */
	async addEpisode(episode: Episode): Promise<void> {
		// TODO: Implement episode operations with Prisma
	}

	/**
	 * Remove an episode
	 * @param episodeId Episode ID to delete
	 */
	async removeEpisode(episodeId: string): Promise<void> {
		// TODO: Implement episode operations with Prisma
	}

	/**
	 * Update an episode
	 * @param episode Episode entity with updated data
	 */
	async updateEpisode(episode: Episode): Promise<void> {
		// TODO: Implement episode operations with Prisma
	}

	/**
	 * Maps Prisma model to domain entity
	 */
	private toDomain(prismaGame: {
		id: string;
		name: string;
		status: string;
		maxPlayers: number;
		currentPlayers: number;
		createdAt: Date;
		updatedAt: Date;
	}): Game {
		return new Game(
			new GameId(prismaGame.id),
			prismaGame.name,
			new GameStatus(prismaGame.status as "準備中" | "出題中" | "締切"),
			prismaGame.maxPlayers,
			prismaGame.currentPlayers,
			prismaGame.createdAt,
			prismaGame.updatedAt,
		);
	}
}
