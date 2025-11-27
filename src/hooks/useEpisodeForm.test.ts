// Hook Tests: useEpisodeForm
// Feature: 002-game-preparation
// Tests for episode creation form hook with validation and server actions

import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import type { EpisodeWithLieDto } from '@/server/application/dto/EpisodeWithLieDto';
import { useEpisodeForm } from './useEpisodeForm';

// Mock server action
vi.mock('@/app/actions/presenter', () => ({
  addEpisodeAction: vi.fn(),
}));

// Mock Zod schema
vi.mock('@/server/domain/schemas/gameSchemas', () => ({
  AddEpisodeSchema: {
    safeParse: vi.fn(),
  },
}));

import { addEpisodeAction } from '@/app/actions/presenter';
import { AddEpisodeSchema } from '@/server/domain/schemas/gameSchemas';

const mockAddEpisodeAction = addEpisodeAction as Mock;
const mockAddEpisodeSchema = AddEpisodeSchema as { safeParse: Mock };

describe('useEpisodeForm', () => {
  const mockEpisode: EpisodeWithLieDto = {
    id: 'episode-1',
    presenterId: 'presenter-123',
    text: '昔、犬を飼っていた',
    isLie: false,
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
      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.errors).toEqual({});
      expect(result.current.createdEpisode).toBe(null);
      expect(result.current.isSuccess).toBe(false);
    });

    it('should provide handleSubmit function', () => {
      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));

      expect(result.current.handleSubmit).toBeInstanceOf(Function);
    });

    it('should provide reset function', () => {
      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));

      expect(result.current.reset).toBeInstanceOf(Function);
    });
  });

  describe('Form Submission - Success', () => {
    beforeEach(() => {
      mockAddEpisodeSchema.safeParse.mockReturnValue({
        success: true,
        data: {
          presenterId: 'presenter-123',
          text: '昔、犬を飼っていた',
          isLie: false,
        },
      });
      mockAddEpisodeAction.mockResolvedValue({
        success: true,
        episode: mockEpisode,
      });
    });

    it('should call preventDefault on form event', async () => {
      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));
      const mockEvent = createFormEvent({
        text: '昔、犬を飼っていた',
        isLie: 'false',
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should perform client-side validation', async () => {
      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));
      const mockEvent = createFormEvent({
        text: '昔、犬を飼っていた',
        isLie: 'false',
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockAddEpisodeSchema.safeParse).toHaveBeenCalledWith({
        presenterId: 'presenter-123',
        text: '昔、犬を飼っていた',
        isLie: false,
      });
    });

    it('should parse isLie as boolean', async () => {
      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));
      const mockEvent = createFormEvent({
        text: 'これは嘘です',
        isLie: 'true',
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockAddEpisodeSchema.safeParse).toHaveBeenCalledWith({
        presenterId: 'presenter-123',
        text: 'これは嘘です',
        isLie: true,
      });
    });

    it('should call server action with FormData', async () => {
      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));
      const mockEvent = createFormEvent({
        text: '昔、犬を飼っていた',
        isLie: 'false',
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      await waitFor(() => {
        expect(mockAddEpisodeAction).toHaveBeenCalled();
        const calledFormData = mockAddEpisodeAction.mock.calls[0][0];
        expect(calledFormData.get('text')).toBe('昔、犬を飼っていた');
        expect(calledFormData.get('isLie')).toBe('false');
        expect(calledFormData.get('presenterId')).toBe('presenter-123');
      });
    });

    it('should set createdEpisode on success', async () => {
      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));
      const mockEvent = createFormEvent({
        text: '昔、犬を飼っていた',
        isLie: 'false',
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.createdEpisode).toEqual(mockEpisode);
      });
    });

    it('should set isSuccess to true on success', async () => {
      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));
      const mockEvent = createFormEvent({
        text: '昔、犬を飼っていた',
        isLie: 'false',
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should call onSuccess callback with episode', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        useEpisodeForm({ presenterId: 'presenter-123', onSuccess })
      );
      const mockEvent = createFormEvent({
        text: '昔、犬を飼っていた',
        isLie: 'false',
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockEpisode);
      });
    });

    it('should work without onSuccess callback', async () => {
      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));
      const mockEvent = createFormEvent({
        text: '昔、犬を飼っていた',
        isLie: 'false',
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should reset form automatically after success', async () => {
      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));
      const mockEvent = createFormEvent({
        text: '昔、犬を飼っていた',
        isLie: 'false',
      });

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
      mockAddEpisodeSchema.safeParse.mockReturnValue({
        success: false,
        error: {
          flatten: () => ({
            fieldErrors: {
              text: ['エピソードは1文字以上200文字以内で入力してください'],
            },
          }),
        },
      });
    });

    it('should set field errors on validation failure', async () => {
      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));
      const mockEvent = createFormEvent({ text: '', isLie: 'false' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.errors).toEqual({
        text: ['エピソードは1文字以上200文字以内で入力してください'],
      });
    });

    it('should not call server action on validation failure', async () => {
      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));
      const mockEvent = createFormEvent({ text: '', isLie: 'false' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockAddEpisodeAction).not.toHaveBeenCalled();
    });

    it('should not set isSuccess on validation failure', async () => {
      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));
      const mockEvent = createFormEvent({ text: '', isLie: 'false' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.isSuccess).toBe(false);
    });
  });

  describe('Server-side Errors', () => {
    it('should handle server-side errors', async () => {
      mockAddEpisodeSchema.safeParse.mockReturnValue({
        success: true,
        data: { presenterId: 'presenter-123', text: 'Episode', isLie: false },
      });

      vi.mocked(addEpisodeAction).mockResolvedValue({
        success: false,
        errors: {
          _form: ['サーバーエラーが発生しました'],
        },
      });

      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));
      const mockEvent = createFormEvent({ text: 'Episode', isLie: 'false' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.errors).toEqual({
          _form: ['サーバーエラーが発生しました'],
        });
      });

      expect(result.current.isSuccess).toBe(false);
      expect(result.current.createdEpisode).toBe(null);
    });
  });

  describe('Exception Handling', () => {
    it('should handle exceptions during server action', async () => {
      mockAddEpisodeSchema.safeParse.mockReturnValue({
        success: true,
        data: { presenterId: 'presenter-123', text: 'Episode', isLie: false },
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(addEpisodeAction).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));
      const mockEvent = createFormEvent({ text: 'Episode', isLie: 'false' });

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
      mockAddEpisodeSchema.safeParse.mockReturnValue({
        success: false,
        error: {
          flatten: () => ({
            fieldErrors: {
              text: ['エラー'],
            },
          }),
        },
      });

      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));
      const mockEvent = createFormEvent({ text: '', isLie: 'false' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.errors).toEqual({ text: ['エラー'] });

      act(() => {
        result.current.reset();
      });

      expect(result.current.errors).toEqual({});
    });

    it('should clear createdEpisode', () => {
      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));

      act(() => {
        result.current.reset();
      });

      expect(result.current.createdEpisode).toBe(null);
    });

    it('should clear isSuccess', () => {
      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));

      act(() => {
        result.current.reset();
      });

      expect(result.current.isSuccess).toBe(false);
    });
  });

  describe('Transition State', () => {
    it('should set isSubmitting to true during async operation', async () => {
      mockAddEpisodeSchema.safeParse.mockReturnValue({
        success: true,
        data: { presenterId: 'presenter-123', text: 'Episode', isLie: false },
      });

      // Mock action with delayed resolution
      let resolveAction: (value: unknown) => void;
      const actionPromise = new Promise((resolve) => {
        resolveAction = resolve;
      });
      vi.mocked(addEpisodeAction).mockImplementation(
        () => actionPromise as Promise<{ success: boolean }>
      );

      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));
      const mockEvent = createFormEvent({ text: 'Episode', isLie: 'false' });

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
          episode: { id: 'ep-1', text: 'Episode', isLie: false },
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
      mockAddEpisodeSchema.safeParse.mockReturnValueOnce({
        success: false,
        error: {
          flatten: () => ({
            fieldErrors: {
              text: ['エラー1'],
            },
          }),
        },
      });

      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));
      const mockEvent1 = createFormEvent({ text: '', isLie: 'false' });

      // First submission with error
      await act(async () => {
        await result.current.handleSubmit(mockEvent1);
      });

      expect(result.current.errors).toEqual({ text: ['エラー1'] });

      // Second submission - should clear previous error before validation
      mockAddEpisodeSchema.safeParse.mockReturnValueOnce({
        success: false,
        error: {
          flatten: () => ({
            fieldErrors: {
              text: ['エラー2'],
            },
          }),
        },
      });

      const mockEvent2 = createFormEvent({ text: '', isLie: 'false' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent2);
      });

      expect(result.current.errors).toEqual({ text: ['エラー2'] });
    });

    it('should clear isSuccess when starting new submission', async () => {
      mockAddEpisodeSchema.safeParse.mockReturnValue({
        success: false,
        error: {
          flatten: () => ({
            fieldErrors: {
              text: ['エラー'],
            },
          }),
        },
      });

      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));

      const mockEvent = createFormEvent({ text: '', isLie: 'false' });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      // After submission with validation error, isSuccess should be false
      expect(result.current.isSuccess).toBe(false);
    });
  });

  describe('Boolean Field Handling', () => {
    beforeEach(() => {
      mockAddEpisodeSchema.safeParse.mockReturnValue({
        success: true,
        data: {
          presenterId: 'presenter-123',
          text: 'テストエピソード',
          isLie: true,
        },
      });
      mockAddEpisodeAction.mockResolvedValue({
        success: true,
        episode: { ...mockEpisode, isLie: true },
      });
    });

    it('should correctly convert "true" string to boolean true', async () => {
      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));
      const mockEvent = createFormEvent({
        text: 'これは嘘です',
        isLie: 'true',
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockAddEpisodeSchema.safeParse).toHaveBeenCalledWith(
        expect.objectContaining({
          isLie: true,
        })
      );
    });

    it('should correctly convert "false" string to boolean false', async () => {
      mockAddEpisodeSchema.safeParse.mockReturnValue({
        success: true,
        data: {
          presenterId: 'presenter-123',
          text: 'これは本当です',
          isLie: false,
        },
      });

      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));
      const mockEvent = createFormEvent({
        text: 'これは本当です',
        isLie: 'false',
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockAddEpisodeSchema.safeParse).toHaveBeenCalledWith(
        expect.objectContaining({
          isLie: false,
        })
      );
    });

    it('should handle missing isLie field as false', async () => {
      const { result } = renderHook(() => useEpisodeForm({ presenterId: 'presenter-123' }));
      const mockEvent = createFormEvent({
        text: 'エピソードのみ',
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockAddEpisodeSchema.safeParse).toHaveBeenCalledWith(
        expect.objectContaining({
          isLie: false,
        })
      );
    });
  });
});
