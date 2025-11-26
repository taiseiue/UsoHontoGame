// Hook Tests: useGameValidation
// Test-Driven Development: Write FAILING tests first
// Task: T032

import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameValidation } from './useGameValidation';

// Mock server action
vi.mock('@/app/actions/answers', () => ({
  getGameForAnswersAction: vi.fn(),
}));

describe('useGameValidation', () => {
  const mockGameId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should start with loading state', async () => {
      const { getGameForAnswersAction } = await import('@/app/actions/answers');
      vi.mocked(getGameForAnswersAction).mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useGameValidation({ gameId: mockGameId }));

      expect(result.current.isLoading).toBe(true);
    });

    it('should have no error initially', async () => {
      const { getGameForAnswersAction } = await import('@/app/actions/answers');
      vi.mocked(getGameForAnswersAction).mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useGameValidation({ gameId: mockGameId }));

      expect(result.current.error).toBeNull();
    });

    it('should have no game data initially', async () => {
      const { getGameForAnswersAction } = await import('@/app/actions/answers');
      vi.mocked(getGameForAnswersAction).mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useGameValidation({ gameId: mockGameId }));

      expect(result.current.game).toBeNull();
    });
  });

  describe('Validation on Mount', () => {
    it('should validate game on mount', async () => {
      const { getGameForAnswersAction } = await import('@/app/actions/answers');
      vi.mocked(getGameForAnswersAction).mockResolvedValue({
        success: true,
        data: {
          id: mockGameId,
          name: 'Test Game',
          status: '出題中',
          maxPlayers: 10,
          currentPlayers: 5,
        },
      });

      const { result } = renderHook(() => useGameValidation({ gameId: mockGameId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.game).toEqual({
        id: mockGameId,
        name: 'Test Game',
        status: '出題中',
        maxPlayers: 10,
        currentPlayers: 5,
      });
      expect(result.current.error).toBeNull();
    });

    it('should call getGameForAnswersAction with gameId', async () => {
      const { getGameForAnswersAction } = await import('@/app/actions/answers');
      vi.mocked(getGameForAnswersAction).mockResolvedValue({
        success: true,
        data: {
          id: mockGameId,
          name: 'Test Game',
          status: '出題中',
          maxPlayers: 10,
          currentPlayers: 5,
        },
      });

      renderHook(() => useGameValidation({ gameId: mockGameId }));

      await waitFor(() => {
        expect(getGameForAnswersAction).toHaveBeenCalledWith(mockGameId);
      });
    });

    it('should only validate once on mount', async () => {
      const { getGameForAnswersAction } = await import('@/app/actions/answers');
      vi.mocked(getGameForAnswersAction).mockResolvedValue({
        success: true,
        data: {
          id: mockGameId,
          name: 'Test Game',
          status: '出題中',
          maxPlayers: 10,
          currentPlayers: 5,
        },
      });

      renderHook(() => useGameValidation({ gameId: mockGameId }));

      await waitFor(() => {
        expect(getGameForAnswersAction).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle GAME_NOT_FOUND error', async () => {
      const { getGameForAnswersAction } = await import('@/app/actions/answers');
      vi.mocked(getGameForAnswersAction).mockResolvedValue({
        success: false,
        error: {
          code: 'GAME_NOT_FOUND',
          message: 'ゲームが見つかりません',
        },
      });

      const { result } = renderHook(() => useGameValidation({ gameId: mockGameId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual({
        code: 'GAME_NOT_FOUND',
        message: 'ゲームが見つかりません',
      });
      expect(result.current.game).toBeNull();
    });

    it('should handle GAME_CLOSED error', async () => {
      const { getGameForAnswersAction } = await import('@/app/actions/answers');
      vi.mocked(getGameForAnswersAction).mockResolvedValue({
        success: false,
        error: {
          code: 'GAME_CLOSED',
          message: 'このゲームは締め切られました',
        },
      });

      const { result } = renderHook(() => useGameValidation({ gameId: mockGameId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual({
        code: 'GAME_CLOSED',
        message: 'このゲームは締め切られました',
      });
    });

    it('should handle INVALID_GAME_ID error', async () => {
      const { getGameForAnswersAction } = await import('@/app/actions/answers');
      vi.mocked(getGameForAnswersAction).mockResolvedValue({
        success: false,
        error: {
          code: 'INVALID_GAME_ID',
          message: 'ゲームIDが無効です',
        },
      });

      const { result } = renderHook(() => useGameValidation({ gameId: '' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual({
        code: 'INVALID_GAME_ID',
        message: 'ゲームIDが無効です',
      });
    });

    it('should call onError callback when validation fails', async () => {
      const { getGameForAnswersAction } = await import('@/app/actions/answers');
      vi.mocked(getGameForAnswersAction).mockResolvedValue({
        success: false,
        error: {
          code: 'GAME_NOT_FOUND',
          message: 'ゲームが見つかりません',
        },
      });

      const onError = vi.fn();
      renderHook(() => useGameValidation({ gameId: mockGameId, onError }));

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith({
          code: 'GAME_NOT_FOUND',
          message: 'ゲームが見つかりません',
        });
      });
    });

    it('should handle network errors gracefully', async () => {
      const { getGameForAnswersAction } = await import('@/app/actions/answers');
      vi.mocked(getGameForAnswersAction).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useGameValidation({ gameId: mockGameId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual({
        code: 'UNKNOWN_ERROR',
        message: '予期しないエラーが発生しました',
      });
    });
  });

  describe('Success Callback', () => {
    it('should call onSuccess callback when validation succeeds', async () => {
      const { getGameForAnswersAction } = await import('@/app/actions/answers');
      const gameData = {
        id: mockGameId,
        name: 'Test Game',
        status: '出題中' as const,
        maxPlayers: 10,
        currentPlayers: 5,
      };
      vi.mocked(getGameForAnswersAction).mockResolvedValue({
        success: true,
        data: gameData,
      });

      const onSuccess = vi.fn();
      renderHook(() => useGameValidation({ gameId: mockGameId, onSuccess }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(gameData);
      });
    });
  });

  describe('Retry Functionality', () => {
    it('should provide retry function', async () => {
      const { getGameForAnswersAction } = await import('@/app/actions/answers');
      vi.mocked(getGameForAnswersAction).mockResolvedValue({
        success: false,
        error: {
          code: 'GAME_NOT_FOUND',
          message: 'ゲームが見つかりません',
        },
      });

      const { result } = renderHook(() => useGameValidation({ gameId: mockGameId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.retry).toBe('function');
    });

    it('should retry validation when retry is called', async () => {
      const { getGameForAnswersAction } = await import('@/app/actions/answers');
      vi.mocked(getGameForAnswersAction)
        .mockResolvedValueOnce({
          success: false,
          error: {
            code: 'GAME_NOT_FOUND',
            message: 'ゲームが見つかりません',
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            id: mockGameId,
            name: 'Test Game',
            status: '出題中',
            maxPlayers: 10,
            currentPlayers: 5,
          },
        });

      const { result } = renderHook(() => useGameValidation({ gameId: mockGameId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();

      result.current.retry();

      await waitFor(() => {
        expect(result.current.game).toBeTruthy();
      });

      expect(result.current.error).toBeNull();
    });

    it('should set loading state during retry', async () => {
      const { getGameForAnswersAction } = await import('@/app/actions/answers');
      let resolveFirst: () => void;
      let resolveSecond: () => void;

      vi.mocked(getGameForAnswersAction)
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveFirst = () =>
                resolve({
                  success: false,
                  error: {
                    code: 'GAME_NOT_FOUND',
                    message: 'ゲームが見つかりません',
                  },
                });
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveSecond = () =>
                resolve({
                  success: true,
                  data: {
                    id: mockGameId,
                    name: 'Test Game',
                    status: '出題中',
                    maxPlayers: 10,
                    currentPlayers: 5,
                  },
                });
            })
        );

      const { result } = renderHook(() => useGameValidation({ gameId: mockGameId }));

      await waitFor(() => {
        resolveFirst!();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await waitFor(() => {
        resolveSecond!();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});
