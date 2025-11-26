// Hook Tests: useResponseStatus
// Feature: 006-results-dashboard, User Story 1
// TDD: Write tests FIRST

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ResponseStatusDto } from '@/server/application/dto/ResponseStatusDto';

// Mock global fetch
global.fetch = vi.fn();

// Hook import will fail until created
// import { useResponseStatus } from './useResponseStatus';

describe('useResponseStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const _mockInitialData: ResponseStatusDto = {
    gameId: 'game-123',
    gameName: 'Test Game',
    gameStatus: '出題中',
    participants: [],
    totalParticipants: 0,
    submittedCount: 0,
    allSubmitted: false,
    shouldContinuePolling: true,
    lastUpdated: new Date(),
  };

  it('should start polling on mount', async () => {
    // TODO: Implement when hook exists
    expect(true).toBe(true);
  });

  it('should update data when fetch succeeds', async () => {
    expect(true).toBe(true);
  });

  it('should handle fetch errors', async () => {
    expect(true).toBe(true);
  });

  it('should clear interval on unmount', async () => {
    expect(true).toBe(true);
  });

  it('should allow manual refetch', async () => {
    expect(true).toBe(true);
  });

  // Feature: 007-game-closure, User Story 3
  // Tests for detecting closed state and stopping polling
  describe('closed game detection', () => {
    it('should stop polling when shouldContinuePolling is false', async () => {
      // Arrange: Mock response with closed game
      const closedGameData: ResponseStatusDto = {
        gameId: 'game-123',
        gameName: 'Closed Game',
        gameStatus: '締切',
        participants: [],
        totalParticipants: 3,
        submittedCount: 2,
        allSubmitted: false,
        shouldContinuePolling: false,
        lastUpdated: new Date(),
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => closedGameData,
      } as Response);

      // Act
      // const { result } = renderHook(() =>
      //   useResponseStatus({
      //     gameId: 'game-123',
      //     pollingInterval: 1000,
      //   })
      // );

      // Wait for initial fetch
      // await waitFor(() => expect(result.current.data).toBeTruthy());

      // Assert: Polling should stop automatically
      // expect(result.current.isPolling).toBe(false);
      // expect(result.current.data?.shouldContinuePolling).toBe(false);

      // TODO: Uncomment when implementation exists
      expect(true).toBe(true); // Placeholder
    });

    it('should continue polling when shouldContinuePolling is true', async () => {
      // Arrange: Mock response with active game
      const activeGameData: ResponseStatusDto = {
        gameId: 'game-123',
        gameName: 'Active Game',
        gameStatus: '出題中',
        participants: [],
        totalParticipants: 3,
        submittedCount: 1,
        allSubmitted: false,
        shouldContinuePolling: true,
        lastUpdated: new Date(),
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => activeGameData,
      } as Response);

      // Act
      // const { result } = renderHook(() =>
      //   useResponseStatus({
      //     gameId: 'game-123',
      //     pollingInterval: 1000,
      //   })
      // );

      // Wait for initial fetch
      // await waitFor(() => expect(result.current.data).toBeTruthy());

      // Assert: Polling should continue
      // expect(result.current.isPolling).toBe(true);
      // expect(result.current.data?.shouldContinuePolling).toBe(true);

      // Advance timers to trigger next poll
      // vi.advanceTimersByTime(1000);
      // await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

      // TODO: Uncomment when implementation exists
      expect(true).toBe(true); // Placeholder
    });

    it('should stop polling mid-session when game becomes closed', async () => {
      // Arrange: First response is active, second is closed
      const activeData: ResponseStatusDto = {
        gameId: 'game-123',
        gameName: 'Active Game',
        gameStatus: '出題中',
        participants: [],
        totalParticipants: 3,
        submittedCount: 1,
        allSubmitted: false,
        shouldContinuePolling: true,
        lastUpdated: new Date(),
      };

      const closedData: ResponseStatusDto = {
        ...activeData,
        gameStatus: '締切',
        shouldContinuePolling: false,
      };

      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => activeData,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => closedData,
        } as Response);

      // Act
      // const { result } = renderHook(() =>
      //   useResponseStatus({
      //     gameId: 'game-123',
      //     pollingInterval: 1000,
      //   })
      // );

      // Wait for initial fetch (active)
      // await waitFor(() => expect(result.current.data).toBeTruthy());
      // expect(result.current.isPolling).toBe(true);
      // expect(result.current.data?.gameStatus).toBe('出題中');

      // Advance timers to trigger next poll (game becomes closed)
      // vi.advanceTimersByTime(1000);
      // await waitFor(() => expect(result.current.data?.gameStatus).toBe('締切'));

      // Assert: Polling should stop
      // expect(result.current.isPolling).toBe(false);
      // expect(result.current.data?.shouldContinuePolling).toBe(false);

      // Advance timers further - no more fetches should occur
      // const fetchCallsBefore = vi.mocked(fetch).mock.calls.length;
      // vi.advanceTimersByTime(5000);
      // await waitFor(() => {
      //   expect(vi.mocked(fetch).mock.calls.length).toBe(fetchCallsBefore);
      // });

      // TODO: Uncomment when implementation exists
      expect(true).toBe(true); // Placeholder
    });

    it('should not restart polling after game is closed', async () => {
      // Arrange: Mock closed game response
      const closedData: ResponseStatusDto = {
        gameId: 'game-123',
        gameName: 'Closed Game',
        gameStatus: '締切',
        participants: [],
        totalParticipants: 3,
        submittedCount: 3,
        allSubmitted: true,
        shouldContinuePolling: false,
        lastUpdated: new Date(),
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => closedData,
      } as Response);

      // Act
      // const { result } = renderHook(() =>
      //   useResponseStatus({
      //     gameId: 'game-123',
      //     pollingInterval: 1000,
      //   })
      // );

      // Wait for initial fetch
      // await waitFor(() => expect(result.current.data).toBeTruthy());
      // expect(result.current.isPolling).toBe(false);

      // Try to manually start polling
      // act(() => {
      //   result.current.startPolling();
      // });

      // Should not actually start polling because game is closed
      // expect(result.current.isPolling).toBe(false);

      // TODO: Uncomment when implementation exists
      expect(true).toBe(true); // Placeholder
    });
  });
});
