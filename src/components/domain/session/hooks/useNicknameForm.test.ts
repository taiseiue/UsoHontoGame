// Hook Tests: useNicknameForm
// Feature: 001-session-top-page
// Tests for nickname form hook with validation and session management

import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { useNicknameForm } from './useNicknameForm';

// Mock server action
vi.mock('@/app/actions/session', () => ({
  setNicknameAction: vi.fn(),
}));

import { setNicknameAction } from '@/app/actions/session';

const mockSetNicknameAction = setNicknameAction as Mock;

describe('useNicknameForm', () => {
  // Mock window.location.reload
  const originalLocation = window.location;
  let reloadMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.location.reload
    reloadMock = vi.fn();
    delete (window as { location?: Location }).location;
    window.location = { ...originalLocation, reload: reloadMock };
  });

  afterEach(() => {
    // Restore original window.location
    window.location = originalLocation;
  });

  describe('Initial State', () => {
    it('should return initial state values', () => {
      const { result } = renderHook(() => useNicknameForm());

      expect(result.current.nickname).toBe('');
      expect(result.current.error).toBe(null);
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should provide handleChange function', () => {
      const { result } = renderHook(() => useNicknameForm());

      expect(result.current.handleChange).toBeInstanceOf(Function);
    });

    it('should provide handleSubmit function', () => {
      const { result } = renderHook(() => useNicknameForm());

      expect(result.current.handleSubmit).toBeInstanceOf(Function);
    });
  });

  describe('handleChange', () => {
    it('should update nickname value', () => {
      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('太郎');
      });

      expect(result.current.nickname).toBe('太郎');
    });

    it('should handle empty string', () => {
      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('');
      });

      expect(result.current.nickname).toBe('');
    });

    it('should handle Japanese characters', () => {
      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('山田太郎');
      });

      expect(result.current.nickname).toBe('山田太郎');
    });

    it('should handle spaces in nickname', () => {
      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('John Doe');
      });

      expect(result.current.nickname).toBe('John Doe');
    });

    it('should update nickname multiple times', () => {
      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('太');
      });
      expect(result.current.nickname).toBe('太');

      act(() => {
        result.current.handleChange('太郎');
      });
      expect(result.current.nickname).toBe('太郎');

      act(() => {
        result.current.handleChange('山田太郎');
      });
      expect(result.current.nickname).toBe('山田太郎');
    });

    it('should clear error when user starts typing', () => {
      const { result } = renderHook(() => useNicknameForm());

      // Set an error first by submitting empty form
      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.error).toBe('ニックネームを入力してください');

      // Error should clear when user types
      act(() => {
        result.current.handleChange('太郎');
      });

      expect(result.current.error).toBe(null);
      expect(result.current.nickname).toBe('太郎');
    });

    it('should not modify error state if no error exists', () => {
      const { result } = renderHook(() => useNicknameForm());

      // No error initially
      expect(result.current.error).toBe(null);

      act(() => {
        result.current.handleChange('太郎');
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('Client-side Validation', () => {
    it('should show error when nickname is empty', async () => {
      const { result } = renderHook(() => useNicknameForm());

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.error).toBe('ニックネームを入力してください');
    });

    it('should show error when nickname is only whitespace', async () => {
      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('   ');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.error).toBe('ニックネームを入力してください');
    });

    it('should show error when nickname is tabs and spaces', async () => {
      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange(' \t\n  ');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.error).toBe('ニックネームを入力してください');
    });

    it('should not call server action when validation fails', async () => {
      const { result } = renderHook(() => useNicknameForm());

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockSetNicknameAction).not.toHaveBeenCalled();
    });

    it('should accept valid nickname', async () => {
      mockSetNicknameAction.mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('太郎');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      // No validation error
      expect(result.current.error).toBe(null);
    });

    it('should accept nickname with leading/trailing whitespace after trim', async () => {
      mockSetNicknameAction.mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange(' 太郎 ');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      // Should pass validation (trimmed value is not empty)
      expect(mockSetNicknameAction).toHaveBeenCalled();
    });
  });

  describe('Server Action - Success', () => {
    beforeEach(() => {
      mockSetNicknameAction.mockResolvedValue({
        success: true,
      });
    });

    it('should call server action with nickname', async () => {
      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('太郎');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(mockSetNicknameAction).toHaveBeenCalledWith('太郎');
      });
    });

    it('should reload page on success', async () => {
      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('太郎');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(reloadMock).toHaveBeenCalled();
      });
    });

    it('should not set error on success', async () => {
      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('太郎');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(reloadMock).toHaveBeenCalled();
      });

      expect(result.current.error).toBe(null);
    });

    it('should handle Japanese characters in nickname', async () => {
      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('山田太郎');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(mockSetNicknameAction).toHaveBeenCalledWith('山田太郎');
      });
    });

    it('should handle English characters in nickname', async () => {
      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('John Doe');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(mockSetNicknameAction).toHaveBeenCalledWith('John Doe');
      });
    });
  });

  describe('Server Action - Error', () => {
    beforeEach(() => {
      mockSetNicknameAction.mockResolvedValue({
        success: false,
        error: {
          message: 'ニックネームは1文字以上50文字以内で入力してください',
        },
      });
    });

    it('should set error message from server', async () => {
      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('太郎');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('ニックネームは1文字以上50文字以内で入力してください');
      });
    });

    it('should not reload page on error', async () => {
      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('太郎');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('ニックネームは1文字以上50文字以内で入力してください');
      });

      expect(reloadMock).not.toHaveBeenCalled();
    });

    it('should handle different error messages', async () => {
      mockSetNicknameAction.mockResolvedValue({
        success: false,
        error: {
          message: 'カスタムエラーメッセージ',
        },
      });

      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('太郎');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('カスタムエラーメッセージ');
      });
    });

    it('should allow retry after error', async () => {
      const { result } = renderHook(() => useNicknameForm());

      // First attempt - fails
      act(() => {
        result.current.handleChange('太郎');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('ニックネームは1文字以上50文字以内で入力してください');
      });

      // Update to success
      mockSetNicknameAction.mockResolvedValue({
        success: true,
      });

      // Modify nickname to clear error
      act(() => {
        result.current.handleChange('花子');
      });

      expect(result.current.error).toBe(null);

      // Second attempt - succeeds
      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(reloadMock).toHaveBeenCalled();
      });
    });
  });

  describe('Transition State', () => {
    it('should set isSubmitting to true during async operation', async () => {
      // Mock action to have a delay
      let resolveAction: (value: any) => void;
      const actionPromise = new Promise((resolve) => {
        resolveAction = resolve;
      });

      vi.mocked(setNicknameAction).mockImplementation(() => actionPromise as any);

      const { result } = renderHook(() => useNicknameForm());

      // Set valid nickname
      act(() => {
        result.current.handleChange('TestUser');
      });

      expect(result.current.isSubmitting).toBe(false);

      // Start submission (don't await yet)
      act(() => {
        result.current.handleSubmit();
      });

      // isSubmitting should be true immediately after calling handleSubmit
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(true);
      });

      // Resolve the action
      act(() => {
        resolveAction!({ success: true });
      });

      // Wait for transition to complete
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });
    });
  });

  describe('State Transitions', () => {
    it('should transition from no error to validation error', async () => {
      const { result } = renderHook(() => useNicknameForm());

      expect(result.current.error).toBe(null);

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.error).toBe('ニックネームを入力してください');
    });

    it('should transition from validation error to no error', async () => {
      const { result } = renderHook(() => useNicknameForm());

      // Create validation error
      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.error).toBe('ニックネームを入力してください');

      // Clear error by typing
      act(() => {
        result.current.handleChange('太郎');
      });

      expect(result.current.error).toBe(null);
    });

    it('should transition from server error to no error', async () => {
      mockSetNicknameAction.mockResolvedValue({
        success: false,
        error: {
          message: 'サーバーエラー',
        },
      });

      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('太郎');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('サーバーエラー');
      });

      // Clear error by typing
      act(() => {
        result.current.handleChange('花子');
      });

      expect(result.current.error).toBe(null);
    });

    it('should maintain nickname value after validation error', async () => {
      const { result } = renderHook(() => useNicknameForm());

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.error).toBe('ニックネームを入力してください');
      expect(result.current.nickname).toBe('');
    });

    it('should maintain nickname value after server error', async () => {
      mockSetNicknameAction.mockResolvedValue({
        success: false,
        error: {
          message: 'サーバーエラー',
        },
      });

      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('太郎');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('サーバーエラー');
      });

      expect(result.current.nickname).toBe('太郎');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty nickname after previous value', () => {
      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('太郎');
      });
      expect(result.current.nickname).toBe('太郎');

      act(() => {
        result.current.handleChange('');
      });
      expect(result.current.nickname).toBe('');
    });

    it('should handle rapid nickname changes', () => {
      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('a');
        result.current.handleChange('ab');
        result.current.handleChange('abc');
        result.current.handleChange('abcd');
      });

      expect(result.current.nickname).toBe('abcd');
    });

    it('should handle special characters in nickname', async () => {
      mockSetNicknameAction.mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('User@123');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(mockSetNicknameAction).toHaveBeenCalledWith('User@123');
      });
    });

    it('should handle emoji in nickname', async () => {
      mockSetNicknameAction.mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => useNicknameForm());

      act(() => {
        result.current.handleChange('太郎😊');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(mockSetNicknameAction).toHaveBeenCalledWith('太郎😊');
      });
    });

    it('should not clear error if error is already null', () => {
      const { result } = renderHook(() => useNicknameForm());

      expect(result.current.error).toBe(null);

      act(() => {
        result.current.handleChange('太郎');
      });

      expect(result.current.error).toBe(null);
    });
  });
});
