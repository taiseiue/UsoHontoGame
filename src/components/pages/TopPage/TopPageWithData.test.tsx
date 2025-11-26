// Component Tests: TopPageWithData
// Feature: 005-top-active-games (User Story 4)
// Tests for data fetching wrapper with loading and error states

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import type { ActiveGameListItem } from '@/types/game';
import { TopPageWithData } from './TopPageWithData';

// Mock the useActiveGames hook
vi.mock('./hooks/useActiveGames', () => ({
  useActiveGames: vi.fn(),
}));

// Mock the TopPage component
vi.mock('./index', () => ({
  TopPage: vi.fn(({ nickname, games }) => (
    <div data-testid="top-page">
      <div>Nickname: {nickname}</div>
      <div>Games count: {games.length}</div>
    </div>
  )),
}));

// Mock the EmptyState component
vi.mock('@/components/ui/EmptyState', () => ({
  EmptyState: vi.fn(({ message, subMessage, action }) => (
    <div data-testid="empty-state">
      <div>{message}</div>
      <div>{subMessage}</div>
      {action}
    </div>
  )),
}));

import { EmptyState } from '@/components/ui/EmptyState';
import { useActiveGames } from './hooks/useActiveGames';
import { TopPage } from './index';

const mockUseActiveGames = useActiveGames as Mock;
const mockTopPage = TopPage as Mock;
const mockEmptyState = EmptyState as Mock;

describe('TopPageWithData', () => {
  const defaultProps = {
    nickname: 'テストユーザー',
  };

  const mockGames: ActiveGameListItem[] = [
    {
      id: 'game-1',
      title: 'テストゲーム1',
      presenterNicknames: ['太郎', '花子'],
      totalPlayers: 5,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'game-2',
      title: 'テストゲーム2',
      presenterNicknames: ['次郎'],
      totalPlayers: 3,
      createdAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    beforeEach(() => {
      mockUseActiveGames.mockReturnValue({
        games: [],
        isLoading: true,
        isFetching: true,
        error: null,
        refetch: vi.fn(),
        hasMore: false,
        total: 0,
      });
    });

    it('should display loading skeleton', () => {
      render(<TopPageWithData {...defaultProps} />);

      expect(screen.getByText('ようこそ、テストユーザーさん!')).toBeInTheDocument();
      expect(screen.getByText('出題中のゲーム')).toBeInTheDocument();
    });

    it('should display three skeleton cards', () => {
      const { container } = render(<TopPageWithData {...defaultProps} />);

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(3);
    });

    it('should not render TopPage component during loading', () => {
      render(<TopPageWithData {...defaultProps} />);

      expect(mockTopPage).not.toHaveBeenCalled();
    });

    it('should not render EmptyState during loading', () => {
      render(<TopPageWithData {...defaultProps} />);

      expect(mockEmptyState).not.toHaveBeenCalled();
    });

    it('should show welcome message with nickname', () => {
      render(<TopPageWithData nickname="山田太郎" />);

      expect(screen.getByText('ようこそ、山田太郎さん!')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    const mockRefetch = vi.fn();

    beforeEach(() => {
      mockUseActiveGames.mockReturnValue({
        games: [],
        isLoading: false,
        isFetching: false,
        error: new Error('Network error'),
        refetch: mockRefetch,
        hasMore: false,
        total: 0,
      });
    });

    it('should display error message', () => {
      render(<TopPageWithData {...defaultProps} />);

      expect(screen.getByText('ゲームの読み込みに失敗しました')).toBeInTheDocument();
      expect(screen.getByText('もう一度お試しください')).toBeInTheDocument();
    });

    it('should render EmptyState component', () => {
      render(<TopPageWithData {...defaultProps} />);

      expect(mockEmptyState).toHaveBeenCalled();
      const callArgs = mockEmptyState.mock.calls[0][0];
      expect(callArgs.message).toBe('ゲームの読み込みに失敗しました');
      expect(callArgs.subMessage).toBe('もう一度お試しください');
      expect(callArgs.action).toBeTruthy(); // Action button exists
    });

    it('should display retry button', () => {
      render(<TopPageWithData {...defaultProps} />);

      expect(screen.getByRole('button', { name: '再試行' })).toBeInTheDocument();
    });

    it('should call refetch when retry button is clicked', async () => {
      const user = userEvent.setup();
      render(<TopPageWithData {...defaultProps} />);

      const retryButton = screen.getByRole('button', { name: '再試行' });
      await user.click(retryButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('should show welcome message with nickname', () => {
      render(<TopPageWithData nickname="佐藤花子" />);

      expect(screen.getByText('ようこそ、佐藤花子さん!')).toBeInTheDocument();
    });

    it('should not render TopPage component on error', () => {
      render(<TopPageWithData {...defaultProps} />);

      expect(mockTopPage).not.toHaveBeenCalled();
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      mockUseActiveGames.mockReturnValue({
        games: mockGames,
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
        hasMore: false,
        total: 2,
      });
    });

    it('should render TopPage component with games', () => {
      render(<TopPageWithData {...defaultProps} />);

      expect(mockTopPage).toHaveBeenCalled();
      const callArgs = mockTopPage.mock.calls[0][0];
      expect(callArgs.nickname).toBe('テストユーザー');
      expect(callArgs.games).toEqual(mockGames);
    });

    it('should display games data via TopPage', () => {
      render(<TopPageWithData {...defaultProps} />);

      expect(screen.getByTestId('top-page')).toBeInTheDocument();
      expect(screen.getByText('Nickname: テストユーザー')).toBeInTheDocument();
      expect(screen.getByText('Games count: 2')).toBeInTheDocument();
    });

    it('should not show loading skeleton', () => {
      const { container } = render(<TopPageWithData {...defaultProps} />);

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(0);
    });

    it('should not show error state', () => {
      render(<TopPageWithData {...defaultProps} />);

      expect(screen.queryByText('ゲームの読み込みに失敗しました')).not.toBeInTheDocument();
    });

    it('should not show background loading indicator when not fetching', () => {
      render(<TopPageWithData {...defaultProps} />);

      expect(screen.queryByText('更新中...')).not.toBeInTheDocument();
    });
  });

  describe('Background Refetch State', () => {
    beforeEach(() => {
      mockUseActiveGames.mockReturnValue({
        games: mockGames,
        isLoading: false,
        isFetching: true, // Background fetch in progress
        error: null,
        refetch: vi.fn(),
        hasMore: false,
        total: 2,
      });
    });

    it('should show background loading indicator', () => {
      render(<TopPageWithData {...defaultProps} />);

      expect(screen.getByText('更新中...')).toBeInTheDocument();
    });

    it('should display loading indicator with spinner', () => {
      const { container } = render(<TopPageWithData {...defaultProps} />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should position loading indicator at top-right', () => {
      const { container } = render(<TopPageWithData {...defaultProps} />);

      const indicator = container.querySelector('.fixed.top-4.right-4');
      expect(indicator).toBeInTheDocument();
    });

    it('should still render TopPage component during background fetch', () => {
      render(<TopPageWithData {...defaultProps} />);

      expect(mockTopPage).toHaveBeenCalled();
      expect(screen.getByTestId('top-page')).toBeInTheDocument();
    });

    it('should show loading indicator above content', () => {
      const { container } = render(<TopPageWithData {...defaultProps} />);

      const indicator = container.querySelector('.z-50');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveClass('fixed', 'top-4', 'right-4', 'z-50');
    });
  });

  describe('Empty Games State', () => {
    beforeEach(() => {
      mockUseActiveGames.mockReturnValue({
        games: [],
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
        hasMore: false,
        total: 0,
      });
    });

    it('should render TopPage with empty games array', () => {
      render(<TopPageWithData {...defaultProps} />);

      expect(mockTopPage).toHaveBeenCalled();
      const callArgs = mockTopPage.mock.calls[0][0];
      expect(callArgs.nickname).toBe('テストユーザー');
      expect(callArgs.games).toEqual([]);
    });

    it('should display zero games count', () => {
      render(<TopPageWithData {...defaultProps} />);

      expect(screen.getByText('Games count: 0')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    beforeEach(() => {
      mockUseActiveGames.mockReturnValue({
        games: mockGames,
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
        hasMore: false,
        total: 2,
      });
    });

    it('should pass nickname prop to TopPage', () => {
      render(<TopPageWithData nickname="カスタムユーザー" />);

      expect(mockTopPage).toHaveBeenCalled();
      const callArgs = mockTopPage.mock.calls[0][0];
      expect(callArgs.nickname).toBe('カスタムユーザー');
    });

    it('should handle Japanese characters in nickname', () => {
      render(<TopPageWithData nickname="山田　太郎" />);

      // Check via mock call since text may be split across elements
      expect(mockTopPage).toHaveBeenCalled();
      const callArgs = mockTopPage.mock.calls[0][0];
      expect(callArgs.nickname).toBe('山田　太郎');
    });

    it('should handle English characters in nickname', () => {
      render(<TopPageWithData nickname="John Doe" />);

      expect(screen.getByText('Nickname: John Doe')).toBeInTheDocument();
    });
  });

  describe('State Transitions', () => {
    it('should transition from loading to success', () => {
      mockUseActiveGames.mockReturnValue({
        games: [],
        isLoading: true,
        isFetching: true,
        error: null,
        refetch: vi.fn(),
        hasMore: false,
        total: 0,
      });

      const { rerender } = render(<TopPageWithData {...defaultProps} />);

      // Should show loading skeleton
      expect(screen.getByText('出題中のゲーム')).toBeInTheDocument();

      // Update to success state
      mockUseActiveGames.mockReturnValue({
        games: mockGames,
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
        hasMore: false,
        total: 2,
      });

      rerender(<TopPageWithData {...defaultProps} />);

      // Should show TopPage
      expect(screen.getByTestId('top-page')).toBeInTheDocument();
    });

    it('should transition from loading to error', () => {
      mockUseActiveGames.mockReturnValue({
        games: [],
        isLoading: true,
        isFetching: true,
        error: null,
        refetch: vi.fn(),
        hasMore: false,
        total: 0,
      });

      const { rerender } = render(<TopPageWithData {...defaultProps} />);

      // Should show loading skeleton
      expect(screen.getByText('出題中のゲーム')).toBeInTheDocument();

      // Update to error state
      mockUseActiveGames.mockReturnValue({
        games: [],
        isLoading: false,
        isFetching: false,
        error: new Error('Failed'),
        refetch: vi.fn(),
        hasMore: false,
        total: 0,
      });

      rerender(<TopPageWithData {...defaultProps} />);

      // Should show error state
      expect(screen.getByText('ゲームの読み込みに失敗しました')).toBeInTheDocument();
    });

    it('should transition from success to background refetch', () => {
      mockUseActiveGames.mockReturnValue({
        games: mockGames,
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
        hasMore: false,
        total: 2,
      });

      const { rerender } = render(<TopPageWithData {...defaultProps} />);

      // Should not show loading indicator
      expect(screen.queryByText('更新中...')).not.toBeInTheDocument();

      // Update to background fetching
      mockUseActiveGames.mockReturnValue({
        games: mockGames,
        isLoading: false,
        isFetching: true, // Background fetch
        error: null,
        refetch: vi.fn(),
        hasMore: false,
        total: 2,
      });

      rerender(<TopPageWithData {...defaultProps} />);

      // Should show loading indicator
      expect(screen.getByText('更新中...')).toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('should call useActiveGames hook', () => {
      mockUseActiveGames.mockReturnValue({
        games: [],
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
        hasMore: false,
        total: 0,
      });

      render(<TopPageWithData {...defaultProps} />);

      expect(mockUseActiveGames).toHaveBeenCalled();
    });

    it('should use default options for useActiveGames', () => {
      mockUseActiveGames.mockReturnValue({
        games: [],
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
        hasMore: false,
        total: 0,
      });

      render(<TopPageWithData {...defaultProps} />);

      // Hook is called without arguments (uses defaults)
      expect(mockUseActiveGames).toHaveBeenCalledWith();
    });
  });
});
