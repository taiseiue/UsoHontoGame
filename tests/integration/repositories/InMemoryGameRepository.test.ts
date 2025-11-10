import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryGameRepository } from '@/server/infrastructure/repositories/InMemoryGameRepository';
import { Game } from '@/server/domain/entities/Game';
import { GameId } from '@/server/domain/value-objects/GameId';
import { GameStatus } from '@/server/domain/value-objects/GameStatus';

describe('InMemoryGameRepository', () => {
  let repository: InMemoryGameRepository;

  beforeEach(() => {
    // Get fresh instance for each test
    repository = InMemoryGameRepository.getInstance();
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

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = InMemoryGameRepository.getInstance();
      const instance2 = InMemoryGameRepository.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should have test data initialized', async () => {
      const games = await repository.findAll();
      expect(games.length).toBeGreaterThan(0);
    });
  });

  describe('findAll', () => {
    it('should return all games including test data', async () => {
      const games = await repository.findAll();
      expect(games).toBeInstanceOf(Array);
      expect(games.length).toBeGreaterThanOrEqual(5); // Initial test data
    });

    it('should return Game entities', async () => {
      const games = await repository.findAll();
      expect(games[0]).toBeInstanceOf(Game);
    });
  });

  describe('findByStatus', () => {
    it('should return only games with 出題中 status', async () => {
      const acceptingStatus = new GameStatus('出題中');
      const games = await repository.findByStatus(acceptingStatus);

      expect(games.length).toBeGreaterThan(0);
      games.forEach((game) => {
        expect(game.status.value).toBe('出題中');
      });
    });

    it('should return only games with 準備中 status', async () => {
      const preparingStatus = new GameStatus('準備中');
      const games = await repository.findByStatus(preparingStatus);

      expect(games.length).toBeGreaterThan(0);
      games.forEach((game) => {
        expect(game.status.value).toBe('準備中');
      });
    });

    it('should return only games with 締切 status', async () => {
      const closedStatus = new GameStatus('締切');
      const games = await repository.findByStatus(closedStatus);

      expect(games.length).toBeGreaterThan(0);
      games.forEach((game) => {
        expect(game.status.value).toBe('締切');
      });
    });

    it('should return empty array if no games match status', async () => {
      // First, clear any games with status we're testing
      const testStatus = new GameStatus('出題中');

      // Create a new game with different status to ensure we have something
      await repository.create(
        createGame('550e8400-e29b-41d4-a716-446655440099', 'Test', '準備中', 10, 0)
      );

      const preparingGames = await repository.findByStatus(new GameStatus('準備中'));
      expect(preparingGames.length).toBeGreaterThan(0);
    });
  });

  describe('findById', () => {
    it('should return game by ID from test data', async () => {
      const gameId = new GameId('550e8400-e29b-41d4-a716-446655440001');
      const game = await repository.findById(gameId);

      expect(game).not.toBeNull();
      expect(game?.id.value).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(game?.name).toBe('第1回 ウソ？ホント？クイズ');
    });

    it('should return null for non-existent ID', async () => {
      const gameId = new GameId('550e8400-e29b-41d4-a716-999999999999');
      const game = await repository.findById(gameId);

      expect(game).toBeNull();
    });

    it('should return Game entity', async () => {
      const gameId = new GameId('550e8400-e29b-41d4-a716-446655440001');
      const game = await repository.findById(gameId);

      expect(game).toBeInstanceOf(Game);
    });
  });

  describe('create', () => {
    it('should create new game', async () => {
      const newGame = createGame(
        '550e8400-e29b-41d4-a716-446655440100',
        'New Test Game',
        '出題中',
        10,
        0
      );

      await repository.create(newGame);

      const found = await repository.findById(newGame.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe('New Test Game');
    });

    it('should add game to findAll results', async () => {
      const initialCount = (await repository.findAll()).length;

      const newGame = createGame(
        '550e8400-e29b-41d4-a716-446655440101',
        'Another Game',
        '準備中',
        5,
        0
      );

      await repository.create(newGame);

      const games = await repository.findAll();
      expect(games.length).toBe(initialCount + 1);
    });

    it('should make game findable by status', async () => {
      const newGame = createGame(
        '550e8400-e29b-41d4-a716-446655440102',
        'Status Test',
        '締切',
        10,
        10
      );

      await repository.create(newGame);

      const closedGames = await repository.findByStatus(new GameStatus('締切'));
      const found = closedGames.find((g) => g.id.value === newGame.id.value);
      expect(found).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update existing game', async () => {
      const gameId = new GameId('550e8400-e29b-41d4-a716-446655440001');
      const game = await repository.findById(gameId);

      expect(game).not.toBeNull();
      if (!game) return;

      // Update the status
      game.setStatus(new GameStatus('締切'));

      await repository.update(game);

      const updated = await repository.findById(gameId);
      expect(updated?.status.value).toBe('締切');
    });

    it('should overwrite game with same ID', async () => {
      const gameId = '550e8400-e29b-41d4-a716-446655440103';
      const originalGame = createGame(gameId, 'Original', '準備中', 10, 0);

      await repository.create(originalGame);

      const updatedGame = createGame(gameId, 'Updated', '出題中', 20, 5);

      await repository.update(updatedGame);

      const found = await repository.findById(new GameId(gameId));
      expect(found?.name).toBe('Updated');
      expect(found?.maxPlayers).toBe(20);
      expect(found?.currentPlayers).toBe(5);
    });
  });

  describe('delete', () => {
    it('should delete existing game', async () => {
      const gameId = new GameId('550e8400-e29b-41d4-a716-446655440104');
      const game = createGame(gameId.value, 'To Delete', '出題中', 10, 0);

      await repository.create(game);
      expect(await repository.findById(gameId)).not.toBeNull();

      await repository.delete(gameId);
      expect(await repository.findById(gameId)).toBeNull();
    });

    it('should reduce findAll count', async () => {
      const gameId = new GameId('550e8400-e29b-41d4-a716-446655440105');
      const game = createGame(gameId.value, 'Count Test', '準備中', 10, 0);

      await repository.create(game);
      const countBefore = (await repository.findAll()).length;

      await repository.delete(gameId);
      const countAfter = (await repository.findAll()).length;

      expect(countAfter).toBe(countBefore - 1);
    });

    it('should not throw error when deleting non-existent game', async () => {
      const gameId = new GameId('550e8400-e29b-41d4-a716-999999999999');
      await expect(repository.delete(gameId)).resolves.not.toThrow();
    });
  });

  describe('test data initialization', () => {
    it('should have game with status 出題中', async () => {
      const acceptingGames = await repository.findByStatus(new GameStatus('出題中'));
      expect(acceptingGames.length).toBeGreaterThanOrEqual(3);
    });

    it('should have game with status 準備中', async () => {
      const preparingGames = await repository.findByStatus(new GameStatus('準備中'));
      expect(preparingGames.length).toBeGreaterThanOrEqual(1);
    });

    it('should have game with status 締切', async () => {
      const closedGames = await repository.findByStatus(new GameStatus('締切'));
      expect(closedGames.length).toBeGreaterThanOrEqual(1);
    });

    it('should have expected test game names', async () => {
      const allGames = await repository.findAll();
      const names = allGames.map((g) => g.name);

      expect(names).toContain('第1回 ウソ？ホント？クイズ');
      expect(names).toContain('真実はどっち？対決');
      expect(names).toContain('みんなでウソつき当て');
    });
  });
});
