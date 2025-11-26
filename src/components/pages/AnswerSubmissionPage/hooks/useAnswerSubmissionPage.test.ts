/**
 * Hook Tests: useAnswerSubmissionPage
 * Feature: 001-lie-detection-answers
 * Tests wrapper hook that handles data fetching and coordinates with useAnswerSubmission
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PresenterWithLieDto } from '@/server/application/dto/PresenterWithLieDto';
import { useAnswerSubmissionPage } from './useAnswerSubmissionPage';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

vi.mock('@/app/actions/presenter', () => ({
  getPresentersAction: vi.fn(),
}));

vi.mock('@/app/actions/answers', () => ({
  submitAnswerAction: vi.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useAnswerSubmissionPage', () => {
  const mockGameId = '550e8400-e29b-41d4-a716-446655440000';

  const mockPresenterDtos: PresenterWithLieDto[] = [
    {
      id: 'presenter-1',
      gameId: mockGameId,
      nickname: 'Presenter 1',
      episodes: [
        {
          id: 'episode-1-1',
          presenterId: 'presenter-1',
          text: 'Truth 1',
          isLie: false,
          createdAt: new Date(),
        },
        {
          id: 'episode-1-2',
          presenterId: 'presenter-1',
          text: 'Lie 1',
          isLie: true,
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
    },
    {
      id: 'presenter-2',
      gameId: mockGameId,
      nickname: 'Presenter 2',
      episodes: [
        {
          id: 'episode-2-1',
          presenterId: 'presenter-2',
          text: 'Lie 2',
          isLie: true,
          createdAt: new Date(),
        },
        {
          id: 'episode-2-2',
          presenterId: 'presenter-2',
          text: 'Truth 2',
          isLie: false,
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should start in loading state', async () => {
      const { getPresentersAction } = await import('@/app/actions/presenter');
      vi.mocked(getPresentersAction).mockReturnValue(new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useAnswerSubmissionPage({ gameId: mockGameId }));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.formData).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should have no errors initially', async () => {
      const { getPresentersAction } = await import('@/app/actions/presenter');
      vi.mocked(getPresentersAction).mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useAnswerSubmissionPage({ gameId: mockGameId }));

      expect(result.current.error).toBeNull();
    });
  });

  describe('Data Fetching', () => {
    it('should fetch presenters on mount', async () => {
      const { getPresentersAction } = await import('@/app/actions/presenter');
      vi.mocked(getPresentersAction).mockResolvedValue({
        success: true,
        presenters: mockPresenterDtos,
      });

      renderHook(() => useAnswerSubmissionPage({ gameId: mockGameId }));

      await waitFor(() => {
        expect(getPresentersAction).toHaveBeenCalledWith(mockGameId);
      });
    });

    it('should transform presenters data after successful fetch', async () => {
      const { getPresentersAction } = await import('@/app/actions/presenter');
      vi.mocked(getPresentersAction).mockResolvedValue({
        success: true,
        presenters: mockPresenterDtos,
      });

      const { result } = renderHook(() => useAnswerSubmissionPage({ gameId: mockGameId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.formData).toBeTruthy();
      expect(result.current.formData?.presenters).toHaveLength(2);

      // Verify transformation: isLie should be excluded
      const presenter1 = result.current.formData?.presenters[0];
      expect(presenter1?.id).toBe('presenter-1');
      expect(presenter1?.name).toBe('Presenter 1');
      expect(presenter1?.episodes).toHaveLength(2);
      expect(presenter1?.episodes[0]).toEqual({
        id: 'episode-1-1',
        text: 'Truth 1',
      });
      expect(presenter1?.episodes[0]).not.toHaveProperty('isLie');
    });

    it('should set error state on fetch failure', async () => {
      const { getPresentersAction } = await import('@/app/actions/presenter');
      vi.mocked(getPresentersAction).mockResolvedValue({
        success: false,
        error: 'プレゼンターの取得に失敗しました',
      });

      const { result } = renderHook(() => useAnswerSubmissionPage({ gameId: mockGameId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('プレゼンターの取得に失敗しました');
      expect(result.current.formData).toBeNull();
    });

    it('should handle fetch exceptions', async () => {
      const { getPresentersAction } = await import('@/app/actions/presenter');
      vi.mocked(getPresentersAction).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAnswerSubmissionPage({ gameId: mockGameId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('プレゼンターの取得に失敗しました');
    });

    it('should not update state if component unmounts during fetch', async () => {
      const { getPresentersAction } = await import('@/app/actions/presenter');
      let resolveFetch: (value: any) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      vi.mocked(getPresentersAction).mockReturnValue(fetchPromise as any);

      const { result, unmount } = renderHook(() => useAnswerSubmissionPage({ gameId: mockGameId }));

      expect(result.current.isLoading).toBe(true);

      // Unmount before fetch completes
      unmount();

      // Resolve fetch after unmount
      await act(async () => {
        resolveFetch!({
          success: true,
          presenters: mockPresenterDtos,
        });
        await fetchPromise;
      });

      // No state update should occur after unmount
    });
  });

  describe('FormData Structure', () => {
    it('should provide formData with correct structure after loading', async () => {
      const { getPresentersAction } = await import('@/app/actions/presenter');
      vi.mocked(getPresentersAction).mockResolvedValue({
        success: true,
        presenters: mockPresenterDtos,
      });

      const { result } = renderHook(() => useAnswerSubmissionPage({ gameId: mockGameId }));

      await waitFor(() => {
        expect(result.current.formData).toBeTruthy();
      });

      expect(result.current.formData).toHaveProperty('presenters');
      expect(result.current.formData).toHaveProperty('selections');
      expect(result.current.formData).toHaveProperty('isComplete');
      expect(result.current.formData).toHaveProperty('isSubmitting');

      expect(result.current.formData?.selections).toEqual({});
      expect(result.current.formData?.isComplete).toBe(false);
      expect(result.current.formData?.isSubmitting).toBe(false);
    });
  });

  describe('Selection Management', () => {
    it('should update selections when handleSelectEpisode is called', async () => {
      const { getPresentersAction } = await import('@/app/actions/presenter');
      vi.mocked(getPresentersAction).mockResolvedValue({
        success: true,
        presenters: mockPresenterDtos,
      });

      const { result } = renderHook(() => useAnswerSubmissionPage({ gameId: mockGameId }));

      await waitFor(() => {
        expect(result.current.formData).toBeTruthy();
      });

      act(() => {
        result.current.handleSelectEpisode('presenter-1', 'episode-1-1');
      });

      expect(result.current.formData?.selections).toEqual({
        'presenter-1': 'episode-1-1',
      });
    });

    it('should calculate isComplete correctly', async () => {
      const { getPresentersAction } = await import('@/app/actions/presenter');
      vi.mocked(getPresentersAction).mockResolvedValue({
        success: true,
        presenters: mockPresenterDtos,
      });

      const { result } = renderHook(() => useAnswerSubmissionPage({ gameId: mockGameId }));

      await waitFor(() => {
        expect(result.current.formData).toBeTruthy();
      });

      expect(result.current.formData?.isComplete).toBe(false);

      act(() => {
        result.current.handleSelectEpisode('presenter-1', 'episode-1-1');
      });

      expect(result.current.formData?.isComplete).toBe(false);

      act(() => {
        result.current.handleSelectEpisode('presenter-2', 'episode-2-1');
      });

      expect(result.current.formData?.isComplete).toBe(true);
    });
  });

  describe('Submission', () => {
    it('should submit answers successfully', async () => {
      const { getPresentersAction } = await import('@/app/actions/presenter');
      const { submitAnswerAction } = await import('@/app/actions/answers');

      vi.mocked(getPresentersAction).mockResolvedValue({
        success: true,
        presenters: mockPresenterDtos,
      });

      vi.mocked(submitAnswerAction).mockResolvedValue({
        success: true,
        data: {
          answerId: 'answer-123',
          message: '回答を送信しました',
        },
      });

      const { result } = renderHook(() => useAnswerSubmissionPage({ gameId: mockGameId }));

      await waitFor(() => {
        expect(result.current.formData).toBeTruthy();
      });

      act(() => {
        result.current.handleSelectEpisode('presenter-1', 'episode-1-1');
        result.current.handleSelectEpisode('presenter-2', 'episode-2-1');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.successMessage).toBe('回答を送信しました');
      });
    });

    it('should redirect to top page on successful submission', async () => {
      const { getPresentersAction } = await import('@/app/actions/presenter');
      const { submitAnswerAction } = await import('@/app/actions/answers');
      const { useRouter } = await import('next/navigation');

      const mockPush = vi.fn();
      vi.mocked(useRouter).mockReturnValue({ push: mockPush });

      vi.mocked(getPresentersAction).mockResolvedValue({
        success: true,
        presenters: mockPresenterDtos,
      });

      vi.mocked(submitAnswerAction).mockResolvedValue({
        success: true,
        data: {
          answerId: 'answer-123',
          message: '回答を送信しました',
        },
      });

      const { result } = renderHook(() => useAnswerSubmissionPage({ gameId: mockGameId }));

      await waitFor(() => {
        expect(result.current.formData).toBeTruthy();
      });

      act(() => {
        result.current.handleSelectEpisode('presenter-1', 'episode-1-1');
        result.current.handleSelectEpisode('presenter-2', 'episode-2-1');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should handle submission errors', async () => {
      const { getPresentersAction } = await import('@/app/actions/presenter');
      const { submitAnswerAction } = await import('@/app/actions/answers');

      vi.mocked(getPresentersAction).mockResolvedValue({
        success: true,
        presenters: mockPresenterDtos,
      });

      vi.mocked(submitAnswerAction).mockResolvedValue({
        success: false,
        errors: {
          _form: ['ゲームが見つかりません'],
        },
      });

      const { result } = renderHook(() => useAnswerSubmissionPage({ gameId: mockGameId }));

      await waitFor(() => {
        expect(result.current.formData).toBeTruthy();
      });

      act(() => {
        result.current.handleSelectEpisode('presenter-1', 'episode-1-1');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('ゲームが見つかりません');
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should reset selections', async () => {
      const { getPresentersAction } = await import('@/app/actions/presenter');
      vi.mocked(getPresentersAction).mockResolvedValue({
        success: true,
        presenters: mockPresenterDtos,
      });

      const { result } = renderHook(() => useAnswerSubmissionPage({ gameId: mockGameId }));

      await waitFor(() => {
        expect(result.current.formData).toBeTruthy();
      });

      act(() => {
        result.current.handleSelectEpisode('presenter-1', 'episode-1-1');
        result.current.handleSelectEpisode('presenter-2', 'episode-2-1');
      });

      expect(result.current.formData?.selections).toEqual({
        'presenter-1': 'episode-1-1',
        'presenter-2': 'episode-2-1',
      });

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.formData?.selections).toEqual({});
    });
  });

  describe('Error Priority', () => {
    it('should show fetch error over submission error', async () => {
      const { getPresentersAction } = await import('@/app/actions/presenter');
      vi.mocked(getPresentersAction).mockResolvedValue({
        success: false,
        error: 'フェッチエラー',
      });

      const { result } = renderHook(() => useAnswerSubmissionPage({ gameId: mockGameId }));

      await waitFor(() => {
        expect(result.current.error).toBe('フェッチエラー');
      });
    });
  });
});
