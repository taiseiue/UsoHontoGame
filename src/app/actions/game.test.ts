import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import type { ISessionService } from '@/server/domain/repositories/ISessionService';
import { closeGameAction, startGameAction } from './game';

// Create mock instances that will be reused
const mockValidateStatusTransition = {
  execute: vi.fn(),
};

const mockStartAcceptingResponses = {
  execute: vi.fn(),
};

const mockCloseGame = {
  execute: vi.fn(),
};

// Mock the use case classes with proper constructors
vi.mock('@/server/application/use-cases/games/ValidateStatusTransition', () => ({
  ValidateStatusTransition: vi.fn().mockImplementation(function (this: {
    execute: typeof mockValidateStatusTransition.execute;
  }) {
    Object.assign(this, mockValidateStatusTransition);
  }),
}));

vi.mock('@/server/application/use-cases/games/StartAcceptingResponses', () => ({
  StartAcceptingResponses: vi.fn().mockImplementation(function (this: {
    execute: typeof mockStartAcceptingResponses.execute;
  }) {
    Object.assign(this, mockStartAcceptingResponses);
  }),
}));

vi.mock('@/server/application/use-cases/games/CloseGame', () => ({
  CloseGame: vi.fn().mockImplementation(function (this: { execute: typeof mockCloseGame.execute }) {
    Object.assign(this, mockCloseGame);
  }),
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

      mockValidateStatusTransition.execute.mockResolvedValue({
        canTransition: true,
        currentStatus: '準備中',
        targetStatus: '出題中',
        errors: [],
      });

      mockStartAcceptingResponses.execute.mockResolvedValue({ success: true });

      // Act
      const result = await startGameAction(formData);

      // Assert
      expect(result).toEqual({ success: true });
      expect(mockValidateStatusTransition.execute).toHaveBeenCalledWith(
        'game-123',
        '出題中',
        'session-123'
      );
      expect(mockStartAcceptingResponses.execute).toHaveBeenCalledWith({ gameId: 'game-123' });
    });

    it('should return validation errors when transition is not allowed', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('gameId', 'game-123');

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');

      mockValidateStatusTransition.execute.mockResolvedValue({
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

      mockValidateStatusTransition.execute.mockResolvedValue({
        canTransition: true,
        currentStatus: '出題中',
        targetStatus: '締切',
        errors: [],
      });

      mockCloseGame.execute.mockResolvedValue({ success: true });

      // Act
      const result = await closeGameAction(formData);

      // Assert
      expect(result).toEqual({ success: true });
      expect(mockValidateStatusTransition.execute).toHaveBeenCalledWith(
        'game-123',
        '締切',
        'session-123'
      );
      expect(mockCloseGame.execute).toHaveBeenCalledWith({
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

      mockValidateStatusTransition.execute.mockResolvedValue({
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
});
