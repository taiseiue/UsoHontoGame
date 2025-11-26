import { renderHook } from '@testing-library/react';
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

import { useRouter } from 'next/navigation';

const mockUseRouter = useRouter as Mock;

describe('useGameForm', () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();

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
});
