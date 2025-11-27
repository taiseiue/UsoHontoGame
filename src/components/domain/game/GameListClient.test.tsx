/**
 * GameListClient Component Tests
 * Tests for the client-side game list wrapper component
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { GameDto } from '@/server/application/dto/GameDto';
import { GameListClient } from './GameListClient';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock GameList component
vi.mock('./GameList', () => ({
  GameList: ({
    games,
    managementView,
    onGameClick,
  }: {
    games: GameDto[];
    managementView?: boolean;
    onGameClick?: (gameId: string) => void;
  }) => (
    <div data-testid="game-list">
      <div data-testid="management-view">{String(managementView)}</div>
      <div data-testid="games-count">{games.length}</div>
      {onGameClick && (
        <button type="button" onClick={() => onGameClick('test-game-id')} data-testid="test-click">
          Click Game
        </button>
      )}
    </div>
  ),
}));

describe('GameListClient', () => {
  const mockGames: GameDto[] = [
    {
      id: 'game-1',
      name: 'Test Game 1',
      availableSlots: 5,
    },
    {
      id: 'game-2',
      name: 'Test Game 2',
      availableSlots: 3,
    },
  ];

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render GameList component', () => {
    render(<GameListClient games={mockGames} />);

    expect(screen.getByTestId('game-list')).toBeInTheDocument();
  });

  it('should pass games prop to GameList', () => {
    render(<GameListClient games={mockGames} />);

    expect(screen.getByTestId('games-count')).toHaveTextContent('2');
  });

  it('should pass managementView=false by default', () => {
    render(<GameListClient games={mockGames} />);

    expect(screen.getByTestId('management-view')).toHaveTextContent('false');
  });

  it('should pass managementView when provided', () => {
    render(<GameListClient games={mockGames} managementView />);

    expect(screen.getByTestId('management-view')).toHaveTextContent('true');
  });

  it('should provide onGameClick handler in management view', () => {
    render(<GameListClient games={mockGames} managementView />);

    expect(screen.getByTestId('test-click')).toBeInTheDocument();
  });

  it('should not provide onGameClick handler in player view', () => {
    render(<GameListClient games={mockGames} />);

    expect(screen.queryByTestId('test-click')).not.toBeInTheDocument();
  });

  it('should navigate to game detail page when onGameClick is called', () => {
    render(<GameListClient games={mockGames} managementView />);

    const clickButton = screen.getByTestId('test-click');
    clickButton.click();

    expect(mockPush).toHaveBeenCalledWith('/games/test-game-id');
  });

  it('should handle empty games array', () => {
    render(<GameListClient games={[]} />);

    expect(screen.getByTestId('games-count')).toHaveTextContent('0');
  });

  it('should handle single game', () => {
    render(<GameListClient games={[mockGames[0]]} />);

    expect(screen.getByTestId('games-count')).toHaveTextContent('1');
  });
});
