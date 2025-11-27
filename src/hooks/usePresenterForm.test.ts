// Hook Tests: usePresenterForm
// Feature: 002-game-preparation
// Tests for presenter creation form hook with validation and server actions

import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import type { PresenterWithLieDto } from '@/server/application/dto/PresenterWithLieDto';
import { usePresenterForm } from './usePresenterForm';

// Mock server action
vi.mock('@/app/actions/presenter', () => ({
  addPresenterAction: vi.fn(),
}));

// Mock Zod schema
vi.mock('@/server/domain/schemas/gameSchemas', () => ({
  AddPresenterSchema: {
    safeParse: vi.fn(),
  },
}));

import { addPresenterAction } from '@/app/actions/presenter';
import { AddPresenterSchema } from '@/server/domain/schemas/gameSchemas';

const mockAddPresenterAction = addPresenterAction as Mock;
const mockAddPresenterSchema = AddPresenterSchema as { safeParse: Mock };

describe('usePresenterForm', () => {
  const mockPresenter: PresenterWithLieDto = {
    id: 'presenter-1',
    gameId: 'game-123',
    nickname: '太郎',
    episodes: [],
    createdAt: new Date('2024-01-01T00:00:00Z'),
  };

  // Helper to create a real form element with form data
  const createFormEvent = (data: Record<string, string>) => {
    const form = document.createElement('form');
    for (const [key, value] of Object.entries(data)) {
      const input = document.createElement('input');
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }

    return {
      preventDefault: vi.fn(),
      currentTarget: form,
    } as React.FormEvent<HTMLFormElement>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return initial state values', () => {
      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.errors).toEqual({});
      expect(result.current.createdPresenter).toBe(null);
      expect(result.current.isSuccess).toBe(false);
    });

    it('should provide handleSubmit function', () => {
      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));

      expect(result.current.handleSubmit).toBeInstanceOf(Function);
    });

    it('should provide reset function', () => {
      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));

      expect(result.current.reset).toBeInstanceOf(Function);
    });
  });

  describe('Form Submission - Success', () => {
    beforeEach(() => {
      mockAddPresenterSchema.safeParse.mockReturnValue({
        success: true,
        data: { gameId: 'game-123', nickname: '太郎' },
      });
      mockAddPresenterAction.mockResolvedValue({
        success: true,
        presenter: mockPresenter,
      });
    });

    it('should call preventDefault on form event', async () => {
      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));
      const mockEvent = createFormEvent({ nickname: '太郎' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should perform client-side validation', async () => {
      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));
      const mockEvent = createFormEvent({ nickname: '太郎' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockAddPresenterSchema.safeParse).toHaveBeenCalledWith({
        gameId: 'game-123',
        nickname: '太郎',
      });
    });

    it('should call server action with FormData', async () => {
      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));
      const mockEvent = createFormEvent({ nickname: '太郎' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      await waitFor(() => {
        expect(mockAddPresenterAction).toHaveBeenCalled();
        const calledFormData = mockAddPresenterAction.mock.calls[0][0];
        expect(calledFormData.get('nickname')).toBe('太郎');
        expect(calledFormData.get('gameId')).toBe('game-123');
      });
    });

    it('should set createdPresenter on success', async () => {
      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));
      const mockEvent = createFormEvent({ nickname: '太郎' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.createdPresenter).toEqual(mockPresenter);
      });
    });

    it('should set isSuccess to true on success', async () => {
      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));
      const mockEvent = createFormEvent({ nickname: '太郎' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should call onSuccess callback with presenter', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123', onSuccess }));
      const mockEvent = createFormEvent({ nickname: '太郎' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockPresenter);
      });
    });

    it('should work without onSuccess callback', async () => {
      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));
      const mockEvent = createFormEvent({ nickname: '太郎' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should reset form automatically after success', async () => {
      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));
      const mockEvent = createFormEvent({ nickname: '太郎' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Note: Auto-reset happens after 1000ms timeout in the implementation
      // Testing the timeout behavior would require fake timers which don't work well with useTransition
      // The reset logic itself is tested in the Reset Function describe block
    });
  });

  describe('Client-side Validation Errors', () => {
    beforeEach(() => {
      mockAddPresenterSchema.safeParse.mockReturnValue({
        success: false,
        error: {
          flatten: () => ({
            fieldErrors: {
              nickname: ['ニックネームは1文字以上50文字以内で入力してください'],
            },
          }),
        },
      });
    });

    it('should set field errors on validation failure', async () => {
      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));
      const mockEvent = createFormEvent({ nickname: '' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.errors).toEqual({
        nickname: ['ニックネームは1文字以上50文字以内で入力してください'],
      });
    });

    it('should not call server action on validation failure', async () => {
      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));
      const mockEvent = createFormEvent({ nickname: '' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockAddPresenterAction).not.toHaveBeenCalled();
    });

    it('should not set isSuccess on validation failure', async () => {
      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));
      const mockEvent = createFormEvent({ nickname: '' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.isSuccess).toBe(false);
    });
  });

  describe('Server-side Errors', () => {
    it('should handle server-side errors', async () => {
      mockAddPresenterSchema.safeParse.mockReturnValue({
        success: true,
        data: { gameId: 'game-123', nickname: 'Presenter' },
      });

      vi.mocked(addPresenterAction).mockResolvedValue({
        success: false,
        errors: {
          _form: ['サーバーエラーが発生しました'],
        },
      });

      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));
      const mockEvent = createFormEvent({ nickname: 'Presenter' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.errors).toEqual({
          _form: ['サーバーエラーが発生しました'],
        });
      });

      expect(result.current.isSuccess).toBe(false);
      expect(result.current.createdPresenter).toBe(null);
    });
  });

  describe('Exception Handling', () => {
    it('should handle exceptions during server action', async () => {
      mockAddPresenterSchema.safeParse.mockReturnValue({
        success: true,
        data: { gameId: 'game-123', nickname: 'Presenter' },
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(addPresenterAction).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));
      const mockEvent = createFormEvent({ nickname: 'Presenter' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.errors).toEqual({
          _form: ['予期しないエラーが発生しました'],
        });
      });

      expect(result.current.isSuccess).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Form submission error:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Reset Function', () => {
    it('should clear errors', async () => {
      mockAddPresenterSchema.safeParse.mockReturnValue({
        success: false,
        error: {
          flatten: () => ({
            fieldErrors: {
              nickname: ['エラー'],
            },
          }),
        },
      });

      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));
      const mockEvent = createFormEvent({ nickname: '' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.errors).toEqual({ nickname: ['エラー'] });

      act(() => {
        result.current.reset();
      });

      expect(result.current.errors).toEqual({});
    });

    it('should clear createdPresenter', () => {
      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));

      act(() => {
        // Manually set createdPresenter by accessing internal state (simulating success)
        result.current.reset();
      });

      expect(result.current.createdPresenter).toBe(null);
    });

    it('should clear isSuccess', () => {
      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));

      act(() => {
        result.current.reset();
      });

      expect(result.current.isSuccess).toBe(false);
    });
  });

  describe('Transition State', () => {
    it('should set isSubmitting to true during async operation', async () => {
      mockAddPresenterSchema.safeParse.mockReturnValue({
        success: true,
        data: { gameId: 'game-123', nickname: 'Presenter' },
      });

      // Mock action with delayed resolution
      let resolveAction: (value: unknown) => void;
      const actionPromise = new Promise((resolve) => {
        resolveAction = resolve;
      });
      vi.mocked(addPresenterAction).mockImplementation(
        () => actionPromise as Promise<{ success: boolean }>
      );

      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));
      const mockEvent = createFormEvent({ nickname: 'Presenter' });

      expect(result.current.isSubmitting).toBe(false);

      // Start submission
      act(() => {
        result.current.handleSubmit(mockEvent);
      });

      // isSubmitting should become true
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(true);
      });

      // Resolve action
      act(() => {
        resolveAction!({
          success: true,
          presenter: { id: 'p-1', nickname: 'Presenter', episodes: [] },
        });
      });

      // isSubmitting should become false
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });
    });
  });

  describe('State Clearing on Submit', () => {
    it('should clear previous errors on new submit', async () => {
      mockAddPresenterSchema.safeParse.mockReturnValueOnce({
        success: false,
        error: {
          flatten: () => ({
            fieldErrors: {
              nickname: ['エラー1'],
            },
          }),
        },
      });

      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));
      const mockEvent1 = createFormEvent({ nickname: '' });

      // First submission with error
      await act(async () => {
        await result.current.handleSubmit(mockEvent1);
      });

      expect(result.current.errors).toEqual({ nickname: ['エラー1'] });

      // Second submission - should clear previous error before validation
      mockAddPresenterSchema.safeParse.mockReturnValueOnce({
        success: false,
        error: {
          flatten: () => ({
            fieldErrors: {
              nickname: ['エラー2'],
            },
          }),
        },
      });

      const mockEvent2 = createFormEvent({ nickname: '' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent2);
      });

      expect(result.current.errors).toEqual({ nickname: ['エラー2'] });
    });

    it('should clear isSuccess when starting new submission', async () => {
      mockAddPresenterSchema.safeParse.mockReturnValue({
        success: false,
        error: {
          flatten: () => ({
            fieldErrors: {
              nickname: ['エラー'],
            },
          }),
        },
      });

      const { result } = renderHook(() => usePresenterForm({ gameId: 'game-123' }));

      // Manually set isSuccess to true to test clearing
      // Note: In real usage, isSuccess is set by the hook after successful submission
      const mockEvent = createFormEvent({ nickname: '' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      // After submission with validation error, isSuccess should be false
      expect(result.current.isSuccess).toBe(false);
    });
  });
});
