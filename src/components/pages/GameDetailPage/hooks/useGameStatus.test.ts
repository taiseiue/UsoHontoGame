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
});
