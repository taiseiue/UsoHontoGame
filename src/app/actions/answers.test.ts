// Server Action Tests: Answer Submission
// Test-Driven Development: Write FAILING tests first
// Tasks: T027-T028

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IAnswerRepository } from '@/server/domain/repositories/IAnswerRepository';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import type { IParticipationRepository } from '@/server/domain/repositories/IParticipationRepository';
import type { ISessionService } from '@/server/domain/repositories/ISessionService';
import { getGameForAnswersAction, submitAnswerAction } from './answers';

// Create mock instances that will be reused
const mockGetGameForAnswers = {
  execute: vi.fn(),
};

const mockSubmitAnswer = {
  execute: vi.fn(),
};

// Mock the use case classes with proper constructors
vi.mock('@/server/application/use-cases/answers/GetGameForAnswers', () => ({
  GetGameForAnswers: vi.fn().mockImplementation(function (this: {
    execute: typeof mockGetGameForAnswers.execute;
  }) {
    Object.assign(this, mockGetGameForAnswers);
  }),
}));

vi.mock('@/server/application/use-cases/answers/SubmitAnswer', () => ({
  SubmitAnswer: vi.fn().mockImplementation(function (this: {
    execute: typeof mockSubmitAnswer.execute;
  }) {
    Object.assign(this, mockSubmitAnswer);
  }),
}));

// Mock repository
vi.mock('@/server/infrastructure/repositories', () => ({
  createGameRepository: vi.fn(),
  createAnswerRepository: vi.fn(),
  createParticipationRepository: vi.fn(),
}));

// Mock session service
vi.mock('@/server/infrastructure/di/SessionServiceContainer', () => ({
  SessionServiceContainer: {
    getSessionService: vi.fn(),
  },
}));

// Mock ValidateSession use case
const mockValidateSession = {
  execute: vi.fn(),
};

vi.mock('@/server/application/use-cases/session/ValidateSession', () => ({
  ValidateSession: vi.fn().mockImplementation(function (this: {
    execute: typeof mockValidateSession.execute;
  }) {
    Object.assign(this, mockValidateSession);
  }),
}));

// Mock CookieSessionRepository
vi.mock('@/server/infrastructure/repositories/CookieSessionRepository', () => ({
  CookieSessionRepository: vi.fn(function (this: Record<string, never>) {
    return {};
  }),
}));

describe('Answer Submission Server Actions', () => {
  let mockGameRepository: IGameRepository;
  let mockAnswerRepository: IAnswerRepository;
  let mockParticipationRepository: IParticipationRepository;
  let mockSessionService: ISessionService;

  beforeEach(async () => {
    mockGameRepository = {
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
      findByCreatorId: vi.fn(),
      findByStatus: vi.fn(),
    };

    mockAnswerRepository = {
      upsert: vi.fn(),
      findBySessionAndGame: vi.fn(),
      findByGameId: vi.fn(),
      delete: vi.fn(),
    };

    mockParticipationRepository = {
      create: vi.fn(),
      exists: vi.fn(),
      countByGameId: vi.fn(),
      findBySessionAndGame: vi.fn(),
    };

    mockSessionService = {
      requireCurrentSession: vi.fn(),
      getCurrentSession: vi.fn(),
    };

    // Clear all mocks
    vi.clearAllMocks();
    mockValidateSession.execute.mockClear();

    // Setup mocks
    const { createGameRepository, createAnswerRepository, createParticipationRepository } =
      await import('@/server/infrastructure/repositories');
    const { SessionServiceContainer } = await import(
      '@/server/infrastructure/di/SessionServiceContainer'
    );

    vi.mocked(createGameRepository).mockReturnValue(mockGameRepository);
    vi.mocked(createAnswerRepository).mockReturnValue(mockAnswerRepository);
    vi.mocked(createParticipationRepository).mockReturnValue(mockParticipationRepository);
    vi.mocked(SessionServiceContainer.getSessionService).mockReturnValue(mockSessionService);
  });

  describe('getGameForAnswersAction', () => {
    it('should successfully retrieve game data', async () => {
      // Arrange
      const gameId = '550e8400-e29b-41d4-a716-446655440000';
      mockGetGameForAnswers.execute.mockResolvedValue({
        success: true,
        data: {
          id: gameId,
          name: 'Test Game',
          status: '出題中',
          maxPlayers: 10,
          currentPlayers: 5,
        },
      });

      // Act
      const result = await getGameForAnswersAction(gameId);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(gameId);
        expect(result.data.name).toBe('Test Game');
        expect(result.data.status).toBe('出題中');
      }
      expect(mockGetGameForAnswers.execute).toHaveBeenCalledWith(gameId);
    });

    it('should return error when game not found', async () => {
      // Arrange
      const gameId = '550e8400-e29b-41d4-a716-446655440001';
      mockGetGameForAnswers.execute.mockResolvedValue({
        success: false,
        error: {
          code: 'GAME_NOT_FOUND',
          message: 'ゲームが見つかりません',
        },
      });

      // Act
      const result = await getGameForAnswersAction(gameId);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('GAME_NOT_FOUND');
        expect(result.error.message).toContain('ゲームが見つかりません');
      }
    });

    it('should return error when game is closed', async () => {
      // Arrange
      const gameId = '550e8400-e29b-41d4-a716-446655440002';
      mockGetGameForAnswers.execute.mockResolvedValue({
        success: false,
        error: {
          code: 'GAME_CLOSED',
          message: 'このゲームは締め切られました',
        },
      });

      // Act
      const result = await getGameForAnswersAction(gameId);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('GAME_CLOSED');
      }
    });

    it('should return error for invalid game ID', async () => {
      // Arrange
      mockGetGameForAnswers.execute.mockResolvedValue({
        success: false,
        error: {
          code: 'INVALID_GAME_ID',
          message: 'ゲームIDが無効です',
        },
      });

      // Act
      const result = await getGameForAnswersAction('');

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_GAME_ID');
      }
    });
  });

  describe('submitAnswerAction', () => {
    it('should successfully submit answer with valid session', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('gameId', '550e8400-e29b-41d4-a716-446655440000');
      formData.append(
        'selections',
        JSON.stringify({
          'presenter-1': 'episode-1',
          'presenter-2': 'episode-3',
        })
      );

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');
      mockValidateSession.execute.mockResolvedValue({
        sessionId: 'session-123',
        nickname: 'TestUser',
      });

      mockSubmitAnswer.execute.mockResolvedValue({
        success: true,
        data: {
          answerId: 'answer-123',
          message: '回答を送信しました',
        },
      });

      // Act
      const result = await submitAnswerAction(formData);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.answerId).toBe('answer-123');
        expect(result.data.message).toContain('回答を送信しました');
      }
      expect(mockSubmitAnswer.execute).toHaveBeenCalledWith({
        gameId: '550e8400-e29b-41d4-a716-446655440000',
        sessionId: 'session-123',
        nickname: 'TestUser',
        selections: {
          'presenter-1': 'episode-1',
          'presenter-2': 'episode-3',
        },
      });
    });

    it('should return error when session not found', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('gameId', '550e8400-e29b-41d4-a716-446655440000');
      formData.append(
        'selections',
        JSON.stringify({
          'presenter-1': 'episode-1',
        })
      );

      mockSessionService.requireCurrentSession.mockRejectedValue(new Error('Session not found'));

      // Act
      const result = await submitAnswerAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toBeDefined();
        expect(result.errors._form?.[0]).toContain('セッションが見つかりません');
      }
    });

    it('should use default nickname when nickname not set', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('gameId', '550e8400-e29b-41d4-a716-446655440000');
      formData.append(
        'selections',
        JSON.stringify({
          'presenter-1': 'episode-1',
          'presenter-2': 'episode-3',
        })
      );

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');
      mockValidateSession.execute.mockResolvedValue({
        sessionId: 'session-123',
        nickname: null,
      });

      mockSubmitAnswer.execute.mockResolvedValue({
        success: true,
        data: {
          answerId: 'answer-456',
          message: '回答を送信しました',
        },
      });

      // Act
      const result = await submitAnswerAction(formData);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.answerId).toBe('answer-456');
      }
      // Verify that a default nickname was used (参加者_<sessionId first 8 chars>)
      expect(mockSubmitAnswer.execute).toHaveBeenCalledWith({
        gameId: '550e8400-e29b-41d4-a716-446655440000',
        sessionId: 'session-123',
        nickname: '参加者_session-',
        selections: {
          'presenter-1': 'episode-1',
          'presenter-2': 'episode-3',
        },
      });
    });

    it('should return validation errors for invalid input', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('gameId', ''); // Invalid: empty game ID
      formData.append('selections', JSON.stringify({})); // Invalid: empty selections

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');
      mockValidateSession.execute.mockResolvedValue({
        sessionId: 'session-123',
        nickname: 'TestUser',
      });

      // Act
      const result = await submitAnswerAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
        expect(
          result.errors.gameId || result.errors.selections || result.errors._form
        ).toBeDefined();
      }
    });

    it('should return error when game not found', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('gameId', '550e8400-e29b-41d4-a716-446655440001');
      formData.append(
        'selections',
        JSON.stringify({
          'presenter-1': 'episode-1',
        })
      );

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');
      mockValidateSession.execute.mockResolvedValue({
        sessionId: 'session-123',
        nickname: 'TestUser',
      });

      mockSubmitAnswer.execute.mockResolvedValue({
        success: false,
        error: {
          code: 'GAME_NOT_FOUND',
          message: 'ゲームが見つかりません',
        },
      });

      // Act
      const result = await submitAnswerAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toBeDefined();
        expect(result.errors._form?.[0]).toContain('ゲームが見つかりません');
      }
    });

    it('should return error when game is closed', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('gameId', '550e8400-e29b-41d4-a716-446655440002');
      formData.append(
        'selections',
        JSON.stringify({
          'presenter-1': 'episode-1',
        })
      );

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');
      mockValidateSession.execute.mockResolvedValue({
        sessionId: 'session-123',
        nickname: 'TestUser',
      });

      mockSubmitAnswer.execute.mockResolvedValue({
        success: false,
        error: {
          code: 'GAME_CLOSED',
          message: 'このゲームは締め切られました',
        },
      });

      // Act
      const result = await submitAnswerAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toBeDefined();
        expect(result.errors._form?.[0]).toContain('締め切られました');
      }
    });

    it('should return error when participant limit reached', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('gameId', '550e8400-e29b-41d4-a716-446655440003');
      formData.append(
        'selections',
        JSON.stringify({
          'presenter-1': 'episode-1',
        })
      );

      mockSessionService.requireCurrentSession.mockResolvedValue('new-session');
      mockSessionService.getCurrentSession.mockResolvedValue({
        sessionId: 'new-session',
        nickname: 'NewUser',
      });

      mockSubmitAnswer.execute.mockResolvedValue({
        success: false,
        error: {
          code: 'PARTICIPANT_LIMIT_REACHED',
          message: '参加人数が上限に達しました',
        },
      });

      // Act
      const result = await submitAnswerAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toBeDefined();
        expect(result.errors._form?.[0]).toContain('参加人数が上限に達しました');
      }
    });

    it('should handle JSON parsing errors gracefully', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('gameId', '550e8400-e29b-41d4-a716-446655440000');
      formData.append('selections', 'invalid-json'); // Invalid JSON

      mockSessionService.requireCurrentSession.mockResolvedValue('session-123');
      mockValidateSession.execute.mockResolvedValue({
        sessionId: 'session-123',
        nickname: 'TestUser',
      });

      // Act
      const result = await submitAnswerAction(formData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form || result.errors.selections).toBeDefined();
      }
    });
  });
});
