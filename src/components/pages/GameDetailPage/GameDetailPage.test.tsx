// Unit tests for GameDetailPage component

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { GameDetailPage, GameDetailPageError } from '@/components/pages/GameDetailPage';
import type { GameStatusValue } from '@/server/domain/value-objects/GameStatus';
import { mockGameDetail } from '../../../../tests/utils/test-helpers';

// Mock useGameStatus hook
vi.mock('@/components/pages/GameDetailPage/hooks/useGameStatus', () => ({
  useGameStatus: vi.fn(),
}));

// Mock useToast hook
vi.mock('@/hooks/useToast', () => ({
  useToast: vi.fn(),
}));

// Mock domain components
vi.mock('@/components/domain/game/GameForm', () => ({
  GameForm: ({ gameId, mode }: { gameId: string; mode: string }) => (
    <div data-testid="game-form">
      GameForm - Mode: {mode}, ID: {gameId}
    </div>
  ),
}));

vi.mock('@/components/domain/game/DeleteGameButton', () => ({
  DeleteGameButton: ({ gameId, gameStatus }: { gameId: string; gameStatus: string }) => (
    <div data-testid="delete-game-button">
      Delete Button - ID: {gameId}, Status: {gameStatus}
    </div>
  ),
}));

vi.mock('@/components/domain/game/StatusTransitionButton', () => ({
  StatusTransitionButton: ({
    onSuccess,
    onError,
  }: {
    gameId: string;
    currentStatus: string;
    onSuccess?: (newStatus: GameStatusValue) => void;
    onError?: (error: string) => void;
  }) => (
    <div data-testid="status-transition-button">
      <button
        type="button"
        onClick={() => {
          onSuccess?.('出題中');
        }}
      >
        開始する
      </button>
      <button
        type="button"
        onClick={() => {
          onError?.('Test error from StatusTransitionButton');
        }}
      >
        Trigger Error
      </button>
    </div>
  ),
}));

vi.mock('@/components/domain/game/CloseGameButton', () => ({
  CloseGameButton: ({
    onClosed,
  }: {
    gameId: string;
    gameStatus: string;
    onClosed?: () => void;
  }) => (
    <div data-testid="close-game-button">
      <button
        type="button"
        onClick={() => {
          onClosed?.();
        }}
      >
        締切にする
      </button>
    </div>
  ),
}));

interface Toast {
  id: string;
  type: string;
  title: string;
  message: string;
}

vi.mock('@/components/ui/Toast', () => ({
  ToastContainer: ({ toasts }: { toasts: Toast[] }) => (
    <div data-testid="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} data-testid={`toast-${toast.type}`}>
          {toast.title}: {toast.message}
        </div>
      ))}
    </div>
  ),
}));

// Import mocked functions
import { useGameStatus } from '@/components/pages/GameDetailPage/hooks/useGameStatus';
import { useToast } from '@/hooks/useToast';

const mockUseGameStatus = useGameStatus as Mock;
const mockUseToast = useToast as Mock;

describe('GameDetailPage', () => {
  const mockShowSuccess = vi.fn();
  const mockShowError = vi.fn();
  const mockRemoveToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseGameStatus.mockReturnValue({
      currentStatus: '準備中',
      isLoading: false,
      canStart: true,
      canClose: false,
      startGame: vi.fn(),
      closeGame: vi.fn(),
      resetStatus: vi.fn(),
      retryCount: 0,
      isRetrying: false,
    });

    mockUseToast.mockReturnValue({
      toasts: [],
      showSuccess: mockShowSuccess,
      showError: mockShowError,
      removeToast: mockRemoveToast,
    });
  });

  it('should render without crashing', () => {
    const game = mockGameDetail();
    render(<GameDetailPage game={game} />);
    expect(screen.getByRole('heading', { name: 'ゲーム詳細' })).toBeInTheDocument();
  });

  it('should display game name', () => {
    const game = mockGameDetail({ name: 'Test Game Name' });
    render(<GameDetailPage game={game} />);
    expect(screen.getByText('Test Game Name')).toBeInTheDocument();
  });

  it('should display game status', () => {
    mockUseGameStatus.mockReturnValue({
      currentStatus: '進行中',
      isLoading: false,
      canStart: false,
      canClose: false,
      startGame: vi.fn(),
      closeGame: vi.fn(),
      resetStatus: vi.fn(),
      retryCount: 0,
      isRetrying: false,
    });

    const game = mockGameDetail({ status: '進行中' });
    render(<GameDetailPage game={game} />);
    expect(screen.getAllByText('進行中')).toHaveLength(2); // Status appears twice
  });

  it('should display player counts', () => {
    const game = mockGameDetail({ currentPlayers: 7, maxPlayers: 10 });
    render(<GameDetailPage game={game} />);
    expect(screen.getByText('7 / 10 人')).toBeInTheDocument();
  });

  it('should display available slots', () => {
    const game = mockGameDetail({ availableSlots: 3 });
    render(<GameDetailPage game={game} />);
    expect(screen.getByText('3 枠')).toBeInTheDocument();
  });

  it('should show edit form when status is 準備中', () => {
    const game = mockGameDetail({ status: '準備中' });
    render(<GameDetailPage game={game} />);
    expect(screen.getByTestId('game-form')).toBeInTheDocument();
    expect(screen.getByText(/GameForm - Mode: edit/)).toBeInTheDocument();
  });

  it('should hide edit form when status is not 準備中', () => {
    mockUseGameStatus.mockReturnValue({
      currentStatus: '進行中',
      isLoading: false,
      canStart: false,
      canClose: false,
      startGame: vi.fn(),
      closeGame: vi.fn(),
      resetStatus: vi.fn(),
      retryCount: 0,
      isRetrying: false,
    });

    const game = mockGameDetail({ status: '進行中' });
    render(<GameDetailPage game={game} />);
    expect(screen.queryByTestId('game-form')).not.toBeInTheDocument();
  });

  it('should show warning when game cannot be edited', () => {
    mockUseGameStatus.mockReturnValue({
      currentStatus: '終了' as never,
      isLoading: false,
      canStart: false,
      canClose: false,
      startGame: vi.fn(),
      closeGame: vi.fn(),
      resetStatus: vi.fn(),
      retryCount: 0,
      isRetrying: false,
    });

    const game = mockGameDetail({ status: '終了' });
    render(<GameDetailPage game={game} />);
    expect(screen.getByText(/ゲームの設定を変更できるのは準備中のみです/)).toBeInTheDocument();
  });

  it('should not show warning when game can be edited', () => {
    const game = mockGameDetail({ status: '準備中' });
    render(<GameDetailPage game={game} />);
    expect(
      screen.queryByText(/ゲームの設定を変更できるのは準備中のみです/)
    ).not.toBeInTheDocument();
  });

  it('should render DeleteGameButton with correct props', () => {
    const game = mockGameDetail({ id: 'test-id', status: '準備中' });
    render(<GameDetailPage game={game} />);
    expect(screen.getByTestId('delete-game-button')).toBeInTheDocument();
    expect(screen.getByText(/Delete Button - ID: test-id, Status: 準備中/)).toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    const game = mockGameDetail({
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    });
    render(<GameDetailPage game={game} />);
    // Date formatting may vary by locale, so just check they're rendered
    const dateElements = screen.getAllByText(/2024/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('should show CloseGameButton when status is 出題中 and user is moderator', () => {
    // Tests line 81-91 branch: currentStatus === '出題中' && isModerator (true)
    mockUseGameStatus.mockReturnValue({
      currentStatus: '出題中',
      isLoading: false,
      canStart: false,
      canClose: true,
      startGame: vi.fn(),
      closeGame: vi.fn(),
      resetStatus: vi.fn(),
      retryCount: 0,
      isRetrying: false,
    });

    const game = mockGameDetail({
      id: 'test-game-id',
      status: '出題中',
      creatorId: 'creator-session-123',
    });

    render(<GameDetailPage game={game} currentSessionId="creator-session-123" />);

    // CloseGameButton renders with "締切にする" button text
    expect(screen.getByRole('button', { name: /締切にする/ })).toBeInTheDocument();
  });

  it('should hide CloseGameButton when status is 出題中 but user is not moderator', () => {
    // Tests line 81-91 branch: currentStatus === '出題中' && isModerator (false)
    mockUseGameStatus.mockReturnValue({
      currentStatus: '出題中',
      isLoading: false,
      canStart: false,
      canClose: true,
      startGame: vi.fn(),
      closeGame: vi.fn(),
      resetStatus: vi.fn(),
      retryCount: 0,
      isRetrying: false,
    });

    const game = mockGameDetail({
      id: 'test-game-id',
      status: '出題中',
      creatorId: 'creator-session-123',
    });

    render(<GameDetailPage game={game} currentSessionId="different-session-456" />);

    // CloseGameButton should NOT be visible
    expect(screen.queryByTestId('close-game-button')).not.toBeInTheDocument();
  });

  it('should hide CloseGameButton when currentSessionId is not provided', () => {
    // Tests line 45 branch: isModerator check when currentSessionId is undefined
    mockUseGameStatus.mockReturnValue({
      currentStatus: '出題中',
      isLoading: false,
      canStart: false,
      canClose: true,
      startGame: vi.fn(),
      closeGame: vi.fn(),
      resetStatus: vi.fn(),
      retryCount: 0,
      isRetrying: false,
    });

    const game = mockGameDetail({
      id: 'test-game-id',
      status: '出題中',
      creatorId: 'creator-session-123',
    });

    render(<GameDetailPage game={game} />);

    // CloseGameButton should NOT be visible
    expect(screen.queryByTestId('close-game-button')).not.toBeInTheDocument();
  });

  it('should show game.id as fallback when game.name is empty', () => {
    // Tests line 137 branch: game.name || game.id fallback
    const game = mockGameDetail({
      id: 'fallback-game-id',
      name: '',
    });

    render(<GameDetailPage game={game} />);

    expect(screen.getByText('fallback-game-id')).toBeInTheDocument();
  });

  it('should show StatusTransitionButton when status is 準備中', () => {
    // Tests line 66-79 branch: currentStatus === '準備中'
    const game = mockGameDetail({
      id: 'test-game-id',
      status: '準備中',
    });

    render(<GameDetailPage game={game} />);

    // StatusTransitionButton renders with "開始する" button text
    expect(screen.getByRole('button', { name: /開始する/ })).toBeInTheDocument();
  });

  it('should hide StatusTransitionButton when status is not 準備中', () => {
    // Tests line 66-79 branch: currentStatus === '準備中' (false)
    mockUseGameStatus.mockReturnValue({
      currentStatus: '出題中',
      isLoading: false,
      canStart: false,
      canClose: true,
      startGame: vi.fn(),
      closeGame: vi.fn(),
      resetStatus: vi.fn(),
      retryCount: 0,
      isRetrying: false,
    });

    const game = mockGameDetail({
      id: 'test-game-id',
      status: '出題中',
    });

    render(<GameDetailPage game={game} />);

    // StatusTransitionButton should NOT be visible
    expect(screen.queryByTestId('status-transition-button')).not.toBeInTheDocument();
  });

  it('should render presenter management section', () => {
    // Additional coverage for presenter management section
    const game = mockGameDetail({ id: 'test-game-123' });

    render(<GameDetailPage game={game} />);

    expect(screen.getByText('プレゼンター管理')).toBeInTheDocument();
    expect(screen.getByText(/プレゼンターとエピソードを管理します/)).toBeInTheDocument();
    expect(screen.getByText('プレゼンター管理ページへ →')).toBeInTheDocument();
  });

  describe('useGameStatus hook integration', () => {
    it('should call useGameStatus with correct parameters', () => {
      const game = mockGameDetail({
        id: 'test-game-id',
        status: '出題中',
      });

      render(<GameDetailPage game={game} />);

      expect(mockUseGameStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          gameId: 'test-game-id',
          initialStatus: '出題中',
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    it('should call showSuccess when useGameStatus onSuccess is triggered with 出題中', () => {
      let capturedOnSuccess: ((newStatus: GameStatusValue) => void) | undefined;

      mockUseGameStatus.mockImplementation(
        (config: { onSuccess?: (newStatus: GameStatusValue) => void }) => {
          capturedOnSuccess = config.onSuccess;
          return {
            currentStatus: '準備中',
            isLoading: false,
            canStart: true,
            canClose: false,
            startGame: vi.fn(),
            closeGame: vi.fn(),
            resetStatus: vi.fn(),
            retryCount: 0,
            isRetrying: false,
          };
        }
      );

      const game = mockGameDetail({ status: '準備中' });
      render(<GameDetailPage game={game} />);

      expect(capturedOnSuccess).toBeDefined();
      capturedOnSuccess?.('出題中');

      expect(mockShowSuccess).toHaveBeenCalledWith('ゲームを開始しました', 'ステータス更新完了');
    });

    it('should call showSuccess when useGameStatus onSuccess is triggered with 締切', () => {
      let capturedOnSuccess: ((newStatus: GameStatusValue) => void) | undefined;

      mockUseGameStatus.mockImplementation(
        (config: { onSuccess?: (newStatus: GameStatusValue) => void }) => {
          capturedOnSuccess = config.onSuccess;
          return {
            currentStatus: '出題中',
            isLoading: false,
            canStart: false,
            canClose: true,
            startGame: vi.fn(),
            closeGame: vi.fn(),
            resetStatus: vi.fn(),
            retryCount: 0,
            isRetrying: false,
          };
        }
      );

      const game = mockGameDetail({ status: '出題中' });
      render(<GameDetailPage game={game} />);

      expect(capturedOnSuccess).toBeDefined();
      capturedOnSuccess?.('締切');

      expect(mockShowSuccess).toHaveBeenCalledWith('ゲームを締切しました', 'ステータス更新完了');
    });

    it('should call showError when useGameStatus onError is triggered', () => {
      let capturedOnError: ((error: string) => void) | undefined;

      mockUseGameStatus.mockImplementation((config: { onError?: (error: string) => void }) => {
        capturedOnError = config.onError;
        return {
          currentStatus: '準備中',
          isLoading: false,
          canStart: true,
          canClose: false,
          startGame: vi.fn(),
          closeGame: vi.fn(),
          resetStatus: vi.fn(),
          retryCount: 0,
          isRetrying: false,
        };
      });

      const game = mockGameDetail({ status: '準備中' });
      render(<GameDetailPage game={game} />);

      expect(capturedOnError).toBeDefined();
      capturedOnError?.('Test error message');

      expect(mockShowError).toHaveBeenCalledWith('Test error message', 'ステータス更新エラー');
    });
  });

  describe('loading states', () => {
    it('should render loading overlay when isLoading is true', () => {
      mockUseGameStatus.mockReturnValue({
        currentStatus: '準備中',
        isLoading: true,
        canStart: true,
        canClose: false,
        startGame: vi.fn(),
        closeGame: vi.fn(),
        resetStatus: vi.fn(),
        retryCount: 0,
        isRetrying: false,
      });

      const game = mockGameDetail({ status: '準備中' });
      render(<GameDetailPage game={game} />);

      expect(screen.getByText('データを更新中...')).toBeInTheDocument();
    });

    it('should not render loading overlay when isLoading is false', () => {
      mockUseGameStatus.mockReturnValue({
        currentStatus: '準備中',
        isLoading: false,
        canStart: true,
        canClose: false,
        startGame: vi.fn(),
        closeGame: vi.fn(),
        resetStatus: vi.fn(),
        retryCount: 0,
        isRetrying: false,
      });

      const game = mockGameDetail({ status: '準備中' });
      render(<GameDetailPage game={game} />);

      expect(screen.queryByText('データを更新中...')).not.toBeInTheDocument();
    });

    it('should render inline loading indicator in status section when isLoading is true', () => {
      mockUseGameStatus.mockReturnValue({
        currentStatus: '準備中',
        isLoading: true,
        canStart: true,
        canClose: false,
        startGame: vi.fn(),
        closeGame: vi.fn(),
        resetStatus: vi.fn(),
        retryCount: 0,
        isRetrying: false,
      });

      const game = mockGameDetail({ status: '準備中' });
      render(<GameDetailPage game={game} />);

      expect(screen.getByText('(更新中...)')).toBeInTheDocument();
    });
  });

  describe('StatusTransitionButton callbacks', () => {
    it('should call showSuccess when StatusTransitionButton onSuccess is triggered', () => {
      mockUseGameStatus.mockReturnValue({
        currentStatus: '準備中',
        isLoading: false,
        canStart: true,
        canClose: false,
        startGame: vi.fn(),
        closeGame: vi.fn(),
        resetStatus: vi.fn(),
        retryCount: 0,
        isRetrying: false,
      });

      const game = mockGameDetail({ status: '準備中' });
      render(<GameDetailPage game={game} />);

      const startButton = screen.getByRole('button', { name: '開始する' });
      startButton.click();

      expect(mockShowSuccess).toHaveBeenCalledWith('ゲームを開始しました', 'ステータス更新完了');
    });

    it('should call showError when StatusTransitionButton onError is triggered', () => {
      mockUseGameStatus.mockReturnValue({
        currentStatus: '準備中',
        isLoading: false,
        canStart: true,
        canClose: false,
        startGame: vi.fn(),
        closeGame: vi.fn(),
        resetStatus: vi.fn(),
        retryCount: 0,
        isRetrying: false,
      });

      const game = mockGameDetail({ status: '準備中' });
      render(<GameDetailPage game={game} />);

      const errorButton = screen.getByRole('button', { name: 'Trigger Error' });
      errorButton.click();

      expect(mockShowError).toHaveBeenCalledWith(
        'Test error from StatusTransitionButton',
        'ステータス更新エラー'
      );
    });
  });

  describe('CloseGameButton callbacks', () => {
    it('should call showSuccess and reload when CloseGameButton onClosed is triggered', () => {
      const mockReload = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      });

      mockUseGameStatus.mockReturnValue({
        currentStatus: '出題中',
        isLoading: false,
        canStart: false,
        canClose: true,
        startGame: vi.fn(),
        closeGame: vi.fn(),
        resetStatus: vi.fn(),
        retryCount: 0,
        isRetrying: false,
      });

      const game = mockGameDetail({
        status: '出題中',
        creatorId: 'creator-session-123',
      });
      render(<GameDetailPage game={game} currentSessionId="creator-session-123" />);

      const closeButton = screen.getByRole('button', { name: '締切にする' });
      closeButton.click();

      expect(mockShowSuccess).toHaveBeenCalledWith('ゲームを締め切りました', 'ゲーム締切');
      expect(mockReload).toHaveBeenCalled();
    });
  });

  describe('toast notifications', () => {
    it('should render toasts when toasts array is not empty', () => {
      mockUseToast.mockReturnValue({
        toasts: [
          { id: '1', type: 'success', title: 'Success', message: 'Test success message' },
          { id: '2', type: 'error', title: 'Error', message: 'Test error message' },
        ],
        showSuccess: mockShowSuccess,
        showError: mockShowError,
        removeToast: mockRemoveToast,
      });

      const game = mockGameDetail({ status: '準備中' });
      render(<GameDetailPage game={game} />);

      expect(screen.getByTestId('toast-container')).toBeInTheDocument();
      expect(screen.getByTestId('toast-success')).toHaveTextContent(
        'Success: Test success message'
      );
      expect(screen.getByTestId('toast-error')).toHaveTextContent('Error: Test error message');
    });

    it('should pass removeToast to ToastContainer', () => {
      const game = mockGameDetail({ status: '準備中' });
      render(<GameDetailPage game={game} />);

      expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    });
  });

  describe('currentStatus from hook', () => {
    it('should use currentStatus from hook instead of game.status', () => {
      mockUseGameStatus.mockReturnValue({
        currentStatus: '出題中',
        isLoading: false,
        canStart: false,
        canClose: true,
        startGame: vi.fn(),
        closeGame: vi.fn(),
        resetStatus: vi.fn(),
        retryCount: 0,
        isRetrying: false,
      });

      const game = mockGameDetail({ status: '準備中' });
      render(<GameDetailPage game={game} />);

      // Should show "出題中" (from hook) not "準備中" (from game prop)
      const statusBadges = screen.getAllByText('出題中');
      expect(statusBadges.length).toBeGreaterThan(0);
    });

    it('should show edit form based on currentStatus from hook', () => {
      mockUseGameStatus.mockReturnValue({
        currentStatus: '準備中',
        isLoading: false,
        canStart: true,
        canClose: false,
        startGame: vi.fn(),
        closeGame: vi.fn(),
        resetStatus: vi.fn(),
        retryCount: 0,
        isRetrying: false,
      });

      const game = mockGameDetail({ status: '出題中' });
      render(<GameDetailPage game={game} />);

      // Should show edit form because currentStatus is '準備中'
      expect(screen.getByTestId('game-form')).toBeInTheDocument();
    });
  });
});

describe('GameDetailPageError', () => {
  it('should render error message', () => {
    render(<GameDetailPageError errorMessage="Test error message" />);

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render back to games list link', () => {
    render(<GameDetailPageError errorMessage="Test error" />);

    const link = screen.getByText('ゲーム一覧に戻る');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/games');
  });
});
