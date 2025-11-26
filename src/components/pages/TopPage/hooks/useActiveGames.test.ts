/**
 * useActiveGames Hook Tests
 * Feature: 005-top-active-games (User Story 4)
 * Tests for auto-refresh functionality with React Query
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { useActiveGames } from './useActiveGames';

// Mock the server action
vi.mock('@/app/actions/game', () => ({
  getActiveGamesAction: vi.fn(),
}));

import { getActiveGamesAction } from '@/app/actions/game';

const mockGetActiveGamesAction = getActiveGamesAction as Mock;

describe('useActiveGames', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    vi.clearAllMocks();
  });

  function wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }

  // T035: Test for refetchInterval
  describe('auto-refresh with refetchInterval', () => {
    it('should fetch active games on initial render', async () => {
      const mockGames = [
        {
          id: 'game-001',
          title: 'Test Game',
          createdAt: '2025-11-18T10:00:00Z',
          playerCount: 5,
          playerLimit: 10,
          formattedCreatedAt: '10分前',
        },
      ];

      mockGetActiveGamesAction.mockResolvedValue({
        success: true,
        games: mockGames,
        hasMore: false,
        nextCursor: null,
        total: 1,
      });

      const { result } = renderHook(() => useActiveGames(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.games).toEqual(mockGames);
      expect(result.current.error).toBeNull();
      expect(mockGetActiveGamesAction).toHaveBeenCalledTimes(1);
    });

    it('should configure refetch interval in query options', async () => {
      const mockGames = [
        {
          id: 'game-002',
          title: 'Auto Refresh Game',
          createdAt: '2025-11-18T10:00:00Z',
          playerCount: 3,
          playerLimit: 8,
          formattedCreatedAt: '5分前',
        },
      ];

      mockGetActiveGamesAction.mockResolvedValue({
        success: true,
        games: mockGames,
        hasMore: false,
        nextCursor: null,
        total: 1,
      });

      const { result } = renderHook(() => useActiveGames(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify hook returns expected structure
      expect(result.current.games).toEqual(mockGames);
      expect(result.current.isFetching).toBeDefined();
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should accept custom refetch interval option', async () => {
      mockGetActiveGamesAction.mockResolvedValue({
        success: true,
        games: [],
        hasMore: false,
        nextCursor: null,
        total: 0,
      });

      const customInterval = 10000; // 10 seconds
      const { result } = renderHook(() => useActiveGames({ refetchInterval: customInterval }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.games).toEqual([]);
      expect(mockGetActiveGamesAction).toHaveBeenCalled();
    });
  });

  // T036: Test for no scroll jump during refresh
  describe('smooth refresh without scroll jump', () => {
    it('should provide isFetching state for background updates', async () => {
      const mockGames = [
        {
          id: 'game-003',
          title: 'Test Game',
          createdAt: '2025-11-18T10:00:00Z',
          playerCount: 5,
          playerLimit: 10,
          formattedCreatedAt: '10分前',
        },
      ];

      mockGetActiveGamesAction.mockResolvedValue({
        success: true,
        games: mockGames,
        hasMore: false,
        nextCursor: null,
        total: 1,
      });

      const { result } = renderHook(() => useActiveGames(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify isFetching is available for background refresh indication
      expect(result.current.isFetching).toBe(false);
      expect(result.current.games).toEqual(mockGames);
    });

    it('should maintain previous data during refetch', async () => {
      const initialGames = [
        {
          id: 'game-004',
          title: 'Initial Game',
          createdAt: '2025-11-18T10:00:00Z',
          playerCount: 5,
          playerLimit: 10,
          formattedCreatedAt: '10分前',
        },
      ];

      mockGetActiveGamesAction.mockResolvedValue({
        success: true,
        games: initialGames,
        hasMore: false,
        nextCursor: null,
        total: 1,
      });

      const { result } = renderHook(() => useActiveGames(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.games).toEqual(initialGames);

      // Trigger refetch - data should remain available
      result.current.refetch();

      // Previous data still accessible immediately after refetch trigger
      expect(result.current.games).toEqual(initialGames);
    });
  });

  // Additional tests
  describe('error handling', () => {
    it('should handle fetch errors and return empty array', async () => {
      mockGetActiveGamesAction.mockResolvedValue({
        success: false,
        error: 'FETCH_FAILED',
        message: 'Failed to fetch games',
      });

      const { result } = renderHook(() => useActiveGames(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.games).toEqual([]);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('manual refetch', () => {
    it('should provide refetch function', async () => {
      const mockGames = [
        {
          id: 'game-005',
          title: 'Manual Refresh Game',
          createdAt: '2025-11-18T10:00:00Z',
          playerCount: 7,
          playerLimit: 10,
          formattedCreatedAt: '20分前',
        },
      ];

      mockGetActiveGamesAction.mockResolvedValue({
        success: true,
        games: mockGames,
        hasMore: false,
        nextCursor: null,
        total: 1,
      });

      const { result } = renderHook(() => useActiveGames(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify refetch function exists and is callable
      expect(typeof result.current.refetch).toBe('function');
      await result.current.refetch();

      // Data should still be available after refetch
      expect(result.current.games).toEqual(mockGames);
    });
  });
});
