import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStatus } from './useGameStatus';

// Mock the Server Actions
vi.mock('@/app/actions/game', () => ({
  startGameAction: vi.fn(),
  closeGameAction: vi.fn(),
}));

// Get references to the mocked functions
const { startGameAction: mockStartGameAction, closeGameAction: mockCloseGameAction } = await import(
  '@/app/actions/game'
);

describe('useGameStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockStartGameAction).mockReset();
    vi.mocked(mockCloseGameAction).mockReset();

    // Mock window.confirm to return true by default
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true)
    );
  });

  describe('initialization', () => {
    it('should initialize with provided status', () => {
      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '準備中',
          onSuccess: vi.fn(),
          onError: vi.fn(),
        })
      );

      expect(result.current.currentStatus).toBe('準備中');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.canStart).toBe(true);
      expect(result.current.canClose).toBe(false);
    });

    it('should set correct availability flags for 出題中 status', () => {
      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '出題中',
          onSuccess: vi.fn(),
          onError: vi.fn(),
        })
      );

      expect(result.current.currentStatus).toBe('出題中');
      expect(result.current.canStart).toBe(false);
      expect(result.current.canClose).toBe(true);
    });

    it('should set correct availability flags for 締切 status', () => {
      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '締切',
          onSuccess: vi.fn(),
          onError: vi.fn(),
        })
      );

      expect(result.current.currentStatus).toBe('締切');
      expect(result.current.canStart).toBe(false);
      expect(result.current.canClose).toBe(false);
    });
  });

  describe('startGame', () => {
    it('should set loading state during start game action', async () => {
      vi.mocked(mockStartGameAction).mockReturnValue(new Promise(() => {})); // Never resolves

      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '準備中',
          onSuccess: vi.fn(),
          onError: vi.fn(),
        })
      );

      act(() => {
        result.current.startGame();
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should update status optimistically and call onSuccess when start succeeds', async () => {
      vi.mocked(mockStartGameAction).mockResolvedValue({ success: true });
      const onSuccess = vi.fn();

      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '準備中',
          onSuccess,
          onError: vi.fn(),
        })
      );

      await act(async () => {
        result.current.startGame();
      });

      await waitFor(() => {
        expect(result.current.currentStatus).toBe('出題中');
        expect(result.current.isLoading).toBe(false);
        expect(onSuccess).toHaveBeenCalledWith('出題中');
      });
    });

    it('should rollback status and call onError when start fails', async () => {
      vi.mocked(mockStartGameAction).mockResolvedValue({
        success: false,
        errors: { _form: ['ゲームを開始するには出題者が必要です'] },
      });
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '準備中',
          onSuccess: vi.fn(),
          onError,
          enableRetry: false, // Disable retries to test immediate rollback
        })
      );

      await act(async () => {
        result.current.startGame();
      });

      await waitFor(() => {
        expect(result.current.currentStatus).toBe('準備中'); // Rolled back
        expect(result.current.isLoading).toBe(false);
        expect(onError).toHaveBeenCalledWith('ゲームを開始するには出題者が必要です');
      });
    });

    it('should not start game if already in progress', async () => {
      vi.mocked(mockStartGameAction).mockReturnValue(new Promise(() => {})); // Never resolves

      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '準備中',
          onSuccess: vi.fn(),
          onError: vi.fn(),
        })
      );

      act(() => {
        result.current.startGame();
      });

      expect(result.current.isLoading).toBe(true);

      // Try to start again
      act(() => {
        result.current.startGame();
      });

      // Should only be called once
      expect(mockStartGameAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('closeGame', () => {
    it('should set loading state during close game action', async () => {
      vi.mocked(mockCloseGameAction).mockReturnValue(new Promise(() => {})); // Never resolves

      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '出題中',
          onSuccess: vi.fn(),
          onError: vi.fn(),
        })
      );

      act(() => {
        result.current.closeGame();
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should update status optimistically and call onSuccess when close succeeds', async () => {
      vi.mocked(mockCloseGameAction).mockResolvedValue({ success: true });
      const onSuccess = vi.fn();

      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '出題中',
          onSuccess,
          onError: vi.fn(),
        })
      );

      await act(async () => {
        result.current.closeGame();
      });

      await waitFor(() => {
        expect(result.current.currentStatus).toBe('締切');
        expect(result.current.isLoading).toBe(false);
        expect(onSuccess).toHaveBeenCalledWith('締切');
      });
    });

    it('should rollback status and call onError when close fails', async () => {
      vi.mocked(mockCloseGameAction).mockResolvedValue({
        success: false,
        errors: { _form: ['締切状態のゲームは変更できません'] },
      });
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '出題中',
          onSuccess: vi.fn(),
          onError,
          enableRetry: false, // Disable retries to test immediate rollback
        })
      );

      await act(async () => {
        result.current.closeGame();
      });

      await waitFor(() => {
        expect(result.current.currentStatus).toBe('出題中'); // Rolled back
        expect(result.current.isLoading).toBe(false);
        expect(onError).toHaveBeenCalledWith('締切状態のゲームは変更できません');
      });
    });
  });

  describe('resetStatus', () => {
    it('should reset status to initial value', () => {
      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '準備中',
          onSuccess: vi.fn(),
          onError: vi.fn(),
        })
      );

      // Manually change status (simulating optimistic update)
      act(() => {
        result.current.resetStatus();
      });

      expect(result.current.currentStatus).toBe('準備中');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('status transitions validation', () => {
    it('should not allow startGame from non-preparation status', async () => {
      vi.mocked(mockStartGameAction).mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '出題中',
          onSuccess: vi.fn(),
          onError: vi.fn(),
        })
      );

      await act(async () => {
        result.current.startGame();
      });

      // Should not call the action since status is already 出題中
      expect(mockStartGameAction).not.toHaveBeenCalled();
    });

    it('should not allow closeGame from non-accepting status', async () => {
      vi.mocked(mockCloseGameAction).mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '準備中',
          onSuccess: vi.fn(),
          onError: vi.fn(),
        })
      );

      await act(async () => {
        result.current.closeGame();
      });

      // Should not call the action since status is 準備中
      expect(mockCloseGameAction).not.toHaveBeenCalled();
    });
  });

  describe('retry mechanism', () => {
    it('should retry on failure when enableRetry is true', async () => {
      // Tests line 98-99 branch: enableRetry && attempt < maxRetries (true branch)
      let callCount = 0;
      vi.mocked(mockStartGameAction).mockImplementation(async () => {
        callCount++;
        if (callCount < 3) {
          return { success: false, errors: { _form: ['一時的なエラー'] } };
        }
        return { success: true };
      });

      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '準備中',
          onSuccess,
          onError,
          enableRetry: true,
          maxRetries: 2,
          retryDelay: 10, // Short delay for testing
        })
      );

      await act(async () => {
        result.current.startGame();
      });

      await waitFor(() => {
        expect(callCount).toBe(3);
        expect(result.current.currentStatus).toBe('出題中');
        expect(onSuccess).toHaveBeenCalledWith('出題中');
        expect(onError).not.toHaveBeenCalled();
      });
    });

    it('should rollback after all retries are exhausted', async () => {
      // Tests line 98-106 branch: retry exhaustion
      vi.mocked(mockStartGameAction).mockResolvedValue({
        success: false,
        errors: { _form: ['永続的なエラー'] },
      });

      const onError = vi.fn();

      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '準備中',
          onSuccess: vi.fn(),
          onError,
          enableRetry: true,
          maxRetries: 2,
          retryDelay: 10,
        })
      );

      await act(async () => {
        result.current.startGame();
      });

      await waitFor(() => {
        expect(result.current.currentStatus).toBe('準備中'); // Rolled back
        expect(result.current.isLoading).toBe(false);
        expect(onError).toHaveBeenCalledWith('永続的なエラー（3回試行後）');
      });
    });

    it('should show retry count during retries', async () => {
      // Tests line 70-75 branch: attempt !== 0 (retry path)
      let callCount = 0;
      vi.mocked(mockStartGameAction).mockImplementation(async () => {
        callCount++;
        if (callCount < 2) {
          return { success: false, errors: { _form: ['一時的なエラー'] } };
        }
        return { success: true };
      });

      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '準備中',
          onSuccess: vi.fn(),
          onError: vi.fn(),
          enableRetry: true,
          maxRetries: 2,
          retryDelay: 10,
        })
      );

      await act(async () => {
        result.current.startGame();
      });

      await waitFor(() => {
        expect(result.current.retryCount).toBe(0); // Reset after success
        expect(result.current.isRetrying).toBe(false);
      });
    });
  });

  describe('error handling edge cases', () => {
    it('should handle error without _form field', async () => {
      // Tests line 86-89 branch: fallback error message when result.errors._form is undefined
      vi.mocked(mockStartGameAction).mockResolvedValue({
        success: false,
        errors: { gameId: ['Invalid game ID'] },
      });

      const onError = vi.fn();

      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '準備中',
          onSuccess: vi.fn(),
          onError,
          enableRetry: false,
        })
      );

      await act(async () => {
        result.current.startGame();
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('ゲームの開始に失敗しました');
      });
    });

    it('should handle non-Error exceptions', async () => {
      // Tests line 92-95 branch: error is not instanceof Error
      vi.mocked(mockStartGameAction).mockRejectedValue('String error');

      const onError = vi.fn();

      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '準備中',
          onSuccess: vi.fn(),
          onError,
          enableRetry: false,
        })
      );

      await act(async () => {
        result.current.startGame();
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('ゲームの開始に失敗しました');
      });
    });
  });

  describe('confirmation dialog', () => {
    it('should not close game when user cancels confirmation', async () => {
      // Tests line 136-137 branch: !confirmed (false branch)
      vi.stubGlobal(
        'confirm',
        vi.fn(() => false)
      );

      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '出題中',
          onSuccess: vi.fn(),
          onError: vi.fn(),
        })
      );

      await act(async () => {
        result.current.closeGame();
      });

      // Should not call the action since user cancelled
      expect(mockCloseGameAction).not.toHaveBeenCalled();
      expect(result.current.currentStatus).toBe('出題中');
    });
  });

  describe('cleanup', () => {
    it('should cleanup retry timeout when resetStatus is called during retry', async () => {
      // Tests line 162-165 branch: retryTimeoutRef.current !== null
      vi.mocked(mockStartGameAction).mockResolvedValue({
        success: false,
        errors: { _form: ['エラー'] },
      });

      const { result } = renderHook(() =>
        useGameStatus({
          gameId: 'game-123',
          initialStatus: '準備中',
          onSuccess: vi.fn(),
          onError: vi.fn(),
          enableRetry: true,
          maxRetries: 3,
          retryDelay: 1000, // Long delay to test timeout cleanup
        })
      );

      // Start game (will trigger retries)
      act(() => {
        result.current.startGame();
      });

      // Reset during retry
      act(() => {
        result.current.resetStatus();
      });

      expect(result.current.currentStatus).toBe('準備中');
      expect(result.current.retryCount).toBe(0);
      expect(result.current.isRetrying).toBe(false);
    });
  });
});
