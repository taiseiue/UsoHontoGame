// Test utility for creating mock repositories
import { vi } from 'vitest';
import type { Episode } from '@/server/domain/entities/Episode';
import type { Game } from '@/server/domain/entities/Game';
import type { Presenter } from '@/server/domain/entities/Presenter';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import type { GameId } from '@/server/domain/value-objects/GameId';
import type { GameStatus } from '@/server/domain/value-objects/GameStatus';

/**
 * Creates a mock implementation of IGameRepository for testing
 * This mock provides realistic in-memory behavior for tests
 */
export function createMockGameRepository(): IGameRepository {
  const games = new Map<string, Game>();
  const presenters = new Map<string, Presenter>();
  const episodes = new Map<string, Episode>();

  return {
    findAll: vi.fn().mockImplementation(async () => {
      return Array.from(games.values());
    }),

    findByStatus: vi.fn().mockImplementation(async (status: GameStatus) => {
      return Array.from(games.values()).filter(
        (game) => game.status.toString() === status.toString()
      );
    }),

    findByCreatorId: vi.fn().mockImplementation(async (creatorId: string) => {
      return Array.from(games.values()).filter((game) => game.creatorId === creatorId);
    }),

    findById: vi.fn().mockImplementation(async (gameId: GameId) => {
      return games.get(gameId.toString()) || null;
    }),

    create: vi.fn().mockImplementation(async (game: Game) => {
      games.set(game.id.toString(), game);
      return game;
    }),

    update: vi.fn().mockImplementation(async (game: Game) => {
      games.set(game.id.toString(), game);
      return game;
    }),

    delete: vi.fn().mockImplementation(async (gameId: GameId) => {
      const deleted = games.delete(gameId.toString());
      // Also delete related presenters and episodes
      for (const [presenterId, presenter] of presenters.entries()) {
        if (presenter.gameId === gameId.toString()) {
          presenters.delete(presenterId);
          // Delete episodes for this presenter
          for (const [episodeId, episode] of episodes.entries()) {
            if (episode.presenterId === presenterId) {
              episodes.delete(episodeId);
            }
          }
        }
      }
      return deleted;
    }),

    findPresentersByGameId: vi.fn().mockImplementation(async (gameId: string) => {
      const gamePresenters = Array.from(presenters.values()).filter((p) => p.gameId === gameId);
      // Return presenters directly - no need to modify them since they already have the episodes property
      return gamePresenters;
    }),

    findPresenterById: vi.fn().mockImplementation(async (presenterId: string) => {
      const presenter = presenters.get(presenterId);
      if (!presenter) return null;

      const presenterEpisodes = Array.from(episodes.values()).filter(
        (e) => e.presenterId === presenterId
      );
      return {
        ...presenter,
        episodes: presenterEpisodes,
      };
    }),

    addPresenter: vi.fn().mockImplementation(async (presenter: Presenter) => {
      presenters.set(presenter.id, presenter);
      return presenter;
    }),

    createPresenterWithEpisodes: vi
      .fn()
      .mockImplementation(async (presenter: Presenter, presenterEpisodes: Episode[]) => {
        presenters.set(presenter.id, presenter);
        for (const episode of presenterEpisodes) {
          episodes.set(episode.id, episode);
        }
        return { presenter, episodes: presenterEpisodes };
      }),

    removePresenter: vi.fn().mockImplementation(async (presenterId: string) => {
      const deleted = presenters.delete(presenterId);
      // Also delete related episodes
      for (const [episodeId, episode] of episodes.entries()) {
        if (episode.presenterId === presenterId) {
          episodes.delete(episodeId);
        }
      }
      return deleted;
    }),

    findEpisodesByPresenterId: vi.fn().mockImplementation(async (presenterId: string) => {
      return Array.from(episodes.values()).filter((e) => e.presenterId === presenterId);
    }),

    addEpisode: vi.fn().mockImplementation(async (episode: Episode) => {
      episodes.set(episode.id, episode);
      return episode;
    }),

    removeEpisode: vi.fn().mockImplementation(async (episodeId: string) => {
      return episodes.delete(episodeId);
    }),

    updateEpisode: vi.fn().mockImplementation(async (episode: Episode) => {
      episodes.set(episode.id, episode);
      return episode;
    }),
  };
}
