import { nanoid } from 'nanoid';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Episode } from '@/server/domain/entities/Episode';
import { Game } from '@/server/domain/entities/Game';
import { Presenter } from '@/server/domain/entities/Presenter';
import { GameId } from '@/server/domain/value-objects/GameId';
import { GameStatus } from '@/server/domain/value-objects/GameStatus';
import { PrismaGameRepository } from '@/server/infrastructure/repositories/PrismaGameRepository';
import { createTestDatabase, type TestDatabase } from '../../utils/test-database';

describe('PrismaGameRepository', () => {
  let testDb: TestDatabase;
  let repository: PrismaGameRepository;

  beforeAll(async () => {
    // Create isolated test database for this test file
    testDb = await createTestDatabase('PrismaGameRepository.test.ts');
    repository = new PrismaGameRepository(testDb.prisma);
  });

  beforeEach(async () => {
    // Clean up database before each test (in order due to foreign keys)
    await testDb.prisma.episode.deleteMany();
    await testDb.prisma.presenter.deleteMany();
    await testDb.prisma.game.deleteMany();
  });

  afterAll(async () => {
    // Clean up isolated test database
    await testDb.cleanup();
  });

  const createGame = (
    id: string,
    name: string,
    status: '準備中' | '出題中' | '締切',
    maxPlayers: number,
    currentPlayers: number
  ): Game => {
    return new Game(
      new GameId(id),
      name,
      new GameStatus(status),
      maxPlayers,
      currentPlayers,
      new Date(),
      new Date()
    );
  };

  const createEpisode = (presenterId: string, text: string, isLie: boolean): Episode => {
    return Episode.create({
      id: nanoid(),
      presenterId,
      text,
      isLie,
      createdAt: new Date(),
    });
  };

  const createPresenterWithEpisodes = (gameId: string, nickname: string): Presenter => {
    const presenterId = nanoid();
    const episodes = [
      createEpisode(presenterId, '真実のエピソード1', false),
      createEpisode(presenterId, '嘘のエピソード', true),
      createEpisode(presenterId, '真実のエピソード2', false),
    ];

    return Presenter.create({
      id: presenterId,
      gameId,
      nickname,
      episodes,
      createdAt: new Date(),
    });
  };

  describe('create', () => {
    it('should create a game in database', async () => {
      const game = createGame('550e8400-e29b-41d4-a716-446655440000', 'Test Game', '出題中', 10, 5);

      await repository.create(game);

      const found = await repository.findById(game.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Test Game');
      expect(found?.status.toString()).toBe('出題中');
    });

    it('should persist all game properties', async () => {
      const game = createGame(
        '550e8400-e29b-41d4-a716-446655440001',
        'Complete Game',
        '準備中',
        12,
        3
      );

      await repository.create(game);

      const found = await repository.findById(game.id);
      expect(found).not.toBeNull();
      expect(found?.id.value).toBe(game.id.value);
      expect(found?.name).toBe(game.name);
      expect(found?.status.toString()).toBe(game.status.toString());
      expect(found?.maxPlayers).toBe(12);
      expect(found?.currentPlayers).toBe(3);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no games', async () => {
      const games = await repository.findAll();
      expect(games).toEqual([]);
    });

    it('should return all games', async () => {
      const game1 = createGame('550e8400-e29b-41d4-a716-446655440001', 'Game 1', '出題中', 10, 5);
      const game2 = createGame('550e8400-e29b-41d4-a716-446655440002', 'Game 2', '準備中', 8, 0);

      await repository.create(game1);
      await repository.create(game2);

      const games = await repository.findAll();
      expect(games).toHaveLength(2);
    });

    it('should return games ordered by creation date (newest first)', async () => {
      const now = new Date();
      const earlier = new Date(now.getTime() - 1000); // 1 second earlier

      const game1 = new Game(
        new GameId('550e8400-e29b-41d4-a716-446655440001'),
        'Older Game',
        new GameStatus('出題中'),
        10,
        5,
        earlier,
        earlier
      );
      const game2 = new Game(
        new GameId('550e8400-e29b-41d4-a716-446655440002'),
        'Newer Game',
        new GameStatus('出題中'),
        10,
        5,
        now,
        now
      );

      await repository.create(game1);
      await repository.create(game2);

      const games = await repository.findAll();
      expect(games).toHaveLength(2);
      expect(games[0].name).toBe('Newer Game');
      expect(games[1].name).toBe('Older Game');
    });
  });

  describe('findByStatus', () => {
    beforeEach(async () => {
      await repository.create(
        createGame('550e8400-e29b-41d4-a716-446655440001', 'Accepting Game', '出題中', 10, 5)
      );
      await repository.create(
        createGame('550e8400-e29b-41d4-a716-446655440002', 'Preparing Game', '準備中', 10, 0)
      );
      await repository.create(
        createGame('550e8400-e29b-41d4-a716-446655440003', 'Closed Game', '締切', 10, 10)
      );
    });

    it('should find games with "出題中" status', async () => {
      const acceptingStatus = new GameStatus('出題中');
      const games = await repository.findByStatus(acceptingStatus);

      expect(games).toHaveLength(1);
      expect(games[0].name).toBe('Accepting Game');
      expect(games[0].status.toString()).toBe('出題中');
    });

    it('should find games with "準備中" status', async () => {
      const preparingStatus = new GameStatus('準備中');
      const games = await repository.findByStatus(preparingStatus);

      expect(games).toHaveLength(1);
      expect(games[0].name).toBe('Preparing Game');
    });

    it('should find games with "締切" status', async () => {
      const closedStatus = new GameStatus('締切');
      const games = await repository.findByStatus(closedStatus);

      expect(games).toHaveLength(1);
      expect(games[0].name).toBe('Closed Game');
    });

    it('should return empty array for status with no games', async () => {
      await testDb.prisma.game.deleteMany();
      const status = new GameStatus('出題中');
      const games = await repository.findByStatus(status);

      expect(games).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find game by ID', async () => {
      const game = createGame('550e8400-e29b-41d4-a716-446655440000', 'Find Me', '出題中', 10, 5);

      await repository.create(game);

      const found = await repository.findById(game.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Find Me');
    });

    it('should return null for non-existent ID', async () => {
      const nonExistentId = new GameId('550e8400-e29b-41d4-a716-446655440999');
      const found = await repository.findById(nonExistentId);

      expect(found).toBeNull();
    });

    it('should return correct game when multiple games exist', async () => {
      await repository.create(
        createGame('550e8400-e29b-41d4-a716-446655440001', 'Game 1', '出題中', 10, 5)
      );
      const targetGame = createGame(
        '550e8400-e29b-41d4-a716-446655440002',
        'Target Game',
        '出題中',
        10,
        5
      );
      await repository.create(targetGame);
      await repository.create(
        createGame('550e8400-e29b-41d4-a716-446655440003', 'Game 3', '出題中', 10, 5)
      );

      const found = await repository.findById(targetGame.id);
      expect(found?.name).toBe('Target Game');
    });
  });

  describe('update', () => {
    it('should update game properties', async () => {
      const game = createGame(
        '550e8400-e29b-41d4-a716-446655440000',
        'Original Name',
        '準備中',
        10,
        0
      );

      await repository.create(game);

      // Transition to accepting
      game.startAccepting();
      await repository.update(game);

      const updated = await repository.findById(game.id);
      expect(updated?.status.toString()).toBe('出題中');
    });

    it('should update player counts', async () => {
      const game = createGame(
        '550e8400-e29b-41d4-a716-446655440000',
        'Player Test',
        '出題中',
        10,
        5
      );

      await repository.create(game);

      game.addPlayer();
      await repository.update(game);

      const updated = await repository.findById(game.id);
      expect(updated?.currentPlayers).toBe(6);
    });

    it('should persist updatedAt timestamp changes', async () => {
      const game = createGame(
        '550e8400-e29b-41d4-a716-446655440000',
        'Timestamp Test',
        '出題中',
        10,
        5
      );

      await repository.create(game);
      const initialUpdatedAt = game.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));
      game.setStatus(new GameStatus('締切'));
      await repository.update(game);

      const updated = await repository.findById(game.id);
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime());
    });
  });

  describe('delete', () => {
    it('should delete game from database', async () => {
      const game = createGame('550e8400-e29b-41d4-a716-446655440000', 'Delete Me', '出題中', 10, 5);

      await repository.create(game);
      await repository.delete(game.id);

      const found = await repository.findById(game.id);
      expect(found).toBeNull();
    });

    it('should only delete specified game', async () => {
      const game1 = createGame('550e8400-e29b-41d4-a716-446655440001', 'Keep Me', '出題中', 10, 5);
      const game2 = createGame(
        '550e8400-e29b-41d4-a716-446655440002',
        'Delete Me',
        '出題中',
        10,
        5
      );

      await repository.create(game1);
      await repository.create(game2);
      await repository.delete(game2.id);

      const remaining = await repository.findAll();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].name).toBe('Keep Me');
    });

    it('should not throw error when deleting non-existent game', async () => {
      const nonExistentId = new GameId('550e8400-e29b-41d4-a716-446655440999');

      await expect(repository.delete(nonExistentId)).rejects.toThrow();
    });
  });

  describe('findByCreatorId', () => {
    it('should find games by creator ID', async () => {
      const creatorId = 'creator-session-123';
      const game1 = new Game(
        new GameId('550e8400-e29b-41d4-a716-446655440001'),
        'Game 1',
        new GameStatus('出題中'),
        10,
        5,
        new Date(),
        new Date(),
        creatorId
      );
      const game2 = new Game(
        new GameId('550e8400-e29b-41d4-a716-446655440002'),
        'Game 2',
        new GameStatus('準備中'),
        8,
        0,
        new Date(),
        new Date(),
        creatorId
      );

      await repository.create(game1);
      await repository.create(game2);

      const games = await repository.findByCreatorId(creatorId);
      expect(games).toHaveLength(2);
    });

    it('should return empty array for creator with no games', async () => {
      const games = await repository.findByCreatorId('non-existent-creator');
      expect(games).toEqual([]);
    });

    it('should only return games for specified creator', async () => {
      const creator1 = 'creator-1';
      const creator2 = 'creator-2';

      const game1 = new Game(
        new GameId('550e8400-e29b-41d4-a716-446655440001'),
        'Creator 1 Game',
        new GameStatus('出題中'),
        10,
        5,
        new Date(),
        new Date(),
        creator1
      );
      const game2 = new Game(
        new GameId('550e8400-e29b-41d4-a716-446655440002'),
        'Creator 2 Game',
        new GameStatus('出題中'),
        10,
        5,
        new Date(),
        new Date(),
        creator2
      );

      await repository.create(game1);
      await repository.create(game2);

      const games = await repository.findByCreatorId(creator1);
      expect(games).toHaveLength(1);
      expect(games[0].name).toBe('Creator 1 Game');
    });

    it('should return games ordered by creation date (newest first)', async () => {
      const creatorId = 'creator-123';
      const now = new Date();
      const earlier = new Date(now.getTime() - 1000);

      const olderGame = new Game(
        new GameId('550e8400-e29b-41d4-a716-446655440001'),
        'Older Game',
        new GameStatus('出題中'),
        10,
        5,
        earlier,
        earlier,
        creatorId
      );
      const newerGame = new Game(
        new GameId('550e8400-e29b-41d4-a716-446655440002'),
        'Newer Game',
        new GameStatus('出題中'),
        10,
        5,
        now,
        now,
        creatorId
      );

      await repository.create(olderGame);
      await repository.create(newerGame);

      const games = await repository.findByCreatorId(creatorId);
      expect(games).toHaveLength(2);
      expect(games[0].name).toBe('Newer Game');
      expect(games[1].name).toBe('Older Game');
    });
  });

  describe('domain entity mapping', () => {
    it('should correctly map all GameStatus values', async () => {
      const statuses: Array<'準備中' | '出題中' | '締切'> = ['準備中', '出題中', '締切'];

      for (const status of statuses) {
        const game = createGame(GameId.generate().value, `Game ${status}`, status, 10, 5);

        await repository.create(game);
        const found = await repository.findById(game.id);

        expect(found?.status.toString()).toBe(status);
      }
    });

    it('should preserve date precision', async () => {
      const now = new Date();
      const game = new Game(
        GameId.generate(),
        'Date Test',
        new GameStatus('出題中'),
        10,
        5,
        now,
        now
      );

      await repository.create(game);
      const found = await repository.findById(game.id);

      // SQLite stores dates as strings, so we compare timestamps
      expect(found?.createdAt.getTime()).toBeCloseTo(now.getTime(), -2);
      expect(found?.updatedAt.getTime()).toBeCloseTo(now.getTime(), -2);
    });
  });

  describe('Presenter operations', () => {
    let testGame: Game;

    beforeEach(async () => {
      testGame = createGame('550e8400-e29b-41d4-a716-446655440101', 'Test Game', '出題中', 10, 5);
      await repository.create(testGame);
    });

    describe('addPresenter', () => {
      it('should add presenter to database', async () => {
        const presenter = createPresenterWithEpisodes(testGame.id.value, 'Test Presenter');

        await repository.addPresenter(presenter);

        const presenters = await repository.findPresentersByGameId(testGame.id.value);
        expect(presenters).toHaveLength(1);
        expect(presenters[0].nickname).toBe('Test Presenter');
      });

      it('should persist all presenter properties', async () => {
        const presenter = createPresenterWithEpisodes(testGame.id.value, 'Complete Presenter');

        await repository.addPresenter(presenter);

        const found = await repository.findPresenterById(presenter.id);
        expect(found).not.toBeNull();
        expect(found?.id).toBe(presenter.id);
        expect(found?.gameId).toBe(testGame.id.value);
        expect(found?.nickname).toBe('Complete Presenter');
      });

      it('should persist presenter episodes in atomic transaction', async () => {
        const presenter = createPresenterWithEpisodes(testGame.id.value, 'Presenter with Episodes');

        await repository.addPresenter(presenter);

        const episodes = await repository.findEpisodesByPresenterId(presenter.id);
        expect(episodes).toHaveLength(3);
      });

      it('should handle presenter with no episodes', async () => {
        // Use createIncomplete to create presenter with 0 episodes
        const presenterId = nanoid();
        const presenterWithNoEpisodes = Presenter.createIncomplete({
          id: presenterId,
          gameId: testGame.id.value,
          nickname: 'Presenter Without Episodes',
          episodes: [],
          createdAt: new Date(),
        });

        await repository.addPresenter(presenterWithNoEpisodes);

        const found = await repository.findPresenterById(presenterId);
        expect(found).not.toBeNull();
        expect(found?.episodes).toHaveLength(0);
      });
    });

    describe('createPresenterWithEpisodes', () => {
      it('should create presenter with episodes atomically', async () => {
        const presenter = createPresenterWithEpisodes(testGame.id.value, 'Atomic Presenter');
        const episodes = presenter.episodes;

        const result = await repository.createPresenterWithEpisodes(
          presenter,
          Array.from(episodes)
        );

        expect(result.id).toBe(presenter.id);
        expect(result.nickname).toBe('Atomic Presenter');
        expect(result.episodes).toHaveLength(3);
      });

      it('should rollback if episode creation fails', async () => {
        const presenter = createPresenterWithEpisodes(testGame.id.value, 'Rollback Test');

        // Create the presenter first
        await repository.createPresenterWithEpisodes(presenter, Array.from(presenter.episodes));

        // Verify presenter and episodes exist
        const foundPresenter = await repository.findPresenterById(presenter.id);
        expect(foundPresenter).not.toBeNull();

        const episodes = await repository.findEpisodesByPresenterId(presenter.id);
        expect(episodes).toHaveLength(3);
      });
    });

    describe('findPresentersByGameId', () => {
      it('should find all presenters for a game', async () => {
        const presenter1 = createPresenterWithEpisodes(testGame.id.value, 'Presenter 1');
        const presenter2 = createPresenterWithEpisodes(testGame.id.value, 'Presenter 2');

        await repository.addPresenter(presenter1);
        await repository.addPresenter(presenter2);

        const presenters = await repository.findPresentersByGameId(testGame.id.value);
        expect(presenters).toHaveLength(2);
      });

      it('should return empty array for game with no presenters', async () => {
        const presenters = await repository.findPresentersByGameId(testGame.id.value);
        expect(presenters).toEqual([]);
      });

      it('should include episodes for each presenter', async () => {
        const presenter = createPresenterWithEpisodes(testGame.id.value, 'Presenter with Episodes');
        await repository.addPresenter(presenter);

        const presenters = await repository.findPresentersByGameId(testGame.id.value);
        expect(presenters[0].episodes).toHaveLength(3);
      });

      it('should return presenters ordered by creation date (oldest first)', async () => {
        const now = new Date();
        const earlier = new Date(now.getTime() - 1000);

        const presenter1Id = nanoid();
        const presenter1 = Presenter.create({
          id: presenter1Id,
          gameId: testGame.id.value,
          nickname: 'Older Presenter',
          episodes: [
            createEpisode(presenter1Id, 'Episode 1', false),
            createEpisode(presenter1Id, 'Episode 2', true),
            createEpisode(presenter1Id, 'Episode 3', false),
          ],
          createdAt: earlier,
        });

        const presenter2Id = nanoid();
        const presenter2 = Presenter.create({
          id: presenter2Id,
          gameId: testGame.id.value,
          nickname: 'Newer Presenter',
          episodes: [
            createEpisode(presenter2Id, 'Episode 1', false),
            createEpisode(presenter2Id, 'Episode 2', true),
            createEpisode(presenter2Id, 'Episode 3', false),
          ],
          createdAt: now,
        });

        await repository.addPresenter(presenter1);
        await repository.addPresenter(presenter2);

        const presenters = await repository.findPresentersByGameId(testGame.id.value);
        expect(presenters).toHaveLength(2);
        expect(presenters[0].nickname).toBe('Older Presenter');
        expect(presenters[1].nickname).toBe('Newer Presenter');
      });
    });

    describe('findPresenterById', () => {
      it('should find presenter by ID', async () => {
        const presenter = createPresenterWithEpisodes(testGame.id.value, 'Find Me');
        await repository.addPresenter(presenter);

        const found = await repository.findPresenterById(presenter.id);
        expect(found).not.toBeNull();
        expect(found?.nickname).toBe('Find Me');
      });

      it('should return null for non-existent presenter', async () => {
        const found = await repository.findPresenterById('non-existent-id');
        expect(found).toBeNull();
      });

      it('should include episodes for the presenter', async () => {
        const presenter = createPresenterWithEpisodes(testGame.id.value, 'Presenter with Episodes');
        await repository.addPresenter(presenter);

        const found = await repository.findPresenterById(presenter.id);
        expect(found?.episodes).toHaveLength(3);
      });
    });

    describe('removePresenter', () => {
      it('should remove presenter from database', async () => {
        const presenter = createPresenterWithEpisodes(testGame.id.value, 'Delete Me');
        await repository.addPresenter(presenter);

        await repository.removePresenter(presenter.id);

        const found = await repository.findPresenterById(presenter.id);
        expect(found).toBeNull();
      });

      it('should cascade delete episodes', async () => {
        const presenter = createPresenterWithEpisodes(testGame.id.value, 'Cascade Test');
        await repository.addPresenter(presenter);

        const episodesBeforeDelete = await repository.findEpisodesByPresenterId(presenter.id);
        expect(episodesBeforeDelete).toHaveLength(3);

        await repository.removePresenter(presenter.id);

        const episodesAfterDelete = await repository.findEpisodesByPresenterId(presenter.id);
        expect(episodesAfterDelete).toEqual([]);
      });
    });
  });

  describe('Episode operations', () => {
    let testGame: Game;
    let testPresenter: Presenter;

    beforeEach(async () => {
      testGame = createGame('550e8400-e29b-41d4-a716-446655440100', 'Test Game', '出題中', 10, 5);
      await repository.create(testGame);

      testPresenter = createPresenterWithEpisodes(testGame.id.value, 'Test Presenter');
      await repository.addPresenter(testPresenter);
    });

    describe('findEpisodesByPresenterId', () => {
      it('should find all episodes for a presenter', async () => {
        const episodes = await repository.findEpisodesByPresenterId(testPresenter.id);
        expect(episodes).toHaveLength(3);
      });

      it('should return empty array for presenter with no episodes', async () => {
        // Create a new presenter without using addPresenter
        const presenterId = nanoid();
        await testDb.prisma.presenter.create({
          data: {
            id: presenterId,
            gameId: testGame.id.value,
            nickname: 'No Episodes',
            createdAt: new Date(),
          },
        });

        const episodes = await repository.findEpisodesByPresenterId(presenterId);
        expect(episodes).toEqual([]);
      });

      it('should return episodes ordered by creation date (oldest first)', async () => {
        const episodes = await repository.findEpisodesByPresenterId(testPresenter.id);
        expect(episodes).toHaveLength(3);
        // Verify ordering by checking that episodes are in expected order
        expect(episodes[0].text).toBe('真実のエピソード1');
        expect(episodes[1].text).toBe('嘘のエピソード');
        expect(episodes[2].text).toBe('真実のエピソード2');
      });
    });

    describe('addEpisode', () => {
      it('should add episode to database', async () => {
        // Create a presenter without episodes
        const presenterId = nanoid();
        await testDb.prisma.presenter.create({
          data: {
            id: presenterId,
            gameId: testGame.id.value,
            nickname: 'Presenter',
            createdAt: new Date(),
          },
        });

        const episode = createEpisode(presenterId, 'New Episode', false);
        await repository.addEpisode(episode);

        const episodes = await repository.findEpisodesByPresenterId(presenterId);
        expect(episodes).toHaveLength(1);
        expect(episodes[0].text).toBe('New Episode');
      });

      it('should persist all episode properties', async () => {
        // Create a presenter without episodes
        const presenterId = nanoid();
        await testDb.prisma.presenter.create({
          data: {
            id: presenterId,
            gameId: testGame.id.value,
            nickname: 'Presenter',
            createdAt: new Date(),
          },
        });

        const episode = createEpisode(presenterId, 'Complete Episode', true);
        await repository.addEpisode(episode);

        const episodes = await repository.findEpisodesByPresenterId(presenterId);
        expect(episodes[0].id).toBe(episode.id);
        expect(episodes[0].presenterId).toBe(presenterId);
        expect(episodes[0].text).toBe('Complete Episode');
        expect(episodes[0].isLie).toBe(true);
      });
    });

    describe('updateEpisode', () => {
      it('should update episode text', async () => {
        const episodes = await repository.findEpisodesByPresenterId(testPresenter.id);
        const episodeToUpdate = episodes[0];

        const updatedEpisode = Episode.create({
          id: episodeToUpdate.id,
          presenterId: episodeToUpdate.presenterId,
          text: 'Updated Episode Text',
          isLie: episodeToUpdate.isLie,
          createdAt: episodeToUpdate.createdAt,
        });

        await repository.updateEpisode(updatedEpisode);

        const updated = await repository.findEpisodesByPresenterId(testPresenter.id);
        const found = updated.find((e) => e.id === episodeToUpdate.id);
        expect(found?.text).toBe('Updated Episode Text');
      });

      it('should update episode isLie flag', async () => {
        const episodes = await repository.findEpisodesByPresenterId(testPresenter.id);
        const episodeToUpdate = episodes[0];

        const updatedEpisode = Episode.create({
          id: episodeToUpdate.id,
          presenterId: episodeToUpdate.presenterId,
          text: episodeToUpdate.text,
          isLie: !episodeToUpdate.isLie,
          createdAt: episodeToUpdate.createdAt,
        });

        await repository.updateEpisode(updatedEpisode);

        const updated = await repository.findEpisodesByPresenterId(testPresenter.id);
        const found = updated.find((e) => e.id === episodeToUpdate.id);
        expect(found?.isLie).toBe(!episodeToUpdate.isLie);
      });
    });

    describe('removeEpisode', () => {
      it('should remove episode from database', async () => {
        const episodes = await repository.findEpisodesByPresenterId(testPresenter.id);
        const episodeToDelete = episodes[0];

        await repository.removeEpisode(episodeToDelete.id);

        const remaining = await repository.findEpisodesByPresenterId(testPresenter.id);
        expect(remaining).toHaveLength(2);
        expect(remaining.find((e) => e.id === episodeToDelete.id)).toBeUndefined();
      });

      it('should only remove specified episode', async () => {
        const episodesBefore = await repository.findEpisodesByPresenterId(testPresenter.id);
        const episodeToDelete = episodesBefore[1];
        const episodeToKeep = episodesBefore[0];

        await repository.removeEpisode(episodeToDelete.id);

        const episodesAfter = await repository.findEpisodesByPresenterId(testPresenter.id);
        expect(episodesAfter).toHaveLength(2);
        expect(episodesAfter.find((e) => e.id === episodeToKeep.id)).toBeDefined();
      });
    });
  });

  describe('Active game operations', () => {
    const gameId1 = '550e8400-e29b-41d4-a716-446655440201';
    const gameId2 = '550e8400-e29b-41d4-a716-446655440202';
    const gameId3 = '550e8400-e29b-41d4-a716-446655440203';
    const gameId4 = '550e8400-e29b-41d4-a716-446655440204';

    beforeEach(async () => {
      // Create games with different statuses
      await repository.create(createGame(gameId1, 'Active Game 1', '出題中', 10, 0));
      await repository.create(createGame(gameId2, 'Active Game 2', '出題中', 20, 0));
      await repository.create(createGame(gameId3, 'Closed Game', '締切', 15, 0));
      await repository.create(createGame(gameId4, 'Preparing Game', '準備中', 12, 0));

      // Add participations to games
      await testDb.prisma.participation.create({
        data: {
          id: nanoid(),
          gameId: gameId1,
          sessionId: 'session-1',
          nickname: 'Player 1',
          joinedAt: new Date(),
        },
      });
      await testDb.prisma.participation.create({
        data: {
          id: nanoid(),
          gameId: gameId1,
          sessionId: 'session-2',
          nickname: 'Player 2',
          joinedAt: new Date(),
        },
      });
      await testDb.prisma.participation.create({
        data: {
          id: nanoid(),
          gameId: gameId2,
          sessionId: 'session-3',
          nickname: 'Player 3',
          joinedAt: new Date(),
        },
      });
    });

    describe('findActiveGamesWithPagination', () => {
      it('should find all active games (出題中 and 締切)', async () => {
        const result = await repository.findActiveGamesWithPagination({ limit: 10, skip: 0 });

        expect(result.games).toHaveLength(3);
        expect(result.total).toBe(3);
      });

      it('should include both 出題中 and 締切 games', async () => {
        const result = await repository.findActiveGamesWithPagination({ limit: 10, skip: 0 });

        const statuses = result.games.map((g) => g.status);
        expect(statuses).toContain('出題中');
        expect(statuses).toContain('締切');
        expect(statuses).not.toContain('準備中');
      });

      it('should return actual participation counts', async () => {
        const result = await repository.findActiveGamesWithPagination({ limit: 10, skip: 0 });

        const game1 = result.games.find((g) => g.id === gameId1);
        const game2 = result.games.find((g) => g.id === gameId2);
        const game3 = result.games.find((g) => g.id === gameId3);

        expect(game1?.playerCount).toBe(2);
        expect(game2?.playerCount).toBe(1);
        expect(game3?.playerCount).toBe(0);
      });

      it('should respect limit parameter', async () => {
        const result = await repository.findActiveGamesWithPagination({ limit: 2, skip: 0 });

        expect(result.games).toHaveLength(2);
        expect(result.total).toBe(3);
      });

      it('should respect skip parameter', async () => {
        const result = await repository.findActiveGamesWithPagination({ limit: 10, skip: 2 });

        expect(result.games).toHaveLength(1);
        expect(result.total).toBe(3);
      });

      it('should return games ordered by creation date (newest first)', async () => {
        const result = await repository.findActiveGamesWithPagination({ limit: 10, skip: 0 });

        // Game 3 (Closed) was created last, so it should be first
        expect(result.games[0].title).toBe('Closed Game');
      });

      it('should return empty result when no active games', async () => {
        await testDb.prisma.game.deleteMany();

        const result = await repository.findActiveGamesWithPagination({ limit: 10, skip: 0 });

        expect(result.games).toEqual([]);
        expect(result.total).toBe(0);
      });

      it('should handle games with null name', async () => {
        // Create a game with null name directly in database
        await testDb.prisma.game.create({
          data: {
            id: '550e8400-e29b-41d4-a716-446655440299',
            name: null,
            status: '出題中',
            maxPlayers: 10,
            currentPlayers: 0,
            creatorId: 'creator-123',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        const result = await repository.findActiveGamesWithPagination({ limit: 10, skip: 0 });

        const gameWithNullName = result.games.find(
          (g) => g.id === '550e8400-e29b-41d4-a716-446655440299'
        );
        expect(gameWithNullName?.title).toBe('Untitled Game');
      });
    });

    describe('findGamesWithStatusFilter', () => {
      it('should filter games by 出題中 status', async () => {
        const result = await repository.findGamesWithStatusFilter({
          limit: 10,
          skip: 0,
          statusFilter: '出題中',
        });

        expect(result.games).toHaveLength(2);
        expect(result.games.every((g) => g.status === '出題中')).toBe(true);
        expect(result.total).toBe(2);
      });

      it('should filter games by 締切 status', async () => {
        const result = await repository.findGamesWithStatusFilter({
          limit: 10,
          skip: 0,
          statusFilter: '締切',
        });

        expect(result.games).toHaveLength(1);
        expect(result.games[0].status).toBe('締切');
        expect(result.total).toBe(1);
      });

      it('should return all active games when filter is すべて', async () => {
        const result = await repository.findGamesWithStatusFilter({
          limit: 10,
          skip: 0,
          statusFilter: 'すべて',
        });

        expect(result.games).toHaveLength(3);
        expect(result.total).toBe(3);
      });

      it('should include actual participation counts', async () => {
        const result = await repository.findGamesWithStatusFilter({
          limit: 10,
          skip: 0,
          statusFilter: 'すべて',
        });

        const game1 = result.games.find((g) => g.id === gameId1);
        expect(game1?.playerCount).toBe(2);
      });

      it('should respect pagination parameters', async () => {
        const result = await repository.findGamesWithStatusFilter({
          limit: 1,
          skip: 0,
          statusFilter: 'すべて',
        });

        expect(result.games).toHaveLength(1);
        expect(result.total).toBe(3);
      });

      it('should return games ordered by creation date (newest first)', async () => {
        const result = await repository.findGamesWithStatusFilter({
          limit: 10,
          skip: 0,
          statusFilter: 'すべて',
        });

        expect(result.games[0].title).toBe('Closed Game');
      });

      it('should return empty result when no games match filter', async () => {
        await testDb.prisma.game.deleteMany({ where: { status: '締切' } });

        const result = await repository.findGamesWithStatusFilter({
          limit: 10,
          skip: 0,
          statusFilter: '締切',
        });

        expect(result.games).toEqual([]);
        expect(result.total).toBe(0);
      });

      it('should handle games with null name', async () => {
        // Create a game with null name directly in database
        await testDb.prisma.game.create({
          data: {
            id: '550e8400-e29b-41d4-a716-446655440298',
            name: null,
            status: '出題中',
            maxPlayers: 10,
            currentPlayers: 0,
            creatorId: 'creator-123',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        const result = await repository.findGamesWithStatusFilter({
          limit: 10,
          skip: 0,
          statusFilter: 'すべて',
        });

        const gameWithNullName = result.games.find(
          (g) => g.id === '550e8400-e29b-41d4-a716-446655440298'
        );
        expect(gameWithNullName?.title).toBe('Untitled Game');
      });
    });
  });
});
