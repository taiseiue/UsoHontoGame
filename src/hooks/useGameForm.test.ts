import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { useGameForm } from './useGameForm';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock server actions
vi.mock('@/app/actions/game', () => ({
  createGameAction: vi.fn(),
  updateGameAction: vi.fn(),
}));

// Import mocked functions
import { createGameAction, updateGameAction } from '@/app/actions/game';

const mockCreateGameAction = createGameAction as Mock;
const mockUpdateGameAction = updateGameAction as Mock;

import { useRouter } from 'next/navigation';

const mockUseRouter = useRouter as Mock;

describe('useGameForm', () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();

  // Helper function to create mock form event with FormData
  const createMockFormEvent = (fields: Record<string, string>) => {
    const formElement = document.createElement('form');

    for (const [key, value] of Object.entries(fields)) {
      const input = document.createElement('input');
      input.name = key;
      input.value = value;
      formElement.appendChild(input);
    }

    return {
      preventDefault: vi.fn(),
      currentTarget: formElement,
    } as unknown as React.FormEvent<HTMLFormElement>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
  });

  describe('initialization', () => {
    it('should initialize with default values for create mode', () => {
      const { result } = renderHook(() => useGameForm({ mode: 'create' }));

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.errors).toEqual({});
      expect(result.current.createdGame).toBeNull();
      expect(result.current.isSuccess).toBe(false);
      expect(typeof result.current.handleSubmit).toBe('function');
    });

    it('should initialize with default values for edit mode', () => {
      const { result } = renderHook(() => useGameForm({ mode: 'edit', gameId: 'game-123' }));

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.errors).toEqual({});
      expect(result.current.createdGame).toBeNull();
      expect(result.current.isSuccess).toBe(false);
    });

    it('should initialize with default mode when not specified', () => {
      const { result } = renderHook(() => useGameForm());

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.errors).toEqual({});
    });
  });

  describe('mode detection', () => {
    it('should accept create mode', () => {
      const { result } = renderHook(() => useGameForm({ mode: 'create' }));
      expect(typeof result.current.handleSubmit).toBe('function');
    });

    it('should accept edit mode with gameId', () => {
      const { result } = renderHook(() => useGameForm({ mode: 'edit', gameId: 'game-123' }));
      expect(typeof result.current.handleSubmit).toBe('function');
    });
  });

  describe('return values', () => {
    it('should return all required properties', () => {
      const { result } = renderHook(() => useGameForm({ mode: 'create' }));

      expect(result.current).toHaveProperty('handleSubmit');
      expect(result.current).toHaveProperty('isSubmitting');
      expect(result.current).toHaveProperty('errors');
      expect(result.current).toHaveProperty('createdGame');
      expect(result.current).toHaveProperty('isSuccess');
    });

    it('should have correct types for return values', () => {
      const { result } = renderHook(() => useGameForm({ mode: 'create' }));

      expect(typeof result.current.handleSubmit).toBe('function');
      expect(typeof result.current.isSubmitting).toBe('boolean');
      expect(typeof result.current.errors).toBe('object');
      expect(
        result.current.createdGame === null || typeof result.current.createdGame === 'object'
      ).toBe(true);
      expect(typeof result.current.isSuccess).toBe('boolean');
    });
  });

  describe('error state', () => {
    it('should start with empty errors object', () => {
      const { result } = renderHook(() => useGameForm({ mode: 'create' }));
      expect(result.current.errors).toEqual({});
    });
  });

  describe('success state', () => {
    it('should start with isSuccess false', () => {
      const { result } = renderHook(() => useGameForm({ mode: 'create' }));
      expect(result.current.isSuccess).toBe(false);
    });

    it('should start with createdGame null', () => {
      const { result } = renderHook(() => useGameForm({ mode: 'create' }));
      expect(result.current.createdGame).toBeNull();
    });
  });

  describe('submitting state', () => {
    it('should start with isSubmitting false', () => {
      const { result } = renderHook(() => useGameForm({ mode: 'create' }));
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('handleSubmit', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe('form submission', () => {
      it('should call preventDefault on form event', async () => {
        const { result } = renderHook(() => useGameForm({ mode: 'create' }));
        const mockEvent = createMockFormEvent({ playerLimit: '10' });

        await act(async () => {
          await result.current.handleSubmit(mockEvent);
        });

        expect(mockEvent.preventDefault).toHaveBeenCalled();
      });

      it('should reset errors and success state on submit', async () => {
        const { result } = renderHook(() => useGameForm({ mode: 'create' }));
        const mockEvent = createMockFormEvent({ playerLimit: '10' });

        await act(async () => {
          await result.current.handleSubmit(mockEvent);
        });

        expect(result.current.isSuccess).toBe(false);
      });
    });

    describe('create mode validation', () => {
      it('should set errors when validation fails', async () => {
        const { result } = renderHook(() => useGameForm({ mode: 'create' }));
        const mockEvent = createMockFormEvent({ playerLimit: 'invalid' });

        await act(async () => {
          await result.current.handleSubmit(mockEvent);
        });

        expect(result.current.errors).toBeDefined();
        expect(result.current.isSuccess).toBe(false);
      });

      it('should not call createGameAction when validation fails', async () => {
        const { result } = renderHook(() => useGameForm({ mode: 'create' }));
        const mockEvent = createMockFormEvent({ playerLimit: '0' }); // Invalid: below minimum

        await act(async () => {
          await result.current.handleSubmit(mockEvent);
        });

        expect(mockCreateGameAction).not.toHaveBeenCalled();
      });
    });

    describe('create mode server action', () => {
      beforeEach(() => {
        mockUseRouter.mockReturnValue({
          push: vi.fn(),
          refresh: vi.fn(),
        });
      });

      it('should call createGameAction with formData when validation passes', async () => {
        mockCreateGameAction.mockResolvedValue({
          success: true,
          game: { id: 'test-game-id', name: 'Test Game' },
        });

        const { result } = renderHook(() => useGameForm({ mode: 'create' }));
        const mockEvent = createMockFormEvent({ playerLimit: '10' });

        await act(async () => {
          await result.current.handleSubmit(mockEvent);
        });

        await vi.waitFor(() => {
          expect(mockCreateGameAction).toHaveBeenCalled();
        });
      });

      it('should set createdGame and isSuccess when createGameAction succeeds', async () => {
        const mockGame = { id: 'test-game-id', name: 'Test Game' };
        mockCreateGameAction.mockResolvedValue({
          success: true,
          game: mockGame,
        });

        const { result } = renderHook(() => useGameForm({ mode: 'create' }));
        const mockEvent = createMockFormEvent({ playerLimit: '10' });

        await act(async () => {
          await result.current.handleSubmit(mockEvent);
        });

        await vi.waitFor(() => {
          expect(result.current.createdGame).toEqual(mockGame);
          expect(result.current.isSuccess).toBe(true);
        });
      });

      it('should navigate to /games after 1.5s when createGameAction succeeds', async () => {
        const mockPushLocal = vi.fn();
        mockUseRouter.mockReturnValue({
          push: mockPushLocal,
          refresh: vi.fn(),
        });

        mockCreateGameAction.mockResolvedValue({
          success: true,
          game: { id: 'test-game-id', name: 'Test Game' },
        });

        const { result } = renderHook(() => useGameForm({ mode: 'create' }));
        const mockEvent = createMockFormEvent({ playerLimit: '10' });

        await act(async () => {
          await result.current.handleSubmit(mockEvent);
        });

        await vi.waitFor(() => {
          expect(mockCreateGameAction).toHaveBeenCalled();
        });

        await act(async () => {
          await vi.advanceTimersByTimeAsync(1500);
        });

        expect(mockPushLocal).toHaveBeenCalledWith('/games');
      });

      it('should set errors when createGameAction fails', async () => {
        const mockErrors = { playerLimit: ['プレイヤー数が無効です'] };
        mockCreateGameAction.mockResolvedValue({
          success: false,
          errors: mockErrors,
        });

        const { result } = renderHook(() => useGameForm({ mode: 'create' }));
        const mockEvent = createMockFormEvent({ playerLimit: '10' });

        await act(async () => {
          await result.current.handleSubmit(mockEvent);
        });

        await vi.waitFor(() => {
          expect(result.current.errors).toEqual(mockErrors);
          expect(result.current.isSuccess).toBe(false);
        });
      });
    });

    describe('edit mode validation', () => {
      it('should set errors when validation fails in edit mode', async () => {
        const { result } = renderHook(() => useGameForm({ mode: 'edit', gameId: 'test-id' }));
        const mockEvent = createMockFormEvent({ gameId: 'test-id', playerLimit: '0' }); // Invalid

        await act(async () => {
          await result.current.handleSubmit(mockEvent);
        });

        expect(result.current.errors).toBeDefined();
        expect(result.current.isSuccess).toBe(false);
      });

      it('should not call updateGameAction when validation fails', async () => {
        const { result } = renderHook(() => useGameForm({ mode: 'edit', gameId: 'test-id' }));
        const mockEvent = createMockFormEvent({ gameId: 'test-id', playerLimit: '-1' }); // Invalid

        await act(async () => {
          await result.current.handleSubmit(mockEvent);
        });

        expect(mockUpdateGameAction).not.toHaveBeenCalled();
      });
    });

    describe('edit mode server action', () => {
      beforeEach(() => {
        mockUseRouter.mockReturnValue({
          push: vi.fn(),
          refresh: vi.fn(),
        });
      });

      it('should call updateGameAction with formData when validation passes', async () => {
        mockUpdateGameAction.mockResolvedValue({
          success: true,
        });

        const { result } = renderHook(() => useGameForm({ mode: 'edit', gameId: 'test-id' }));
        const mockEvent = createMockFormEvent({ gameId: 'test-id', playerLimit: '15' });

        await act(async () => {
          await result.current.handleSubmit(mockEvent);
        });

        await vi.waitFor(() => {
          expect(mockUpdateGameAction).toHaveBeenCalled();
        });
      });

      it('should set isSuccess when updateGameAction succeeds', async () => {
        mockUpdateGameAction.mockResolvedValue({
          success: true,
        });

        const { result } = renderHook(() => useGameForm({ mode: 'edit', gameId: 'test-id' }));
        const mockEvent = createMockFormEvent({ gameId: 'test-id', playerLimit: '15' });

        await act(async () => {
          await result.current.handleSubmit(mockEvent);
        });

        await vi.waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });
      });

      it('should call router.refresh after 1s when updateGameAction succeeds', async () => {
        const mockRefreshLocal = vi.fn();
        mockUseRouter.mockReturnValue({
          push: vi.fn(),
          refresh: mockRefreshLocal,
        });

        mockUpdateGameAction.mockResolvedValue({
          success: true,
        });

        const { result } = renderHook(() => useGameForm({ mode: 'edit', gameId: 'test-id' }));
        const mockEvent = createMockFormEvent({ gameId: 'test-id', playerLimit: '15' });

        await act(async () => {
          await result.current.handleSubmit(mockEvent);
        });

        await vi.waitFor(() => {
          expect(mockUpdateGameAction).toHaveBeenCalled();
        });

        await act(async () => {
          await vi.advanceTimersByTimeAsync(1000);
        });

        expect(mockRefreshLocal).toHaveBeenCalled();
      });

      it('should set errors when updateGameAction fails', async () => {
        const mockErrors = { gameId: ['ゲームが見つかりません'] };
        mockUpdateGameAction.mockResolvedValue({
          success: false,
          errors: mockErrors,
        });

        const { result } = renderHook(() => useGameForm({ mode: 'edit', gameId: 'test-id' }));
        const mockEvent = createMockFormEvent({ gameId: 'test-id', playerLimit: '15' });

        await act(async () => {
          await result.current.handleSubmit(mockEvent);
        });

        await vi.waitFor(() => {
          expect(result.current.errors).toEqual(mockErrors);
          expect(result.current.isSuccess).toBe(false);
        });
      });
    });

    describe('error handling', () => {
      it('should catch and handle unexpected errors in create mode', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockCreateGameAction.mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useGameForm({ mode: 'create' }));
        const mockEvent = createMockFormEvent({ playerLimit: '10' });

        await act(async () => {
          await result.current.handleSubmit(mockEvent);
        });

        await vi.waitFor(() => {
          expect(result.current.errors).toEqual({
            _form: ['予期しないエラーが発生しました'],
          });
          expect(consoleErrorSpy).toHaveBeenCalledWith('Form submission error:', expect.any(Error));
        });

        consoleErrorSpy.mockRestore();
      });

      it('should catch and handle unexpected errors in edit mode', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockUpdateGameAction.mockRejectedValue(new Error('Server error'));

        const { result } = renderHook(() => useGameForm({ mode: 'edit', gameId: 'test-id' }));
        const mockEvent = createMockFormEvent({ gameId: 'test-id', playerLimit: '15' });

        await act(async () => {
          await result.current.handleSubmit(mockEvent);
        });

        await vi.waitFor(() => {
          expect(result.current.errors).toEqual({
            _form: ['予期しないエラーが発生しました'],
          });
          expect(consoleErrorSpy).toHaveBeenCalledWith('Form submission error:', expect.any(Error));
        });

        consoleErrorSpy.mockRestore();
      });
    });
  });
});
