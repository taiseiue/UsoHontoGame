// Component Tests: GameManagementCard
// Feature: 002-game-preparation
// Tests for game card with status management

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import type { GameManagementDto } from '@/server/application/dto/GameDto';
import { GameManagementCard } from './GameManagementCard';

// Mock server actions
vi.mock('@/app/actions/game', () => ({
  startAcceptingAction: vi.fn(),
  closeGameAction: vi.fn(),
}));

// Mock Badge component
vi.mock('@/components/ui/Badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant: string }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

import { closeGameAction, startAcceptingAction } from '@/app/actions/game';

const mockStartAcceptingAction = startAcceptingAction as Mock;
const mockCloseGameAction = closeGameAction as Mock;

// Mock window.confirm
const originalConfirm = window.confirm;

describe('GameManagementCard', () => {
  const mockOnStatusChange = vi.fn();

  const baseGame: GameManagementDto = {
    id: 'game-123',
    name: 'テストゲーム',
    status: '準備中',
    currentPlayers: 3,
    maxPlayers: 10,
    availableSlots: 7,
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true); // Auto-confirm by default
  });

  afterEach(() => {
    window.confirm = originalConfirm;
  });

  describe('Rendering', () => {
    it('should render game name', () => {
      render(<GameManagementCard game={baseGame} />);

      expect(screen.getByText('テストゲーム')).toBeInTheDocument();
    });

    it('should render status badge', () => {
      render(<GameManagementCard game={baseGame} />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('準備中');
    });

    it('should render player count', () => {
      render(<GameManagementCard game={baseGame} />);

      expect(screen.getByText('3/10')).toBeInTheDocument();
    });

    it('should render available slots', () => {
      render(<GameManagementCard game={baseGame} />);

      expect(screen.getByText('7人')).toBeInTheDocument();
    });

    it('should not show error message initially', () => {
      render(<GameManagementCard game={baseGame} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Status Badge Variants', () => {
    it('should use warning variant for 準備中 status', () => {
      render(<GameManagementCard game={{ ...baseGame, status: '準備中' }} />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('data-variant', 'warning');
    });

    it('should use success variant for 出題中 status', () => {
      render(<GameManagementCard game={{ ...baseGame, status: '出題中' }} />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('data-variant', 'success');
    });

    it('should use default variant for 締切 status', () => {
      render(<GameManagementCard game={{ ...baseGame, status: '締切' }} />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('data-variant', 'default');
    });
  });

  describe('Status: 準備中', () => {
    it('should show 出題開始 button', () => {
      render(<GameManagementCard game={baseGame} />);

      expect(screen.getByRole('button', { name: '出題開始' })).toBeInTheDocument();
    });

    it('should show プレゼンター管理 link', () => {
      render(<GameManagementCard game={baseGame} />);

      const link = screen.getByRole('link', { name: 'プレゼンター管理' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/games/game-123/presenters');
    });

    it('should not show 締切 button', () => {
      render(<GameManagementCard game={baseGame} />);

      expect(screen.queryByRole('button', { name: '締切' })).not.toBeInTheDocument();
    });
  });

  describe('Status: 出題中', () => {
    const acceptingGame = { ...baseGame, status: '出題中' };

    it('should show 締切 button', () => {
      render(<GameManagementCard game={acceptingGame} />);

      expect(screen.getByRole('button', { name: '締切' })).toBeInTheDocument();
    });

    it('should not show 出題開始 button', () => {
      render(<GameManagementCard game={acceptingGame} />);

      expect(screen.queryByRole('button', { name: '出題開始' })).not.toBeInTheDocument();
    });

    it('should not show プレゼンター管理 link', () => {
      render(<GameManagementCard game={acceptingGame} />);

      expect(screen.queryByRole('link', { name: 'プレゼンター管理' })).not.toBeInTheDocument();
    });
  });

  describe('Status: 締切', () => {
    const closedGame = { ...baseGame, status: '締切' };

    it('should show closed message', () => {
      render(<GameManagementCard game={closedGame} />);

      expect(screen.getByText('このゲームは締め切られました')).toBeInTheDocument();
    });

    it('should not show any action buttons', () => {
      render(<GameManagementCard game={closedGame} />);

      expect(screen.queryByRole('button', { name: '出題開始' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '締切' })).not.toBeInTheDocument();
    });

    it('should not show プレゼンター管理 link', () => {
      render(<GameManagementCard game={closedGame} />);

      expect(screen.queryByRole('link', { name: 'プレゼンター管理' })).not.toBeInTheDocument();
    });
  });

  describe('Start Accepting - Confirmation', () => {
    it('should show confirmation dialog when 出題開始 is clicked', async () => {
      const mockConfirm = vi.fn(() => false);
      window.confirm = mockConfirm;

      const user = userEvent.setup();
      render(<GameManagementCard game={baseGame} />);

      await user.click(screen.getByRole('button', { name: '出題開始' }));

      expect(mockConfirm).toHaveBeenCalledWith('ゲームを開始してもよろしいですか？');
    });

    it('should not proceed if confirmation is cancelled', async () => {
      window.confirm = vi.fn(() => false);
      mockStartAcceptingAction.mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<GameManagementCard game={baseGame} />);

      await user.click(screen.getByRole('button', { name: '出題開始' }));

      expect(mockStartAcceptingAction).not.toHaveBeenCalled();
    });
  });

  describe('Start Accepting - Success', () => {
    it('should call startAcceptingAction with correct gameId', async () => {
      mockStartAcceptingAction.mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<GameManagementCard game={baseGame} />);

      await user.click(screen.getByRole('button', { name: '出題開始' }));

      await waitFor(() => {
        expect(mockStartAcceptingAction).toHaveBeenCalled();
        const formData = mockStartAcceptingAction.mock.calls[0][0];
        expect(formData.get('gameId')).toBe('game-123');
      });
    });

    it('should call onStatusChange callback on success', async () => {
      mockStartAcceptingAction.mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<GameManagementCard game={baseGame} onStatusChange={mockOnStatusChange} />);

      await user.click(screen.getByRole('button', { name: '出題開始' }));

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalled();
      });
    });

    it('should show loading state during transition', async () => {
      mockStartAcceptingAction.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const user = userEvent.setup();
      render(<GameManagementCard game={baseGame} />);

      await user.click(screen.getByRole('button', { name: '出題開始' }));

      expect(screen.getByRole('button', { name: '処理中...' })).toBeInTheDocument();
    });

    it('should disable button during transition', async () => {
      mockStartAcceptingAction.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const user = userEvent.setup();
      render(<GameManagementCard game={baseGame} />);

      await user.click(screen.getByRole('button', { name: '出題開始' }));

      const button = screen.getByRole('button', { name: '処理中...' });
      expect(button).toBeDisabled();
    });
  });

  describe('Start Accepting - Error', () => {
    it('should display error message on failure', async () => {
      const errorMessage = 'ステータスの変更に失敗しました';
      mockStartAcceptingAction.mockResolvedValue({
        success: false,
        errors: { _form: [errorMessage] },
      });

      const user = userEvent.setup();
      render(<GameManagementCard game={baseGame} />);

      await user.click(screen.getByRole('button', { name: '出題開始' }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should display default error message when no specific error', async () => {
      mockStartAcceptingAction.mockResolvedValue({
        success: false,
        errors: {},
      });

      const user = userEvent.setup();
      render(<GameManagementCard game={baseGame} />);

      await user.click(screen.getByRole('button', { name: '出題開始' }));

      await waitFor(() => {
        expect(screen.getByText('ステータスの変更に失敗しました')).toBeInTheDocument();
      });
    });

    it('should handle exception during start accepting', async () => {
      mockStartAcceptingAction.mockRejectedValue(new Error('Network error'));

      const user = userEvent.setup();
      render(<GameManagementCard game={baseGame} />);

      await user.click(screen.getByRole('button', { name: '出題開始' }));

      await waitFor(() => {
        expect(screen.getByText('ステータスの変更に失敗しました')).toBeInTheDocument();
      });
    });

    it('should not call onStatusChange on failure', async () => {
      mockStartAcceptingAction.mockResolvedValue({
        success: false,
        errors: { _form: ['エラー'] },
      });

      const user = userEvent.setup();
      render(<GameManagementCard game={baseGame} onStatusChange={mockOnStatusChange} />);

      await user.click(screen.getByRole('button', { name: '出題開始' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(mockOnStatusChange).not.toHaveBeenCalled();
    });
  });

  describe('Close Game - Confirmation', () => {
    const acceptingGame = { ...baseGame, status: '出題中' };

    it('should show confirmation dialog when 締切 is clicked', async () => {
      const mockConfirm = vi.fn(() => false);
      window.confirm = mockConfirm;

      const user = userEvent.setup();
      render(<GameManagementCard game={acceptingGame} />);

      await user.click(screen.getByRole('button', { name: '締切' }));

      expect(mockConfirm).toHaveBeenCalledWith('ゲームを締め切ってもよろしいですか？');
    });

    it('should not proceed if confirmation is cancelled', async () => {
      window.confirm = vi.fn(() => false);
      mockCloseGameAction.mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<GameManagementCard game={acceptingGame} />);

      await user.click(screen.getByRole('button', { name: '締切' }));

      expect(mockCloseGameAction).not.toHaveBeenCalled();
    });
  });

  describe('Close Game - Success', () => {
    const acceptingGame = { ...baseGame, status: '出題中' };

    it('should call closeGameAction with correct gameId', async () => {
      mockCloseGameAction.mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<GameManagementCard game={acceptingGame} />);

      await user.click(screen.getByRole('button', { name: '締切' }));

      await waitFor(() => {
        expect(mockCloseGameAction).toHaveBeenCalled();
        const formData = mockCloseGameAction.mock.calls[0][0];
        expect(formData.get('gameId')).toBe('game-123');
      });
    });

    it('should call onStatusChange callback on success', async () => {
      mockCloseGameAction.mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<GameManagementCard game={acceptingGame} onStatusChange={mockOnStatusChange} />);

      await user.click(screen.getByRole('button', { name: '締切' }));

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalled();
      });
    });

    it('should show loading state during close', async () => {
      mockCloseGameAction.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const user = userEvent.setup();
      render(<GameManagementCard game={acceptingGame} />);

      await user.click(screen.getByRole('button', { name: '締切' }));

      expect(screen.getByRole('button', { name: '処理中...' })).toBeInTheDocument();
    });

    it('should disable button during close', async () => {
      mockCloseGameAction.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const user = userEvent.setup();
      render(<GameManagementCard game={acceptingGame} />);

      await user.click(screen.getByRole('button', { name: '締切' }));

      const button = screen.getByRole('button', { name: '処理中...' });
      expect(button).toBeDisabled();
    });
  });

  describe('Close Game - Error', () => {
    const acceptingGame = { ...baseGame, status: '出題中' };

    it('should display error message on close failure', async () => {
      const errorMessage = '締切に失敗しました';
      mockCloseGameAction.mockResolvedValue({
        success: false,
        errors: { _form: [errorMessage] },
      });

      const user = userEvent.setup();
      render(<GameManagementCard game={acceptingGame} />);

      await user.click(screen.getByRole('button', { name: '締切' }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should display default error message when no specific error on close', async () => {
      mockCloseGameAction.mockResolvedValue({
        success: false,
        errors: {},
      });

      const user = userEvent.setup();
      render(<GameManagementCard game={acceptingGame} />);

      await user.click(screen.getByRole('button', { name: '締切' }));

      await waitFor(() => {
        expect(screen.getByText('締切に失敗しました')).toBeInTheDocument();
      });
    });

    it('should handle exception during close', async () => {
      mockCloseGameAction.mockRejectedValue(new Error('Network error'));

      const user = userEvent.setup();
      render(<GameManagementCard game={acceptingGame} />);

      await user.click(screen.getByRole('button', { name: '締切' }));

      await waitFor(() => {
        expect(screen.getByText('締切に失敗しました')).toBeInTheDocument();
      });
    });

    it('should not call onStatusChange on close failure', async () => {
      mockCloseGameAction.mockResolvedValue({
        success: false,
        errors: { _form: ['エラー'] },
      });

      const user = userEvent.setup();
      render(<GameManagementCard game={acceptingGame} onStatusChange={mockOnStatusChange} />);

      await user.click(screen.getByRole('button', { name: '締切' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(mockOnStatusChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      render(<GameManagementCard game={baseGame} />);

      expect(screen.getByRole('button', { name: '出題開始' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'プレゼンター管理' })).toBeInTheDocument();
    });

    it('should have proper alert role for error messages', async () => {
      mockStartAcceptingAction.mockResolvedValue({
        success: false,
        errors: { _form: ['エラー'] },
      });

      const user = userEvent.setup();
      render(<GameManagementCard game={baseGame} />);

      await user.click(screen.getByRole('button', { name: '出題開始' }));

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent('エラー');
      });
    });

    it('should have descriptive button text', () => {
      render(<GameManagementCard game={baseGame} />);

      expect(screen.getByRole('button', { name: '出題開始' })).toBeInTheDocument();
    });

    it('should indicate disabled state visually', async () => {
      mockStartAcceptingAction.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const user = userEvent.setup();
      render(<GameManagementCard game={baseGame} />);

      await user.click(screen.getByRole('button', { name: '出題開始' }));

      const button = screen.getByRole('button', { name: '処理中...' });
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('Optional Callback', () => {
    it('should work without onStatusChange callback', async () => {
      mockStartAcceptingAction.mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<GameManagementCard game={baseGame} />);

      await user.click(screen.getByRole('button', { name: '出題開始' }));

      await waitFor(() => {
        expect(mockStartAcceptingAction).toHaveBeenCalled();
      });

      // Should not throw error when callback is undefined
    });
  });
});
