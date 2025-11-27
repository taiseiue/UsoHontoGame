import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import type { ISessionService } from '@/server/domain/repositories/ISessionService';
import {
  closeGameAction,
  createGameAction,
  createGameAndRedirect,
  deleteGameAction,
  getGameDetailAction,
  getGamesAction,
  startAcceptingAction,
  startGameAction,
  updateGameAction,
} from './game';

// Create mock execute functions
const mockCreateGameExecute = vi.fn();
const mockDeleteGameExecute = vi.fn();
const mockGetGamesByCreatorExecute = vi.fn();
const mockStartAcceptingResponsesExecute = vi.fn();
const mockUpdateGameSettingsExecute = vi.fn();
const mockValidateStatusTransitionExecute = vi.fn();
const mockCloseGameExecute = vi.fn();

// Mock use case classes with proper constructors
vi.mock('@/server/application/use-cases/games/CreateGame', () => ({
  CreateGame: class {
    constructor(public repository: unknown) {}
    execute = mockCreateGameExecute;
  },
}));

vi.mock('@/server/application/use-cases/games/DeleteGame', () => ({
  DeleteGame: class {
    constructor(public repository: unknown) {}
    execute = mockDeleteGameExecute;
  },
}));

vi.mock('@/server/application/use-cases/games/GetGamesByCreator', () => ({
  GetGamesByCreator: class {
    constructor(public repository: unknown) {}
    execute = mockGetGamesByCreatorExecute;
  },
}));

vi.mock('@/server/application/use-cases/games/StartAcceptingResponses', () => ({
  StartAcceptingResponses: class {
    constructor(public repository: unknown) {}
    execute = mockStartAcceptingResponsesExecute;
  },
}));

vi.mock('@/server/application/use-cases/games/UpdateGameSettings', () => ({
  UpdateGameSettings: class {
    constructor(public repository: unknown) {}
    execute = mockUpdateGameSettingsExecute;
  },
}));

vi.mock('@/server/application/use-cases/games/ValidateStatusTransition', () => ({
  ValidateStatusTransition: class {
    constructor(public repository: unknown) {}
    execute = mockValidateStatusTransitionExecute;
  },
}));

vi.mock('@/server/application/use-cases/games/CloseGame', () => ({
  CloseGame: class {
    constructor(public repository: unknown) {}
    execute = mockCloseGameExecute;
  },
}));

// Mock repository
vi.mock('@/server/infrastructure/repositories', () => ({
  createGameRepository: vi.fn(),
}));

// Mock session service
vi.mock('@/server/infrastructure/di/SessionServiceContainer', () => ({
  SessionServiceContainer: {
    getSessionService: vi.fn(),
  },
}));

// Mock Next.js cache functions
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Status Transition Server Actions', () => {
  let mockRepository: IGameRepository;
  let mockSessionService: ISessionService;

  beforeEach(async () => {
    mockRepository = {
      findById: vi.fn(),
      findPresentersByGameId: vi.fn(),
      findEpisodesByPresenterId: vi.fn(),
      update: vi.fn(),
    };

    mockSessionService = {
      requireCurrentSession: vi.fn(),
    };

    // Clear all mocks
    vi.clearAllMocks();

    // Setup mocks
    const { createGameRepository } = await import('@/server/infrastructure/repositories');
    const { SessionServiceContainer } = await import(
      '@/server/infrastructure/di/SessionServiceContainer'
    );

    vi.mocked(createGameRepository).mockReturnValue(mockRepository);
    vi.mocked(SessionServiceContainer.getSessionService).mockReturnValue(mockSessionService);
  });

  describe('startGameAction', () => {
    it('should successfully start a game with valid data', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('gameId', 'game-123');

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');

      mockValidateStatusTransitionExecute.mockResolvedValue({
        canTransition: true,
        currentStatus: '準備中',
        targetStatus: '出題中',
        errors: [],
      });

      mockStartAcceptingResponsesExecute.mockResolvedValue({ success: true });

      // Act
      const result = await startGameAction(formData);

      // Assert
      expect(result).toEqual({ success: true });
      expect(mockValidateStatusTransitionExecute).toHaveBeenCalledWith(
        'game-123',
        '出題中',
        'session-123'
      );
      expect(mockStartAcceptingResponsesExecute).toHaveBeenCalledWith({ gameId: 'game-123' });
    });

    it('should return validation errors when transition is not allowed', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('gameId', 'game-123');

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');

      mockValidateStatusTransitionExecute.mockResolvedValue({
        canTransition: false,
        currentStatus: '準備中',
        targetStatus: '出題中',
        errors: [
          {
            code: 'NO_PRESENTERS',
            message: 'ゲームを開始するには出題者が必要です',
          },
        ],
      });

      // Act
      const result = await startGameAction(formData);

      // Assert
      expect(result).toEqual({
        success: false,
        errors: {
          _form: ['ゲームを開始するには出題者が必要です'],
        },
      });
    });

    it('should return error when session is not found', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('gameId', 'game-123');

      mockSessionService.requireCurrentSession.mockRejectedValue(new Error('Session not found'));

      // Act
      const result = await startGameAction(formData);

      // Assert
      expect(result).toEqual({
        success: false,
        errors: {
          _form: ['セッションが見つかりません。ニックネームを設定してください。'],
        },
      });
    });

    it('should return error for invalid form data', async () => {
      // Arrange
      const formData = new FormData();
      // Missing gameId

      // Act
      const result = await startGameAction(formData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('closeGameAction', () => {
    it('should successfully close a game with valid data', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('gameId', 'game-123');
      formData.append('confirmed', 'true');

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');

      mockValidateStatusTransitionExecute.mockResolvedValue({
        canTransition: true,
        currentStatus: '出題中',
        targetStatus: '締切',
        errors: [],
      });

      mockCloseGameExecute.mockResolvedValue({ success: true });

      // Act
      const result = await closeGameAction(formData);

      // Assert
      expect(result).toEqual({ success: true });
      expect(mockValidateStatusTransitionExecute).toHaveBeenCalledWith(
        'game-123',
        '締切',
        'session-123'
      );
      expect(mockCloseGameExecute).toHaveBeenCalledWith({
        gameId: 'game-123',
        sessionId: 'session-123',
      });
    });

    it('should return validation errors when transition is not allowed', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('gameId', 'game-123');
      formData.append('confirmed', 'true');

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');

      mockValidateStatusTransitionExecute.mockResolvedValue({
        canTransition: false,
        currentStatus: '締切',
        targetStatus: '出題中',
        errors: [
          {
            code: 'GAME_ALREADY_CLOSED',
            message: '締切状態のゲームは変更できません',
          },
        ],
      });

      // Act
      const result = await closeGameAction(formData);

      // Assert
      expect(result).toEqual({
        success: false,
        errors: {
          _form: ['締切状態のゲームは変更できません'],
        },
      });
    });

    it('should return error when confirmation is missing', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('gameId', 'game-123');
      // Missing confirmed parameter

      // Act
      const result = await closeGameAction(formData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('createGameAction', () => {
    it('should successfully create a game with valid data', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Game');
      formData.append('playerLimit', '10');

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');

      mockCreateGameExecute.mockResolvedValue({
        id: 'game-123',
        name: 'Test Game',
        maxPlayers: 10,
        currentPlayers: 0,
        availableSlots: 10,
        status: '準備中',
        creatorId: 'session-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createGameAction(formData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.game.name).toBe('Test Game');
        expect(result.game.maxPlayers).toBe(10);
      }
    });

    it('should return validation errors for invalid player limit', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Game');
      formData.append('playerLimit', '0'); // Invalid

      const result = await createGameAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
      }
    });

    it('should return error when session is not found', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Game');
      formData.append('playerLimit', '10');

      mockSessionService.requireCurrentSession.mockRejectedValue(new Error('Session not found'));

      const result = await createGameAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain(
          'セッションが見つかりません。ニックネームを設定してください。'
        );
      }
    });

    it('should handle empty game name', async () => {
      const formData = new FormData();
      formData.append('name', '');
      formData.append('playerLimit', '10');

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');

      mockCreateGameExecute.mockResolvedValue({
        id: 'game-123',
        name: null,
        maxPlayers: 10,
        currentPlayers: 0,
        availableSlots: 10,
        status: '準備中',
        creatorId: 'session-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createGameAction(formData);

      expect(result.success).toBe(true);
    });

    it('should handle use case execution errors', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Game');
      formData.append('playerLimit', '10');

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');
      mockCreateGameExecute.mockRejectedValue(new Error('Database connection failed'));

      const result = await createGameAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain('Database connection failed');
      }
    });
  });

  describe('createGameAndRedirect', () => {
    it('should redirect to home page on successful creation', async () => {
      const { redirect } = await import('next/navigation');
      const mockRedirect = vi.mocked(redirect);

      const formData = new FormData();
      formData.append('name', 'Test Game');
      formData.append('playerLimit', '10');

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');

      mockCreateGameExecute.mockResolvedValue({
        id: 'game-123',
        name: 'Test Game',
        maxPlayers: 10,
        currentPlayers: 0,
        availableSlots: 10,
        status: '準備中',
        creatorId: 'session-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock redirect to throw (this is how Next.js redirect works)
      mockRedirect.mockImplementation(() => {
        throw new Error('NEXT_REDIRECT');
      });

      await expect(createGameAndRedirect(formData)).rejects.toThrow('NEXT_REDIRECT');
      expect(mockRedirect).toHaveBeenCalledWith('/');
    });

    it('should throw error on failed creation', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Game');
      formData.append('playerLimit', '0'); // Invalid

      await expect(createGameAndRedirect(formData)).rejects.toThrow('Game creation failed');
    });
  });

  describe('startAcceptingAction', () => {
    it('should successfully start accepting responses', async () => {
      const formData = new FormData();
      formData.append('gameId', 'game-123');

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');
      mockStartAcceptingResponsesExecute.mockResolvedValue(undefined);

      const result = await startAcceptingAction(formData);

      expect(result.success).toBe(true);
      expect(mockStartAcceptingResponsesExecute).toHaveBeenCalledWith({ gameId: 'game-123' });
    });

    it('should return validation errors for missing gameId', async () => {
      const formData = new FormData();

      const result = await startAcceptingAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
      }
    });

    it('should return error when session is not found', async () => {
      const formData = new FormData();
      formData.append('gameId', 'game-123');

      mockSessionService.requireCurrentSession.mockRejectedValue(new Error('Session not found'));

      const result = await startAcceptingAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain(
          'セッションが見つかりません。ログインし直してください。'
        );
      }
    });

    it('should handle use case execution errors', async () => {
      const formData = new FormData();
      formData.append('gameId', 'game-123');

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');
      mockStartAcceptingResponsesExecute.mockRejectedValue(new Error('Status transition failed'));

      const result = await startAcceptingAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain('Status transition failed');
      }
    });
  });

  describe('getGamesAction', () => {
    it('should successfully retrieve games for current creator', async () => {
      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');

      mockGetGamesByCreatorExecute.mockResolvedValue({
        games: [
          {
            id: 'game-1',
            name: 'Game 1',
            status: '準備中',
            currentPlayers: 5,
            maxPlayers: 10,
            availableSlots: 5,
          },
          {
            id: 'game-2',
            name: 'Game 2',
            status: '出題中',
            currentPlayers: 8,
            maxPlayers: 10,
            availableSlots: 2,
          },
        ],
      });

      const result = await getGamesAction();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.games).toHaveLength(2);
        expect(result.games[0].name).toBe('Game 1');
      }
    });

    it('should return error when session is not found', async () => {
      mockSessionService.requireCurrentSession.mockRejectedValue(new Error('Session not found'));

      const result = await getGamesAction();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain(
          'セッションが見つかりません。ログインし直してください。'
        );
      }
    });

    it('should handle use case execution errors', async () => {
      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');
      mockGetGamesByCreatorExecute.mockRejectedValue(new Error('Database query failed'));

      const result = await getGamesAction();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain('Database query failed');
      }
    });
  });

  describe('getGameDetailAction', () => {
    it('should successfully retrieve game detail', async () => {
      const validGameId = '123e4567-e89b-42d3-a456-426614174000'; // Valid UUID v4 format
      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');

      const mockGame = {
        id: { toString: () => validGameId },
        name: 'Test Game',
        status: { toString: () => '準備中' },
        maxPlayers: 10,
        currentPlayers: 5,
        availableSlots: 5,
        creatorId: 'session-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockGame);

      const result = await getGameDetailAction(validGameId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.game.name).toBe('Test Game');
        expect(result.game.creatorId).toBe('session-123');
      }
    });

    it('should return error when game is not found', async () => {
      const validGameId = '123e4567-e89b-42d3-a456-426614174000'; // Valid UUID v4 format
      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');
      mockRepository.findById.mockResolvedValue(null);

      const result = await getGameDetailAction(validGameId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain('ゲームが見つかりません');
      }
    });

    it('should return error when user is not the creator', async () => {
      const validGameId = '123e4567-e89b-42d3-a456-426614174000'; // Valid UUID v4 format
      mockSessionService.requireCurrentSession.mockResolvedValue('session-456');

      const mockGame = {
        id: { toString: () => validGameId },
        name: 'Test Game',
        status: { toString: () => '準備中' },
        maxPlayers: 10,
        currentPlayers: 5,
        availableSlots: 5,
        creatorId: 'session-123', // Different from current session
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockGame);

      const result = await getGameDetailAction(validGameId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain('このゲームの編集権限がありません');
      }
    });
  });

  describe('updateGameAction', () => {
    it('should successfully update game settings', async () => {
      const formData = new FormData();
      formData.append('gameId', 'game-123');
      formData.append('playerLimit', '20');

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');

      mockUpdateGameSettingsExecute.mockResolvedValue({
        game: {
          id: 'game-123',
          name: 'Test Game',
          maxPlayers: 20,
          currentPlayers: 5,
          availableSlots: 15,
          status: '準備中',
          creatorId: 'session-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const result = await updateGameAction(formData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.game.maxPlayers).toBe(20);
      }
    });

    it('should return validation errors for invalid player limit', async () => {
      const formData = new FormData();
      formData.append('gameId', 'game-123');
      formData.append('playerLimit', '0'); // Invalid

      const result = await updateGameAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
      }
    });

    it('should return error when use case returns null game', async () => {
      const formData = new FormData();
      formData.append('gameId', 'game-123');
      formData.append('playerLimit', '20');

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');
      mockUpdateGameSettingsExecute.mockResolvedValue({ game: null });

      const result = await updateGameAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain('ゲームの更新に失敗しました');
      }
    });
  });

  describe('deleteGameAction', () => {
    it('should successfully delete a game', async () => {
      const formData = new FormData();
      formData.append('gameId', 'game-123');

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');
      mockDeleteGameExecute.mockResolvedValue(undefined);

      const result = await deleteGameAction(formData);

      expect(result.success).toBe(true);
      expect(mockDeleteGameExecute).toHaveBeenCalledWith({
        gameId: 'game-123',
        requesterId: 'session-123',
      });
    });

    it('should return validation errors for missing gameId', async () => {
      const formData = new FormData();

      const result = await deleteGameAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
      }
    });

    it('should return error when session is not found', async () => {
      const formData = new FormData();
      formData.append('gameId', 'game-123');

      mockSessionService.requireCurrentSession.mockRejectedValue(new Error('Session not found'));

      const result = await deleteGameAction(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain(
          'セッションが見つかりません。ログインし直してください。'
        );
      }
    });
  });
});
