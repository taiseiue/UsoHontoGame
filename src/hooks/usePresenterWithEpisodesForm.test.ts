// Hook Tests: usePresenterWithEpisodesForm
// Feature: 003-presenter-episode-inline
// Tests for complex form state management with 3 episodes and exclusive lie marker

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { usePresenterWithEpisodesForm } from './usePresenterWithEpisodesForm';

// Mock the server action
vi.mock('@/app/actions/presenter', () => ({
  addPresenterWithEpisodesAction: vi.fn(),
}));

import { addPresenterWithEpisodesAction } from '@/app/actions/presenter';

const mockAddPresenterWithEpisodesAction = addPresenterWithEpisodesAction as Mock;

describe('usePresenterWithEpisodesForm', () => {
  const gameId = 'game-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      expect(result.current.formState).toEqual({
        gameId: 'game-123',
        nickname: '',
        episodes: [
          { text: '', isLie: false },
          { text: '', isLie: false },
          { text: '', isLie: false },
        ],
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.errors).toBeUndefined();
      expect(result.current.presenter).toBeUndefined();
    });

    it('should initialize with correct gameId', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm('test-game-id'));

      expect(result.current.formState.gameId).toBe('test-game-id');
    });

    it('should initialize with exactly 3 episodes', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      expect(result.current.formState.episodes).toHaveLength(3);
    });
  });

  describe('Return Values', () => {
    it('should return all required properties', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      // State properties
      expect(result.current).toHaveProperty('formState');
      expect(result.current).toHaveProperty('status');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('isSubmitting');
      expect(result.current).toHaveProperty('isSuccess');
      expect(result.current).toHaveProperty('successMessage');
      expect(result.current).toHaveProperty('errors');
      expect(result.current).toHaveProperty('presenter');

      // Action functions
      expect(result.current).toHaveProperty('updateNickname');
      expect(result.current).toHaveProperty('updateEpisodeText');
      expect(result.current).toHaveProperty('updateEpisodeIsLie');
      expect(result.current).toHaveProperty('submit');
      expect(result.current).toHaveProperty('reset');

      // Utility functions
      expect(result.current).toHaveProperty('getNicknameCharCount');
      expect(result.current).toHaveProperty('getEpisodeCharCount');
    });

    it('should have correct types for action functions', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      expect(typeof result.current.updateNickname).toBe('function');
      expect(typeof result.current.updateEpisodeText).toBe('function');
      expect(typeof result.current.updateEpisodeIsLie).toBe('function');
      expect(typeof result.current.submit).toBe('function');
      expect(typeof result.current.reset).toBe('function');
      expect(typeof result.current.getNicknameCharCount).toBe('function');
      expect(typeof result.current.getEpisodeCharCount).toBe('function');
    });
  });

  describe('Nickname Updates', () => {
    it('should update nickname when updateNickname is called', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateNickname('テスト太郎');
      });

      expect(result.current.formState.nickname).toBe('テスト太郎');
    });

    it('should preserve other form state when updating nickname', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateEpisodeText(0, 'エピソード1');
        result.current.updateNickname('太郎');
      });

      expect(result.current.formState.nickname).toBe('太郎');
      expect(result.current.formState.episodes[0].text).toBe('エピソード1');
    });
  });

  describe('Episode Text Updates', () => {
    it('should update episode text when updateEpisodeText is called', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateEpisodeText(0, 'エピソード1の内容');
      });

      expect(result.current.formState.episodes[0].text).toBe('エピソード1の内容');
    });

    it('should update each episode independently', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateEpisodeText(0, 'エピソード1');
        result.current.updateEpisodeText(1, 'エピソード2');
        result.current.updateEpisodeText(2, 'エピソード3');
      });

      expect(result.current.formState.episodes[0].text).toBe('エピソード1');
      expect(result.current.formState.episodes[1].text).toBe('エピソード2');
      expect(result.current.formState.episodes[2].text).toBe('エピソード3');
    });

    it('should not affect other episodes when updating one episode', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateEpisodeText(0, '最初のエピソード');
        result.current.updateEpisodeText(2, '最後のエピソード');
      });

      expect(result.current.formState.episodes[0].text).toBe('最初のエピソード');
      expect(result.current.formState.episodes[1].text).toBe('');
      expect(result.current.formState.episodes[2].text).toBe('最後のエピソード');
    });

    it('should preserve lie marker when updating episode text', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateEpisodeIsLie(1, true);
        result.current.updateEpisodeText(1, 'これは嘘のエピソード');
      });

      expect(result.current.formState.episodes[1].text).toBe('これは嘘のエピソード');
      expect(result.current.formState.episodes[1].isLie).toBe(true);
    });
  });

  describe('Exclusive Lie Marker Logic', () => {
    it('should mark selected episode as lie', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateEpisodeIsLie(0, true);
      });

      expect(result.current.formState.episodes[0].isLie).toBe(true);
    });

    it('should only allow one episode to be marked as lie at a time', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateEpisodeIsLie(0, true);
      });

      expect(result.current.formState.episodes[0].isLie).toBe(true);
      expect(result.current.formState.episodes[1].isLie).toBe(false);
      expect(result.current.formState.episodes[2].isLie).toBe(false);

      act(() => {
        result.current.updateEpisodeIsLie(1, true);
      });

      expect(result.current.formState.episodes[0].isLie).toBe(false);
      expect(result.current.formState.episodes[1].isLie).toBe(true);
      expect(result.current.formState.episodes[2].isLie).toBe(false);
    });

    it('should allow unmarking lie marker', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateEpisodeIsLie(1, true);
      });

      expect(result.current.formState.episodes[1].isLie).toBe(true);

      act(() => {
        result.current.updateEpisodeIsLie(1, false);
      });

      expect(result.current.formState.episodes[1].isLie).toBe(false);
    });

    it('should switch lie marker between episodes correctly', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      // Mark episode 0 as lie
      act(() => {
        result.current.updateEpisodeIsLie(0, true);
      });

      expect(result.current.formState.episodes[0].isLie).toBe(true);

      // Mark episode 2 as lie - should unmark episode 0
      act(() => {
        result.current.updateEpisodeIsLie(2, true);
      });

      expect(result.current.formState.episodes[0].isLie).toBe(false);
      expect(result.current.formState.episodes[1].isLie).toBe(false);
      expect(result.current.formState.episodes[2].isLie).toBe(true);

      // Mark episode 1 as lie - should unmark episode 2
      act(() => {
        result.current.updateEpisodeIsLie(1, true);
      });

      expect(result.current.formState.episodes[0].isLie).toBe(false);
      expect(result.current.formState.episodes[1].isLie).toBe(true);
      expect(result.current.formState.episodes[2].isLie).toBe(false);
    });

    it('should preserve episode text when updating lie marker', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateEpisodeText(0, 'エピソード1');
        result.current.updateEpisodeText(1, 'エピソード2');
        result.current.updateEpisodeIsLie(0, true);
      });

      expect(result.current.formState.episodes[0].text).toBe('エピソード1');
      expect(result.current.formState.episodes[1].text).toBe('エピソード2');
      expect(result.current.formState.episodes[0].isLie).toBe(true);
      expect(result.current.formState.episodes[1].isLie).toBe(false);
    });
  });

  describe('Character Count Utilities', () => {
    it('should return correct nickname character count', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      expect(result.current.getNicknameCharCount()).toBe(0);

      act(() => {
        result.current.updateNickname('太郎');
      });

      expect(result.current.getNicknameCharCount()).toBe(2);

      act(() => {
        result.current.updateNickname('田中太郎');
      });

      expect(result.current.getNicknameCharCount()).toBe(4);
    });

    it('should return correct episode character count', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      expect(result.current.getEpisodeCharCount(0)).toBe(0);

      act(() => {
        result.current.updateEpisodeText(0, 'エピソード');
      });

      expect(result.current.getEpisodeCharCount(0)).toBe(5);
    });

    it('should return character count for each episode independently', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateEpisodeText(0, 'あ');
        result.current.updateEpisodeText(1, 'あいう');
        result.current.updateEpisodeText(2, 'あいうえお');
      });

      expect(result.current.getEpisodeCharCount(0)).toBe(1);
      expect(result.current.getEpisodeCharCount(1)).toBe(3);
      expect(result.current.getEpisodeCharCount(2)).toBe(5);
    });

    it('should handle multibyte characters correctly', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateNickname('こんにちは世界');
      });

      expect(result.current.getNicknameCharCount()).toBe(7);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset form to initial state', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateNickname('太郎');
        result.current.updateEpisodeText(0, 'エピソード1');
        result.current.updateEpisodeText(1, 'エピソード2');
        result.current.updateEpisodeText(2, 'エピソード3');
        result.current.updateEpisodeIsLie(1, true);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.formState.nickname).toBe('');
      expect(result.current.formState.episodes[0]).toEqual({ text: '', isLie: false });
      expect(result.current.formState.episodes[1]).toEqual({ text: '', isLie: false });
      expect(result.current.formState.episodes[2]).toEqual({ text: '', isLie: false });
    });

    it('should preserve gameId after reset', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateNickname('太郎');
        result.current.reset();
      });

      expect(result.current.formState.gameId).toBe(gameId);
    });
  });

  describe('Form Submission - Success', () => {
    it('should set isSuccess to true on successful submission', async () => {
      const mockPresenter = {
        id: 'presenter-1',
        gameId: 'game-123',
        nickname: '太郎',
        episodes: [
          {
            id: 'ep1',
            presenterId: 'presenter-1',
            text: 'エピソード1',
            isLie: true,
            createdAt: new Date(),
          },
          {
            id: 'ep2',
            presenterId: 'presenter-1',
            text: 'エピソード2',
            isLie: false,
            createdAt: new Date(),
          },
          {
            id: 'ep3',
            presenterId: 'presenter-1',
            text: 'エピソード3',
            isLie: false,
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
      };

      mockAddPresenterWithEpisodesAction.mockResolvedValue({
        success: true,
        presenter: mockPresenter,
      });

      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateNickname('太郎');
        result.current.updateEpisodeText(0, 'エピソード1');
        result.current.updateEpisodeText(1, 'エピソード2');
        result.current.updateEpisodeText(2, 'エピソード3');
        result.current.updateEpisodeIsLie(0, true);
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should set success message on successful submission', async () => {
      mockAddPresenterWithEpisodesAction.mockResolvedValue({
        success: true,
        presenter: {
          id: 'presenter-1',
          gameId: 'game-123',
          nickname: '太郎',
          episodes: [],
          createdAt: new Date(),
        },
      });

      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateNickname('太郎');
        result.current.updateEpisodeText(0, 'エピソード1');
        result.current.updateEpisodeText(1, 'エピソード2');
        result.current.updateEpisodeText(2, 'エピソード3');
        result.current.updateEpisodeIsLie(0, true);
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(result.current.successMessage).toBe('プレゼンターとエピソードが正常に登録されました');
    });

    it('should return presenter data on successful submission', async () => {
      const mockPresenter = {
        id: 'presenter-1',
        gameId: 'game-123',
        nickname: '太郎',
        episodes: [
          {
            id: 'ep1',
            presenterId: 'presenter-1',
            text: 'エピソード1',
            isLie: true,
            createdAt: new Date(),
          },
          {
            id: 'ep2',
            presenterId: 'presenter-1',
            text: 'エピソード2',
            isLie: false,
            createdAt: new Date(),
          },
          {
            id: 'ep3',
            presenterId: 'presenter-1',
            text: 'エピソード3',
            isLie: false,
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
      };

      mockAddPresenterWithEpisodesAction.mockResolvedValue({
        success: true,
        presenter: mockPresenter,
      });

      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateNickname('太郎');
        result.current.updateEpisodeText(0, 'エピソード1');
        result.current.updateEpisodeText(1, 'エピソード2');
        result.current.updateEpisodeText(2, 'エピソード3');
        result.current.updateEpisodeIsLie(0, true);
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(result.current.presenter).toEqual(mockPresenter);
    });

    it('should reset form after successful submission', async () => {
      mockAddPresenterWithEpisodesAction.mockResolvedValue({
        success: true,
        presenter: {
          id: 'presenter-1',
          gameId: 'game-123',
          nickname: '太郎',
          episodes: [],
          createdAt: new Date(),
        },
      });

      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateNickname('太郎');
        result.current.updateEpisodeText(0, 'エピソード1');
        result.current.updateEpisodeText(1, 'エピソード2');
        result.current.updateEpisodeText(2, 'エピソード3');
        result.current.updateEpisodeIsLie(1, true);
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(result.current.formState.nickname).toBe('');
      expect(result.current.formState.episodes[0]).toEqual({ text: '', isLie: false });
      expect(result.current.formState.episodes[1]).toEqual({ text: '', isLie: false });
      expect(result.current.formState.episodes[2]).toEqual({ text: '', isLie: false });
    });
  });

  describe('Form Submission - Error', () => {
    it('should set errors on failed submission', async () => {
      const mockErrors = {
        nickname: ['ニックネームは必須です'],
      };

      mockAddPresenterWithEpisodesAction.mockResolvedValue({
        success: false,
        errors: mockErrors,
      });

      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      await act(async () => {
        await result.current.submit();
      });

      expect(result.current.errors).toEqual(mockErrors);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSuccess).toBe(false);
    });

    it('should handle exception during submission', async () => {
      const errorMessage = 'ネットワークエラー';
      mockAddPresenterWithEpisodesAction.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateNickname('太郎');
        result.current.updateEpisodeText(0, 'エピソード1');
        result.current.updateEpisodeText(1, 'エピソード2');
        result.current.updateEpisodeText(2, 'エピソード3');
        result.current.updateEpisodeIsLie(0, true);
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(result.current.errors).toEqual({
        _form: [errorMessage],
      });
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSuccess).toBe(false);
    });

    it('should not reset form on failed submission', async () => {
      mockAddPresenterWithEpisodesAction.mockResolvedValue({
        success: false,
        errors: { nickname: ['エラー'] },
      });

      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateNickname('太郎');
        result.current.updateEpisodeText(0, 'エピソード1');
      });

      await act(async () => {
        await result.current.submit();
      });

      // Form state should be preserved
      expect(result.current.formState.nickname).toBe('太郎');
      expect(result.current.formState.episodes[0].text).toBe('エピソード1');
    });
  });

  describe('State Management', () => {
    it('should maintain form state across multiple updates', () => {
      const { result } = renderHook(() => usePresenterWithEpisodesForm(gameId));

      act(() => {
        result.current.updateNickname('太郎');
      });

      act(() => {
        result.current.updateEpisodeText(0, 'エピソード1');
      });

      act(() => {
        result.current.updateEpisodeText(1, 'エピソード2');
      });

      act(() => {
        result.current.updateEpisodeIsLie(1, true);
      });

      expect(result.current.formState).toEqual({
        gameId: 'game-123',
        nickname: '太郎',
        episodes: [
          { text: 'エピソード1', isLie: false },
          { text: 'エピソード2', isLie: true },
          { text: '', isLie: false },
        ],
      });
    });
  });
});
