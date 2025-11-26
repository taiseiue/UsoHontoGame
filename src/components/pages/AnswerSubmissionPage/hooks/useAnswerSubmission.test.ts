// Hook Tests: useAnswerSubmission
// Test-Driven Development: Write FAILING tests first
// Task: T031

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAnswerSubmission } from './useAnswerSubmission';

// Mock server action
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

describe('useAnswerSubmission', () => {
  const mockGameId = '550e8400-e29b-41d4-a716-446655440000';
  const mockPresenters = [
    { id: 'presenter-1', name: 'Presenter 1', episodes: [] },
    { id: 'presenter-2', name: 'Presenter 2', episodes: [] },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should start with empty selections', () => {
      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
        })
      );

      expect(result.current.selections).toEqual({});
    });

    it('should not be submitting initially', () => {
      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
        })
      );

      expect(result.current.isSubmitting).toBe(false);
    });

    it('should have no errors initially', () => {
      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
        })
      );

      expect(result.current.error).toBeNull();
    });

    it('should have no success message initially', () => {
      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
        })
      );

      expect(result.current.successMessage).toBeNull();
    });
  });

  describe('LocalStorage Integration', () => {
    it('should load selections from localStorage on mount', () => {
      const savedSelections = {
        'presenter-1': 'episode-1',
        'presenter-2': 'episode-2',
      };
      localStorageMock.setItem(`answer-${mockGameId}`, JSON.stringify(savedSelections));

      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
        })
      );

      expect(result.current.selections).toEqual(savedSelections);
    });

    it('should save selections to localStorage when updated', () => {
      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
        })
      );

      act(() => {
        result.current.selectEpisode('presenter-1', 'episode-1');
      });

      const saved = localStorageMock.getItem(`answer-${mockGameId}`);
      expect(JSON.parse(saved || '{}')).toEqual({
        'presenter-1': 'episode-1',
      });
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.setItem(`answer-${mockGameId}`, 'invalid-json');

      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
        })
      );

      expect(result.current.selections).toEqual({});
    });

    it('should clear localStorage after successful submission', async () => {
      const { submitAnswerAction } = await import('@/app/actions/answers');
      vi.mocked(submitAnswerAction).mockResolvedValue({
        success: true,
        data: {
          answerId: 'answer-123',
          message: '回答を送信しました',
        },
      });

      localStorageMock.setItem(
        `answer-${mockGameId}`,
        JSON.stringify({ 'presenter-1': 'episode-1' })
      );

      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
        })
      );

      act(() => {
        result.current.selectEpisode('presenter-1', 'episode-1');
      });

      await act(async () => {
        await result.current.submit();
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });

      expect(localStorageMock.getItem(`answer-${mockGameId}`)).toBeNull();
    });
  });

  describe('Selection Management', () => {
    it('should add selection for presenter', () => {
      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
        })
      );

      act(() => {
        result.current.selectEpisode('presenter-1', 'episode-1');
      });

      expect(result.current.selections).toEqual({
        'presenter-1': 'episode-1',
      });
    });

    it('should update existing selection for presenter', () => {
      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
        })
      );

      act(() => {
        result.current.selectEpisode('presenter-1', 'episode-1');
      });

      act(() => {
        result.current.selectEpisode('presenter-1', 'episode-2');
      });

      expect(result.current.selections).toEqual({
        'presenter-1': 'episode-2',
      });
    });

    it('should handle multiple presenter selections', () => {
      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
        })
      );

      act(() => {
        result.current.selectEpisode('presenter-1', 'episode-1');
        result.current.selectEpisode('presenter-2', 'episode-2');
      });

      expect(result.current.selections).toEqual({
        'presenter-1': 'episode-1',
        'presenter-2': 'episode-2',
      });
    });

    it('should calculate correct completion status', () => {
      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
        })
      );

      expect(result.current.isComplete).toBe(false);

      act(() => {
        result.current.selectEpisode('presenter-1', 'episode-1');
      });

      expect(result.current.isComplete).toBe(false);

      act(() => {
        result.current.selectEpisode('presenter-2', 'episode-2');
      });

      expect(result.current.isComplete).toBe(true);
    });
  });

  describe('Submission', () => {
    it('should submit selections successfully', async () => {
      const { submitAnswerAction } = await import('@/app/actions/answers');
      vi.mocked(submitAnswerAction).mockResolvedValue({
        success: true,
        data: {
          answerId: 'answer-123',
          message: '回答を送信しました',
        },
      });

      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
        })
      );

      act(() => {
        result.current.selectEpisode('presenter-1', 'episode-1');
        result.current.selectEpisode('presenter-2', 'episode-2');
      });

      await act(async () => {
        await result.current.submit();
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });

      expect(result.current.successMessage).toBe('回答を送信しました');
      expect(result.current.error).toBeNull();
    });

    it('should set isSubmitting during submission', async () => {
      const { submitAnswerAction } = await import('@/app/actions/answers');
      let resolveSubmit: (value: any) => void;
      const submitPromise = new Promise((resolve) => {
        resolveSubmit = resolve;
      });
      vi.mocked(submitAnswerAction).mockReturnValue(submitPromise as any);

      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
        })
      );

      act(() => {
        result.current.selectEpisode('presenter-1', 'episode-1');
      });

      act(() => {
        result.current.submit();
      });

      expect(result.current.isSubmitting).toBe(true);

      await act(async () => {
        resolveSubmit!({
          success: true,
          data: { answerId: 'answer-123', message: '回答を送信しました' },
        });
        await submitPromise;
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });
    });

    it('should handle submission errors', async () => {
      const { submitAnswerAction } = await import('@/app/actions/answers');
      vi.mocked(submitAnswerAction).mockResolvedValue({
        success: false,
        errors: {
          _form: ['ゲームが見つかりません'],
        },
      });

      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
        })
      );

      act(() => {
        result.current.selectEpisode('presenter-1', 'episode-1');
      });

      await act(async () => {
        await result.current.submit();
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });

      expect(result.current.error).toBe('ゲームが見つかりません');
      expect(result.current.successMessage).toBeNull();
    });

    it('should call onSuccess callback after successful submission', async () => {
      const { submitAnswerAction } = await import('@/app/actions/answers');
      vi.mocked(submitAnswerAction).mockResolvedValue({
        success: true,
        data: {
          answerId: 'answer-123',
          message: '回答を送信しました',
        },
      });

      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
          onSuccess,
        })
      );

      act(() => {
        result.current.selectEpisode('presenter-1', 'episode-1');
      });

      await act(async () => {
        await result.current.submit();
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should call onError callback after submission error', async () => {
      const { submitAnswerAction } = await import('@/app/actions/answers');
      vi.mocked(submitAnswerAction).mockResolvedValue({
        success: false,
        errors: {
          _form: ['エラーメッセージ'],
        },
      });

      const onError = vi.fn();
      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
          onError,
        })
      );

      act(() => {
        result.current.selectEpisode('presenter-1', 'episode-1');
      });

      await act(async () => {
        await result.current.submit();
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('エラーメッセージ');
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should reset selections', () => {
      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
        })
      );

      act(() => {
        result.current.selectEpisode('presenter-1', 'episode-1');
        result.current.selectEpisode('presenter-2', 'episode-2');
      });

      expect(result.current.selections).toEqual({
        'presenter-1': 'episode-1',
        'presenter-2': 'episode-2',
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.selections).toEqual({});
    });

    it('should reset error and success messages', async () => {
      const { submitAnswerAction } = await import('@/app/actions/answers');
      vi.mocked(submitAnswerAction).mockResolvedValue({
        success: false,
        errors: {
          _form: ['エラー'],
        },
      });

      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
        })
      );

      act(() => {
        result.current.selectEpisode('presenter-1', 'episode-1');
      });

      await act(async () => {
        await result.current.submit();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.successMessage).toBeNull();
    });

    it('should clear localStorage when reset', () => {
      const { result } = renderHook(() =>
        useAnswerSubmission({
          gameId: mockGameId,
          presenters: mockPresenters,
        })
      );

      act(() => {
        result.current.selectEpisode('presenter-1', 'episode-1');
      });

      expect(localStorageMock.getItem(`answer-${mockGameId}`)).toBeTruthy();

      act(() => {
        result.current.reset();
      });

      expect(localStorageMock.getItem(`answer-${mockGameId}`)).toBeNull();
    });
  });
});
