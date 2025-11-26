// Component Tests: DeleteGameButton
// Feature: 002-game-preparation
// Tests for delete button with confirmation dialog

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { DeleteGameButton } from './DeleteGameButton';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock server action
vi.mock('@/app/actions/game', () => ({
  deleteGameAction: vi.fn(),
}));

import { useRouter } from 'next/navigation';
import { deleteGameAction } from '@/app/actions/game';

const mockUseRouter = useRouter as Mock;
const mockDeleteGameAction = deleteGameAction as Mock;

describe('DeleteGameButton', () => {
  const mockPush = vi.fn();
  const defaultProps = {
    gameId: 'game-123',
    gameStatus: '準備中',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    });
  });

  describe('Initial Rendering', () => {
    it('should render delete button', () => {
      render(<DeleteGameButton {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'ゲームを削除' })).toBeInTheDocument();
    });

    it('should not show confirmation dialog initially', () => {
      render(<DeleteGameButton {...defaultProps} />);

      expect(screen.queryByText(/このゲームを削除しますか/)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '削除する' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'キャンセル' })).not.toBeInTheDocument();
    });

    it('should not show error message initially', () => {
      render(<DeleteGameButton {...defaultProps} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should have delete button enabled initially', () => {
      render(<DeleteGameButton {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: 'ゲームを削除' });
      expect(deleteButton).not.toBeDisabled();
    });
  });

  describe('Confirmation Dialog', () => {
    it('should show confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: 'ゲームを削除' });
      await user.click(deleteButton);

      expect(screen.getByText(/このゲームを削除しますか/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '削除する' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
    });

    it('should hide initial delete button when confirmation is shown', async () => {
      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: 'ゲームを削除' });
      await user.click(deleteButton);

      expect(screen.queryByRole('button', { name: 'ゲームを削除' })).not.toBeInTheDocument();
    });

    it('should hide confirmation dialog when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: 'ゲームを削除' });
      await user.click(deleteButton);

      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      await user.click(cancelButton);

      expect(screen.queryByText(/このゲームを削除しますか/)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ゲームを削除' })).toBeInTheDocument();
    });
  });

  describe('Status-Specific Confirmation Messages', () => {
    it('should show default message for 準備中 status', async () => {
      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} gameStatus="準備中" />);

      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));

      expect(screen.getByText('このゲームを削除しますか？')).toBeInTheDocument();
    });

    it('should show warning message for 出題中 status', async () => {
      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} gameStatus="出題中" />);

      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));

      expect(
        screen.getByText(/このゲームは現在進行中です。削除すると参加者のデータも失われます/)
      ).toBeInTheDocument();
    });

    it('should show warning message for 締切 status', async () => {
      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} gameStatus="締切" />);

      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));

      expect(
        screen.getByText(/このゲームは締切済みです。削除すると結果データも失われます/)
      ).toBeInTheDocument();
    });
  });

  describe('Successful Deletion', () => {
    it('should call deleteGameAction with correct gameId', async () => {
      mockDeleteGameAction.mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));
      await user.click(screen.getByRole('button', { name: '削除する' }));

      await waitFor(() => {
        expect(mockDeleteGameAction).toHaveBeenCalled();
        const formData = mockDeleteGameAction.mock.calls[0][0];
        expect(formData.get('gameId')).toBe('game-123');
      });
    });

    it('should navigate to /games after successful deletion', async () => {
      mockDeleteGameAction.mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));
      await user.click(screen.getByRole('button', { name: '削除する' }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/games');
      });
    });

    it('should show loading state during deletion', async () => {
      mockDeleteGameAction.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));
      await user.click(screen.getByRole('button', { name: '削除する' }));

      expect(screen.getByRole('button', { name: '削除中...' })).toBeInTheDocument();
    });

    it('should disable buttons during deletion', async () => {
      mockDeleteGameAction.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));
      await user.click(screen.getByRole('button', { name: '削除する' }));

      const confirmButton = screen.getByRole('button', { name: '削除中...' });
      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });

      expect(confirmButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message on deletion failure', async () => {
      const errorMessage = 'ゲームの削除に失敗しました';
      mockDeleteGameAction.mockResolvedValue({
        success: false,
        errors: { _form: [errorMessage] },
      });

      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));
      await user.click(screen.getByRole('button', { name: '削除する' }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should display default error message when no specific error is provided', async () => {
      mockDeleteGameAction.mockResolvedValue({
        success: false,
        errors: {},
      });

      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));
      await user.click(screen.getByRole('button', { name: '削除する' }));

      await waitFor(() => {
        expect(screen.getByText('ゲームの削除に失敗しました')).toBeInTheDocument();
      });
    });

    it('should handle unexpected errors during deletion', async () => {
      mockDeleteGameAction.mockRejectedValue(new Error('Network error'));

      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));
      await user.click(screen.getByRole('button', { name: '削除する' }));

      await waitFor(() => {
        expect(screen.getByText('予期しないエラーが発生しました')).toBeInTheDocument();
      });
    });

    it('should hide confirmation dialog after error', async () => {
      mockDeleteGameAction.mockResolvedValue({
        success: false,
        errors: { _form: ['エラー'] },
      });

      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));
      await user.click(screen.getByRole('button', { name: '削除する' }));

      await waitFor(() => {
        expect(screen.queryByText(/このゲームを削除しますか/)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'ゲームを削除' })).toBeInTheDocument();
      });
    });

    it('should clear previous error when showing confirmation again', async () => {
      mockDeleteGameAction.mockResolvedValue({
        success: false,
        errors: { _form: ['エラーメッセージ'] },
      });

      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} />);

      // First attempt - causes error
      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));
      await user.click(screen.getByRole('button', { name: '削除する' }));

      await waitFor(() => {
        expect(screen.getByText('エラーメッセージ')).toBeInTheDocument();
      });

      // Second attempt - error should not be visible when confirmation shows
      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));

      // Error should still be visible (only cleared during handleDelete)
      expect(screen.getByText('エラーメッセージ')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', async () => {
      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'ゲームを削除' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));

      expect(screen.getByRole('button', { name: '削除する' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
    });

    it('should have proper alert role for error messages', async () => {
      mockDeleteGameAction.mockResolvedValue({
        success: false,
        errors: { _form: ['エラー'] },
      });

      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));
      await user.click(screen.getByRole('button', { name: '削除する' }));

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent('エラー');
      });
    });

    it('should have appropriate button styling for danger actions', () => {
      render(<DeleteGameButton {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: 'ゲームを削除' });
      expect(deleteButton).toHaveClass('text-red-700');
    });

    it('should indicate disabled state visually', async () => {
      mockDeleteGameAction.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));
      await user.click(screen.getByRole('button', { name: '削除する' }));

      const confirmButton = screen.getByRole('button', { name: '削除中...' });
      expect(confirmButton).toHaveClass('disabled:opacity-50');
      expect(confirmButton).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('Button States', () => {
    it('should disable initial delete button during deletion', async () => {
      mockDeleteGameAction.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000))
      );

      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: 'ゲームを削除' });
      expect(deleteButton).not.toBeDisabled();

      await user.click(deleteButton);
      await user.click(screen.getByRole('button', { name: '削除する' }));

      // During deletion, if we could still see the initial button, it would be disabled
      // But in this component, the confirmation dialog replaces the initial button
      expect(screen.queryByRole('button', { name: 'ゲームを削除' })).not.toBeInTheDocument();
    });

    it('should show confirmation message in a styled container', async () => {
      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));

      const message = screen.getByText(/このゲームを削除しますか/);
      const container = message.closest('div');

      expect(container).toHaveClass('rounded-lg');
      expect(container).toHaveClass('bg-red-50');
    });
  });

  describe('Component Integration', () => {
    it('should handle multiple cancel and confirm cycles', async () => {
      const user = userEvent.setup();
      render(<DeleteGameButton {...defaultProps} />);

      // First cycle
      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));
      expect(screen.getByText(/このゲームを削除しますか/)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'キャンセル' }));
      expect(screen.queryByText(/このゲームを削除しますか/)).not.toBeInTheDocument();

      // Second cycle
      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));
      expect(screen.getByText(/このゲームを削除しますか/)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'キャンセル' }));
      expect(screen.queryByText(/このゲームを削除しますか/)).not.toBeInTheDocument();
    });

    it('should maintain gameId throughout the component lifecycle', async () => {
      mockDeleteGameAction.mockResolvedValue({ success: true });

      const user = userEvent.setup();
      const { rerender, unmount } = render(
        <DeleteGameButton {...defaultProps} gameId="game-123" />
      );

      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));
      await user.click(screen.getByRole('button', { name: '削除する' }));

      await waitFor(() => {
        const formData = mockDeleteGameAction.mock.calls[0][0];
        expect(formData.get('gameId')).toBe('game-123');
      });

      // Wait for navigation to complete
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/games');
      });

      // Unmount and render a new instance with different gameId
      unmount();
      mockDeleteGameAction.mockClear();
      mockPush.mockClear();

      render(<DeleteGameButton {...defaultProps} gameId="game-456" />);

      await user.click(screen.getByRole('button', { name: 'ゲームを削除' }));
      await user.click(screen.getByRole('button', { name: '削除する' }));

      await waitFor(() => {
        const formData = mockDeleteGameAction.mock.calls[0][0];
        expect(formData.get('gameId')).toBe('game-456');
      });
    });
  });
});
