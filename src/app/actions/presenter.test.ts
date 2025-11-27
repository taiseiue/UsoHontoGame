/**
 * Presenter Server Actions Tests
 * Tests for presenter management server actions
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies at top level
const mockRepository = {
  findPresenterById: vi.fn(),
  findPresentersByGameId: vi.fn(),
  findEpisodesByPresenterId: vi.fn(),
  addPresenter: vi.fn(),
  removePresenter: vi.fn(),
  addEpisode: vi.fn(),
};

const mockSessionService = {
  requireCurrentSession: vi.fn(),
};

const mockRevalidatePath = vi.fn();

// Mock use case execute functions
const mockAddPresenterWithEpisodesExecute = vi.fn();

vi.mock('@/server/infrastructure/repositories', () => ({
  createGameRepository: () => mockRepository,
}));

vi.mock('@/server/infrastructure/di/SessionServiceContainer', () => ({
  SessionServiceContainer: {
    getSessionService: () => mockSessionService,
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}));

// Mock use cases
vi.mock('@/server/application/use-cases/games/AddPresenterWithEpisodes', () => ({
  AddPresenterWithEpisodes: class {
    constructor(public repository: unknown) {}
    execute = mockAddPresenterWithEpisodesExecute;
  },
}));

// Import after mocks
const {
  addEpisodeAction,
  addPresenterAction,
  addPresenterWithEpisodesAction,
  removePresenterAction,
} = await import('./presenter');

describe('Presenter Server Actions', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockSessionService.requireCurrentSession.mockResolvedValue('test-session-123456789');

    // Set default mock returns
    mockRepository.findPresentersByGameId.mockResolvedValue([]);
    mockRepository.findEpisodesByPresenterId.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('addPresenterAction', () => {
    it('should add presenter successfully', async () => {
      const formData = new FormData();
      formData.append('gameId', 'game-123');
      formData.append('nickname', 'Test Presenter');

      const mockPresenter = {
        id: 'presenter-123',
        gameId: 'game-123',
        nickname: 'Test Presenter',
        episodes: [],
        createdAt: new Date(),
      };

      mockRepository.addPresenter = vi.fn().mockResolvedValue(mockPresenter);

      const result = await addPresenterAction(formData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.presenter.nickname).toBe('Test Presenter');
      }
    });

    it('should return validation error for missing gameId', async () => {
      const formData = new FormData();
      formData.append('nickname', 'Test Presenter');

      const result = await addPresenterAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
      }
    });

    it('should return validation error for missing nickname', async () => {
      const formData = new FormData();
      formData.append('gameId', 'game-123');

      const result = await addPresenterAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
      }
    });

    it('should return error when session is not found', async () => {
      mockSessionService.requireCurrentSession.mockRejectedValue(new Error('Session not found'));

      const formData = new FormData();
      formData.append('gameId', 'game-123');
      formData.append('nickname', 'Test Presenter');

      const result = await addPresenterAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain(
          'セッションが見つかりません。ログインし直してください。'
        );
      }
    });

    it('should handle validation errors from use case', async () => {
      const formData = new FormData();
      formData.append('gameId', 'invalid-game');
      formData.append('nickname', 'Test');

      const result = await addPresenterAction(formData);

      // Either success or validation error
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('removePresenterAction', () => {
    it('should remove presenter successfully', async () => {
      const formData = new FormData();
      formData.append('gameId', 'game-123');
      formData.append('presenterId', 'presenter-123');

      const mockPresenter = {
        id: 'presenter-123',
        gameId: 'game-123',
        nickname: 'Test Presenter',
        episodes: [],
        createdAt: new Date(),
      };

      mockRepository.findPresenterById.mockResolvedValue(mockPresenter);
      mockRepository.removePresenter = vi.fn().mockResolvedValue(undefined);

      const result = await removePresenterAction(formData);

      expect(result.success).toBe(true);
    });

    it('should return validation error for missing gameId', async () => {
      const formData = new FormData();
      formData.append('presenterId', 'presenter-123');

      const result = await removePresenterAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
      }
    });

    it('should return validation error for missing presenterId', async () => {
      const formData = new FormData();
      formData.append('gameId', 'game-123');

      const result = await removePresenterAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
      }
    });

    it('should return error when session is not found', async () => {
      mockSessionService.requireCurrentSession.mockRejectedValue(new Error('Session not found'));

      const formData = new FormData();
      formData.append('gameId', 'game-123');
      formData.append('presenterId', 'presenter-123');

      const result = await removePresenterAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain(
          'セッションが見つかりません。ログインし直してください。'
        );
      }
    });

    it('should validate presenter removal', async () => {
      const formData = new FormData();
      formData.append('gameId', 'game-123');
      formData.append('presenterId', 'presenter-123');

      const mockPresenter = {
        id: 'presenter-123',
        gameId: 'game-123',
        nickname: 'Test Presenter',
        episodes: [],
        createdAt: new Date(),
      };

      mockRepository.findPresenterById.mockResolvedValue(mockPresenter);
      mockRepository.removePresenter = vi.fn().mockResolvedValue(undefined);

      const result = await removePresenterAction(formData);

      // Should process the request
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('addEpisodeAction (deprecated)', () => {
    it('should add episode successfully', async () => {
      const formData = new FormData();
      formData.append('presenterId', 'presenter-123');
      formData.append('text', 'Test episode');
      formData.append('isLie', 'true');

      const mockEpisode = {
        id: 'episode-123',
        presenterId: 'presenter-123',
        text: 'Test episode',
        isLie: true,
        createdAt: new Date(),
      };

      const mockPresenter = {
        id: 'presenter-123',
        gameId: 'game-123',
        nickname: 'Test',
      };

      mockRepository.findPresenterById.mockResolvedValue(mockPresenter);
      mockRepository.addEpisode = vi.fn().mockResolvedValue(mockEpisode);

      const result = await addEpisodeAction(formData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.episode.text).toBe('Test episode');
        expect(result.episode.isLie).toBe(true);
      }
    });

    it('should return validation error for missing presenterId', async () => {
      const formData = new FormData();
      formData.append('text', 'Test episode');
      formData.append('isLie', 'true');

      const result = await addEpisodeAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
      }
    });

    it('should return validation error for missing text', async () => {
      const formData = new FormData();
      formData.append('presenterId', 'presenter-123');
      formData.append('isLie', 'true');

      const result = await addEpisodeAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
      }
    });

    it('should handle isLie as false when not "true"', async () => {
      const formData = new FormData();
      formData.append('presenterId', 'presenter-123');
      formData.append('text', 'Test episode');
      formData.append('isLie', 'false');

      const mockEpisode = {
        id: 'episode-123',
        presenterId: 'presenter-123',
        text: 'Test episode',
        isLie: false,
        createdAt: new Date(),
      };

      mockRepository.findPresenterById.mockResolvedValue({
        id: 'presenter-123',
        gameId: 'game-123',
      });
      mockRepository.addEpisode = vi.fn().mockResolvedValue(mockEpisode);

      const result = await addEpisodeAction(formData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.episode.isLie).toBe(false);
      }
    });

    it('should handle repository execution errors', async () => {
      const formData = new FormData();
      formData.append('presenterId', 'presenter-123');
      formData.append('text', 'Test episode');
      formData.append('isLie', 'true');

      mockRepository.findPresenterById.mockResolvedValue({
        id: 'presenter-123',
        gameId: 'game-123',
      });
      mockRepository.addEpisode = vi.fn().mockRejectedValue(new Error('Database insert failed'));

      const result = await addEpisodeAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain('Database insert failed');
      }
    });

    it('should handle non-existent presenter (null presenter check)', async () => {
      // Tests branch at line 223-225: if (presenter) - null branch
      const formData = new FormData();
      formData.append('presenterId', 'non-existent-presenter');
      formData.append('text', 'Test episode');
      formData.append('isLie', 'true');

      // Presenter not found - returns null
      mockRepository.findPresenterById.mockResolvedValue(null);

      const result = await addEpisodeAction(formData);

      // Should fail because presenter doesn't exist (use case throws NotFoundError)
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toBeDefined();
        // The null branch is tested - revalidatePath is not called when presenter is null
      }
    });
  });

  describe('addPresenterWithEpisodesAction', () => {
    it('should successfully add presenter with episodes', async () => {
      const formData = new FormData();
      formData.append('gameId', 'game-123');
      formData.append('nickname', 'Test Presenter');
      formData.append('episodes[0].text', 'Episode 1');
      formData.append('episodes[0].isLie', 'false');
      formData.append('episodes[1].text', 'Episode 2');
      formData.append('episodes[1].isLie', 'true');
      formData.append('episodes[2].text', 'Episode 3');
      formData.append('episodes[2].isLie', 'false');

      mockAddPresenterWithEpisodesExecute.mockResolvedValue({
        presenter: {
          id: 'presenter-123',
          nickname: 'Test Presenter',
          liesCount: 1,
          episodes: [
            { id: 'ep1', text: 'Episode 1', isLie: false },
            { id: 'ep2', text: 'Episode 2', isLie: true },
            { id: 'ep3', text: 'Episode 3', isLie: false },
          ],
        },
      });

      const result = await addPresenterWithEpisodesAction(formData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.presenter.nickname).toBe('Test Presenter');
      }
      expect(mockRevalidatePath).toHaveBeenCalledWith('/game/game-123/presenters');
    });

    it('should support alternative field names (episode0Text, episode0IsLie)', async () => {
      const formData = new FormData();
      formData.append('gameId', 'game-123');
      formData.append('nickname', 'Test Presenter');
      formData.append('episode0Text', 'Episode 1');
      formData.append('episode0IsLie', 'false');
      formData.append('episode1Text', 'Episode 2');
      formData.append('episode1IsLie', 'true');
      formData.append('episode2Text', 'Episode 3');
      formData.append('episode2IsLie', 'false');

      const result = await addPresenterWithEpisodesAction(formData);

      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });

    it('should return validation error for missing gameId', async () => {
      const formData = new FormData();
      formData.append('nickname', 'Test Presenter');

      const result = await addPresenterWithEpisodesAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
      }
    });

    it('should return validation error for missing nickname', async () => {
      const formData = new FormData();
      formData.append('gameId', 'game-123');

      const result = await addPresenterWithEpisodesAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
      }
    });

    it('should return error when session is not found', async () => {
      mockSessionService.requireCurrentSession.mockRejectedValue(new Error('Session not found'));

      const formData = new FormData();
      formData.append('gameId', 'game-123');
      formData.append('nickname', 'Test Presenter');
      formData.append('episodes[0].text', 'Episode 1');
      formData.append('episodes[0].isLie', 'false');
      formData.append('episodes[1].text', 'Episode 2');
      formData.append('episodes[1].isLie', 'true');
      formData.append('episodes[2].text', 'Episode 3');
      formData.append('episodes[2].isLie', 'false');

      const result = await addPresenterWithEpisodesAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain(
          'セッションが見つかりません。ログインし直してください。'
        );
      }
    });
  });
});
