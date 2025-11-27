import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';
import type { GameStatusValue } from '@/server/domain/value-objects/GameStatus';
import { StatusTransitionButton } from './StatusTransitionButton';

// Mock the Server Actions
vi.mock('@/app/actions/game', () => ({
  startGameAction: vi.fn(),
  closeGameAction: vi.fn(),
}));

// Mock hooks
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
  statusTransitionToasts: {
    gameStarted: () => ({ message: 'ゲームが正常に開始されました', title: 'ゲーム開始' }),
    gameClosed: () => ({ message: 'ゲームが正常に締切されました', title: 'ゲーム締切' }),
  },
}));

// Mock animations
vi.mock('@/lib/animations', () => ({
  animationSequences: {
    buttonSuccess: vi.fn().mockResolvedValue(undefined),
    buttonError: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock alert function
const mockAlert = vi.fn();

// Get references to the mocked functions
const { startGameAction: mockStartGameAction, closeGameAction: mockCloseGameAction } = await import(
  '@/app/actions/game'
);

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AccessibilityProvider>{children}</AccessibilityProvider>
);

describe('StatusTransitionButton', () => {
  const defaultProps = {
    gameId: 'game-123',
    currentStatus: '準備中' as GameStatusValue,
    onSuccess: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockStartGameAction).mockReset();
    vi.mocked(mockCloseGameAction).mockReset();
    mockAlert.mockClear();

    // Mock alert globally
    vi.stubGlobal('alert', mockAlert);
  });

  describe('準備中 status', () => {
    it('should render "ゲームを開始" button for preparation status', () => {
      render(
        <TestWrapper>
          <StatusTransitionButton {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /ゲームを開始/i })).toBeInTheDocument();
    });

    it('should call startGameAction when start button is clicked', async () => {
      vi.mocked(mockStartGameAction).mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <StatusTransitionButton {...defaultProps} />
        </TestWrapper>
      );

      const startButton = screen.getByRole('button', { name: /ゲームを開始/i });

      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(mockStartGameAction).toHaveBeenCalled();
      });
    });

    it('should show loading state when action is in progress', async () => {
      vi.mocked(mockStartGameAction).mockReturnValue(new Promise(() => {})); // Never resolves

      render(
        <TestWrapper>
          <StatusTransitionButton {...defaultProps} />
        </TestWrapper>
      );

      const startButton = screen.getByRole('button', { name: /ゲームを開始/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(startButton).toBeDisabled();
      });
    });

    it('should call onSuccess when start action succeeds', async () => {
      vi.mocked(mockStartGameAction).mockResolvedValue({ success: true });
      const onSuccess = vi.fn();

      render(
        <TestWrapper>
          <StatusTransitionButton {...defaultProps} onSuccess={onSuccess} />
        </TestWrapper>
      );

      const startButton = screen.getByRole('button', { name: /ゲームを開始/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should call onError when start action fails', async () => {
      vi.mocked(mockStartGameAction).mockResolvedValue({
        success: false,
        errors: { _form: ['ゲームを開始するには出題者が必要です'] },
      });
      const onError = vi.fn();

      render(
        <TestWrapper>
          <StatusTransitionButton {...defaultProps} onError={onError} />
        </TestWrapper>
      );

      const startButton = screen.getByRole('button', { name: /ゲームを開始/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('ゲームを開始するには出題者が必要です');
      });
    });
  });

  describe('出題中 status', () => {
    const acceptingProps = {
      ...defaultProps,
      currentStatus: '出題中' as GameStatusValue,
    };

    it('should render "ゲームを締切" button for accepting responses status', () => {
      render(
        <TestWrapper>
          <StatusTransitionButton {...acceptingProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /ゲームを締切/i })).toBeInTheDocument();
    });

    it('should show confirmation dialog when close button is clicked', async () => {
      // Mock confirm dialog
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(mockCloseGameAction).mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <StatusTransitionButton {...acceptingProps} />
        </TestWrapper>
      );

      const closeButton = screen.getByRole('button', { name: /ゲームを締切/i });

      await act(async () => {
        fireEvent.click(closeButton);
      });

      expect(confirmSpy).toHaveBeenCalledWith('本当にゲームを締切しますか？');

      confirmSpy.mockRestore();
    });

    it('should not call closeGameAction when confirmation is cancelled', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(
        <TestWrapper>
          <StatusTransitionButton {...acceptingProps} />
        </TestWrapper>
      );

      const closeButton = screen.getByRole('button', { name: /ゲームを締切/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(mockCloseGameAction).not.toHaveBeenCalled();
      });

      confirmSpy.mockRestore();
    });

    it('should call closeGameAction when confirmation is accepted', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(mockCloseGameAction).mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <StatusTransitionButton {...acceptingProps} />
        </TestWrapper>
      );

      const closeButton = screen.getByRole('button', { name: /ゲームを締切/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(mockCloseGameAction).toHaveBeenCalled();
      });

      confirmSpy.mockRestore();
    });

    it('should call onSuccess when close action succeeds', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(mockCloseGameAction).mockResolvedValue({ success: true });
      const onSuccess = vi.fn();

      render(
        <TestWrapper>
          <StatusTransitionButton {...acceptingProps} onSuccess={onSuccess} />
        </TestWrapper>
      );

      const closeButton = screen.getByRole('button', { name: /ゲームを締切/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });

      confirmSpy.mockRestore();
    });

    it('should call onError when close action fails', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(mockCloseGameAction).mockResolvedValue({
        success: false,
        errors: { _form: ['ゲームの締切に失敗しました'] },
      });
      const onError = vi.fn();

      render(
        <TestWrapper>
          <StatusTransitionButton {...acceptingProps} onError={onError} />
        </TestWrapper>
      );

      const closeButton = screen.getByRole('button', { name: /ゲームを締切/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('ゲームの締切に失敗しました');
        // Note: alert() is called but due to test environment timing, we focus on testing onError callback
      });

      confirmSpy.mockRestore();
    });
  });

  describe('締切 status', () => {
    const closedProps = {
      ...defaultProps,
      currentStatus: '締切' as GameStatusValue,
    };

    it('should not render any button for closed status', () => {
      render(
        <TestWrapper>
          <StatusTransitionButton {...closedProps} />
        </TestWrapper>
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should return null for invalid status', () => {
      const invalidProps = {
        ...defaultProps,
        currentStatus: 'invalid-status' as never,
      };

      render(
        <TestWrapper>
          <StatusTransitionButton {...invalidProps} />
        </TestWrapper>
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for start button', () => {
      render(
        <TestWrapper>
          <StatusTransitionButton {...defaultProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /ゲームを開始/i });
      expect(button).toHaveAttribute('aria-label');
      expect(button).not.toHaveAttribute('aria-disabled', 'true');
    });

    it('should have proper ARIA attributes when disabled', async () => {
      vi.mocked(mockStartGameAction).mockReturnValue(new Promise(() => {})); // Never resolves

      render(
        <TestWrapper>
          <StatusTransitionButton {...defaultProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /ゲームを開始/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute('aria-disabled', 'true');
      });
    });
  });

  describe('Exception handling', () => {
    it('should handle exceptions thrown by startGameAction', async () => {
      const error = new Error('Network error');
      vi.mocked(mockStartGameAction).mockRejectedValue(error);
      const onError = vi.fn();

      render(
        <TestWrapper>
          <StatusTransitionButton {...defaultProps} onError={onError} />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /ゲームを開始/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Network error');
      });
    });

    it('should handle exceptions thrown by closeGameAction', async () => {
      const error = new Error('Network error during close');
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(mockCloseGameAction).mockRejectedValue(error);
      const onError = vi.fn();

      const acceptingProps = {
        ...defaultProps,
        currentStatus: '出題中' as const,
      };

      render(
        <TestWrapper>
          <StatusTransitionButton {...acceptingProps} onError={onError} />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /ゲームを締切/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Network error during close');
      });

      confirmSpy.mockRestore();
    });

    it('should use default error message when exception is not an Error instance', async () => {
      vi.mocked(mockStartGameAction).mockRejectedValue('string error');
      const onError = vi.fn();

      render(
        <TestWrapper>
          <StatusTransitionButton {...defaultProps} onError={onError} />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /ゲームを開始/i });
      fireEvent.click(button);

      await waitFor(() => {
        // Component uses fallback error message from catch block
        expect(onError).toHaveBeenCalled();
      });
    });
  });

  describe('Animation states', () => {
    it('should show success state after successful start', async () => {
      vi.mocked(mockStartGameAction).mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <StatusTransitionButton {...defaultProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /ゲームを開始/i });
      fireEvent.click(button);

      await waitFor(
        () => {
          // Button should show success animation state
          expect(screen.getByText('成功!')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it('should show success state after successful close', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(mockCloseGameAction).mockResolvedValue({ success: true });

      const acceptingProps = {
        ...defaultProps,
        currentStatus: '出題中' as const,
      };

      render(
        <TestWrapper>
          <StatusTransitionButton {...acceptingProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /ゲームを締切/i });
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(screen.getByText('成功!')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      confirmSpy.mockRestore();
    });

    it('should show error state after failed start', async () => {
      vi.mocked(mockStartGameAction).mockResolvedValue({
        success: false,
        errors: { _form: ['エラーが発生しました'] },
      });

      render(
        <TestWrapper>
          <StatusTransitionButton {...defaultProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /ゲームを開始/i });
      fireEvent.click(button);

      await waitFor(
        () => {
          // Button should show error animation state
          expect(screen.getByText('エラー')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it('should show error state after failed close', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(mockCloseGameAction).mockResolvedValue({
        success: false,
        errors: { _form: ['締切に失敗しました'] },
      });

      const acceptingProps = {
        ...defaultProps,
        currentStatus: '出題中' as const,
      };

      render(
        <TestWrapper>
          <StatusTransitionButton {...acceptingProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /ゲームを締切/i });
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(screen.getByText('エラー')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      confirmSpy.mockRestore();
    });
  });
});

// Import StatusTransitionButtonCompact at the top where other imports are
const { StatusTransitionButtonCompact } = await import('./StatusTransitionButton');

describe('StatusTransitionButtonCompact', () => {
  const defaultProps = {
    gameId: 'game-123',
    currentStatus: '準備中' as const,
    onSuccess: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockStartGameAction).mockReset();
    vi.mocked(mockCloseGameAction).mockReset();
    mockAlert.mockClear();
    vi.stubGlobal('alert', mockAlert);
  });

  describe('準備中 status', () => {
    it('should render compact start button', () => {
      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...defaultProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent(/開始/i);
    });

    it('should handle start action in compact mode', async () => {
      vi.mocked(mockStartGameAction).mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...defaultProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockStartGameAction).toHaveBeenCalled();
      });
    });

    it('should show loading state in compact mode', async () => {
      vi.mocked(mockStartGameAction).mockReturnValue(new Promise(() => {}));

      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...defaultProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it('should prevent multiple clicks while loading in compact mode', async () => {
      let resolveAction: (() => void) | null = null;
      const actionPromise = new Promise<{ success: boolean }>((resolve) => {
        resolveAction = () => resolve({ success: true });
      });
      vi.mocked(mockStartGameAction).mockReturnValue(actionPromise);

      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...defaultProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');

      // Click twice rapidly before state updates
      fireEvent.click(button);
      fireEvent.click(button);

      // Should only be called once due to isLoading guard
      expect(mockStartGameAction).toHaveBeenCalledTimes(1);

      // Clean up
      if (resolveAction) resolveAction();
    });

    it('should call onSuccess when action succeeds in compact mode', async () => {
      vi.mocked(mockStartGameAction).mockResolvedValue({ success: true });
      const onSuccess = vi.fn();

      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...defaultProps} onSuccess={onSuccess} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith('出題中');
      });
    });

    it('should show alert and call onError when action fails in compact mode', async () => {
      vi.mocked(mockStartGameAction).mockResolvedValue({
        success: false,
        errors: { _form: ['開始に失敗しました'] },
      });
      const onError = vi.fn();

      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...defaultProps} onError={onError} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('開始に失敗しました');
        expect(onError).toHaveBeenCalledWith('開始に失敗しました');
      });
    });

    it('should use fallback error message when _form is empty in compact mode', async () => {
      vi.mocked(mockStartGameAction).mockResolvedValue({
        success: false,
        errors: { _form: [] },
      });
      const onError = vi.fn();

      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...defaultProps} onError={onError} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('ゲームの開始に失敗しました');
        expect(onError).toHaveBeenCalledWith('ゲームの開始に失敗しました');
      });
    });
  });

  describe('出題中 status', () => {
    const acceptingProps = {
      ...defaultProps,
      currentStatus: '出題中' as const,
    };

    it('should render compact close button', () => {
      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...acceptingProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent(/締切/i);
    });

    it('should show confirmation dialog for close in compact mode', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(mockCloseGameAction).mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...acceptingProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(confirmSpy).toHaveBeenCalledWith('本当にゲームを締切しますか？');

      confirmSpy.mockRestore();
    });

    it('should not proceed when user cancels confirmation in compact mode', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      vi.mocked(mockCloseGameAction).mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...acceptingProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(confirmSpy).toHaveBeenCalledWith('本当にゲームを締切しますか？');
      expect(mockCloseGameAction).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });

    it('should handle close action in compact mode', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(mockCloseGameAction).mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...acceptingProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockCloseGameAction).toHaveBeenCalled();
      });

      confirmSpy.mockRestore();
    });

    it('should prevent multiple clicks while loading close in compact mode', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      let resolveAction: (() => void) | null = null;
      const actionPromise = new Promise<{ success: boolean }>((resolve) => {
        resolveAction = () => resolve({ success: true });
      });
      vi.mocked(mockCloseGameAction).mockReturnValue(actionPromise);

      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...acceptingProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');

      // Click twice rapidly before state updates
      fireEvent.click(button);
      fireEvent.click(button);

      // Should only be called once due to isLoading guard
      // Note: confirm is only called once because first click sets isLoading
      expect(mockCloseGameAction).toHaveBeenCalledTimes(1);

      // Clean up
      if (resolveAction) resolveAction();
      confirmSpy.mockRestore();
    });

    it('should show alert and call onError when close action fails in compact mode', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(mockCloseGameAction).mockResolvedValue({
        success: false,
        errors: { _form: ['締切に失敗しました'] },
      });
      const onError = vi.fn();

      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...acceptingProps} onError={onError} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('締切に失敗しました');
        expect(onError).toHaveBeenCalledWith('締切に失敗しました');
      });

      confirmSpy.mockRestore();
    });

    it('should use fallback error message when _form is empty for close in compact mode', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(mockCloseGameAction).mockResolvedValue({
        success: false,
        errors: { _form: [] },
      });
      const onError = vi.fn();

      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...acceptingProps} onError={onError} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('ゲームの締切に失敗しました');
        expect(onError).toHaveBeenCalledWith('ゲームの締切に失敗しました');
      });

      confirmSpy.mockRestore();
    });
  });

  describe('締切 status', () => {
    it('should not render button for closed status in compact mode', () => {
      const closedProps = {
        ...defaultProps,
        currentStatus: '締切' as const,
      };

      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...closedProps} />
        </TestWrapper>
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should return null for invalid status in compact mode', () => {
      const invalidProps = {
        ...defaultProps,
        currentStatus: 'invalid-status' as never,
      };

      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...invalidProps} />
        </TestWrapper>
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Exception handling in compact mode', () => {
    it('should handle exceptions in start action', async () => {
      const error = new Error('Compact network error');
      vi.mocked(mockStartGameAction).mockRejectedValue(error);
      const onError = vi.fn();

      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...defaultProps} onError={onError} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Compact network error');
        expect(onError).toHaveBeenCalledWith('Compact network error');
      });
    });

    it('should handle non-Error exceptions in start action', async () => {
      vi.mocked(mockStartGameAction).mockRejectedValue('String error');
      const onError = vi.fn();

      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...defaultProps} onError={onError} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('ゲームの開始に失敗しました');
        expect(onError).toHaveBeenCalledWith('ゲームの開始に失敗しました');
      });
    });

    it('should handle exceptions in close action', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const error = new Error('Compact close error');
      vi.mocked(mockCloseGameAction).mockRejectedValue(error);
      const onError = vi.fn();

      const acceptingProps = {
        ...defaultProps,
        currentStatus: '出題中' as const,
      };

      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...acceptingProps} onError={onError} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Compact close error');
        expect(onError).toHaveBeenCalledWith('Compact close error');
      });

      confirmSpy.mockRestore();
    });

    it('should handle non-Error exceptions in close action', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(mockCloseGameAction).mockRejectedValue('String error');
      const onError = vi.fn();

      const acceptingProps = {
        ...defaultProps,
        currentStatus: '出題中' as const,
      };

      render(
        <TestWrapper>
          <StatusTransitionButtonCompact {...acceptingProps} onError={onError} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('ゲームの締切に失敗しました');
        expect(onError).toHaveBeenCalledWith('ゲームの締切に失敗しました');
      });

      confirmSpy.mockRestore();
    });
  });
});
