// Test utilities and mock data factories for component testing

import { vi } from 'vitest';
import type { GameDetail } from '@/components/pages/GameDetailPage/GameDetailPage.types';
import type { UsePresenterManagementPageReturn } from '@/components/pages/PresenterManagementPage/PresenterManagementPage.types';
import type { GameDto } from '@/server/application/dto/GameDto';
import type { PresenterWithLieDto } from '@/server/application/dto/PresenterWithLieDto';
import { Game } from '@/server/domain/entities/Game';
import { GameId } from '@/server/domain/value-objects/GameId';
import { GameStatus, type GameStatusValue } from '@/server/domain/value-objects/GameStatus';

/**
 * Mock Game entity factory
 */
export const mockGame = (overrides: Partial<{
  id: string;
  name: string | null;
  status: string;
  maxPlayers: number;
  currentPlayers: number;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
}> = {}): Game => {
  const defaults = {
    id: 'test-game-id',
    name: 'Test Game' as string | null,
    status: '準備中',
    maxPlayers: 10,
    currentPlayers: 0,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z'),
    creatorId: 'test-creator-id',
    ...overrides,
  };

  return new Game(
    new GameId(defaults.id),
    defaults.name,
    new GameStatus(defaults.status as GameStatusValue),
    defaults.maxPlayers,
    defaults.currentPlayers,
    defaults.createdAt,
    defaults.updatedAt,
    defaults.creatorId
  );
};

/**
 * Mock GameDto factory
 */
export const mockGameDto = (overrides: Partial<GameDto> = {}): GameDto => ({
  id: 'test-game-id',
  name: 'Test Game',
  availableSlots: 5,
  ...overrides,
});

/**
 * Mock GameDetail factory for GameDetailPage
 */
export const mockGameDetail = (overrides: Partial<GameDetail> = {}): GameDetail => ({
  id: 'test-game-id',
  name: 'Test Game',
  status: '準備中',
  maxPlayers: 10,
  currentPlayers: 5,
  availableSlots: 5,
  creatorId: 'test-creator-id',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
  ...overrides,
});

/**
 * Mock PresenterWithLieDto factory
 */
export const mockPresenterWithLieDto = (
  overrides: Partial<PresenterWithLieDto> = {}
): PresenterWithLieDto => ({
  id: 'test-presenter-id',
  gameId: 'test-game-id',
  nickname: 'Test Presenter',
  episodes: [],
  createdAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

/**
 * Mock usePresenterManagementPage hook return value
 */
export const mockUsePresenterManagementPageReturn = (
  overrides: Partial<UsePresenterManagementPageReturn> = {}
) => ({
  presenters: [],
  selectedPresenter: undefined,
  isLoading: false,
  error: null,
  handlePresenterAdded: vi.fn(),
  handlePresenterRemoved: vi.fn(),
  handleEpisodeAdded: vi.fn(),
  handlePresenterSelected: vi.fn(),
  ...overrides,
});
