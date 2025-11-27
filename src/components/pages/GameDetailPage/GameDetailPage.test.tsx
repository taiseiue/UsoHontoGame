// Unit tests for GameDetailPage component

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameDetailPage } from '@/components/pages/GameDetailPage';
import { mockGameDetail } from '../../../../tests/utils/test-helpers';

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

describe('GameDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    const game = mockGameDetail({ status: '進行中' });
    render(<GameDetailPage game={game} />);
    expect(screen.queryByTestId('game-form')).not.toBeInTheDocument();
  });

  it('should show warning when game cannot be edited', () => {
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
});
