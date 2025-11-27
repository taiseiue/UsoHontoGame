/**
 * GameList Component Tests
 * Tests for the game list display component
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { GameDto, GameManagementDto } from '@/server/application/dto/GameDto';
import { GameList } from './GameList';

// Mock GameCard component
vi.mock('./GameCard', () => ({
  GameCard: ({
    game,
    onClick,
  }: {
    game: GameDto | GameManagementDto;
    managementView?: boolean;
    onClick?: () => void;
  }) => (
    <button type="button" data-testid={`game-card-${game.id}`} onClick={onClick}>
      {game.name}
    </button>
  ),
}));

describe('GameList', () => {
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

  describe('Empty State', () => {
    it('should render empty state when no games', () => {
      render(<GameList games={[]} />);

      expect(screen.getByText('ゲームがありません')).toBeInTheDocument();
      expect(screen.getByText('現在参加可能なゲームはありません')).toBeInTheDocument();
    });

    it('should render management empty state message', () => {
      render(<GameList games={[]} managementView />);

      expect(screen.getByText('新しいゲームを作成して始めましょう')).toBeInTheDocument();
    });

    it('should render create game link in management view empty state', () => {
      render(<GameList games={[]} managementView />);

      const link = screen.getByRole('link', { name: /ゲームを作成/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/games/create');
    });

    it('should not render create game link in player view empty state', () => {
      render(<GameList games={[]} />);

      expect(screen.queryByRole('link', { name: /ゲームを作成/i })).not.toBeInTheDocument();
    });

    it('should render empty state icon', () => {
      const { container } = render(<GameList games={[]} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Games List', () => {
    it('should render list header with player view title', () => {
      render(<GameList games={mockGames} />);

      expect(screen.getByText('参加可能なゲーム')).toBeInTheDocument();
    });

    it('should render list header with management view title', () => {
      render(<GameList games={mockGames} managementView />);

      expect(screen.getByText('作成したゲーム')).toBeInTheDocument();
    });

    it('should render games count', () => {
      render(<GameList games={mockGames} />);

      expect(screen.getByText('2件')).toBeInTheDocument();
    });

    it('should render all game cards', () => {
      render(<GameList games={mockGames} />);

      expect(screen.getByTestId('game-card-game-1')).toBeInTheDocument();
      expect(screen.getByTestId('game-card-game-2')).toBeInTheDocument();
    });

    it('should render games in grid layout', () => {
      const { container } = render(<GameList games={mockGames} />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('md:grid-cols-2', 'lg:grid-cols-3');
    });

    it('should call onGameClick when game card is clicked', () => {
      const onGameClick = vi.fn();
      render(<GameList games={mockGames} onGameClick={onGameClick} />);

      const gameCard = screen.getByTestId('game-card-game-1');
      gameCard.click();

      expect(onGameClick).toHaveBeenCalledWith('game-1');
    });

    it('should not set onClick when onGameClick is not provided', () => {
      render(<GameList games={mockGames} />);

      const gameCard = screen.getByTestId('game-card-game-1');
      expect(gameCard).toBeInTheDocument();
      // Card should still render but without click handler
    });

    it('should render single game correctly', () => {
      const singleGame = [mockGames[0]];
      render(<GameList games={singleGame} />);

      expect(screen.getByText('1件')).toBeInTheDocument();
      expect(screen.getByTestId('game-card-game-1')).toBeInTheDocument();
    });

    it('should render many games correctly', () => {
      const manyGames = Array.from({ length: 10 }, (_, i) => ({
        id: `game-${i}`,
        name: `Game ${i}`,
        availableSlots: i,
      }));
      render(<GameList games={manyGames} />);

      expect(screen.getByText('10件')).toBeInTheDocument();
    });
  });

  describe('Management View', () => {
    const managementGames: GameManagementDto[] = [
      {
        id: 'game-1',
        name: 'Management Game 1',
        availableSlots: 5,
        status: '出題中',
        currentPlayers: 5,
        maxPlayers: 10,
      },
      {
        id: 'game-2',
        name: 'Management Game 2',
        availableSlots: 2,
        status: '準備中',
        currentPlayers: 8,
        maxPlayers: 10,
      },
    ];

    it('should render management games', () => {
      render(<GameList games={managementGames} managementView />);

      expect(screen.getByTestId('game-card-game-1')).toBeInTheDocument();
      expect(screen.getByTestId('game-card-game-2')).toBeInTheDocument();
    });

    it('should show management view header', () => {
      render(<GameList games={managementGames} managementView />);

      expect(screen.getByText('作成したゲーム')).toBeInTheDocument();
    });
  });
});
