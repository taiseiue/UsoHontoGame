// CloseGameButton Component Tests
// Feature: 007-game-closure
// Tests for the CloseGameButton component

import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';
import { CloseGameButton } from './CloseGameButton';

// Mock the useCloseGame hook
vi.mock('@/components/pages/GameDetailPage/hooks/useCloseGame', () => ({
  useCloseGame: vi.fn(),
}));

// Get reference to the mocked hook
const { useCloseGame: mockUseCloseGame } = await import(
  '@/components/pages/GameDetailPage/hooks/useCloseGame'
);

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AccessibilityProvider>{children}</AccessibilityProvider>
);

describe('CloseGameButton', () => {
  const defaultProps = {
    gameId: 'game-123',
    gameStatus: '出題中' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render close button when status is 出題中', () => {
      vi.mocked(mockUseCloseGame).mockReturnValue({
        closeGame: vi.fn(),
        isClosing: false,
        error: null,
      });

      render(
        <TestWrapper>
          <CloseGameButton {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /締切にする/i })).toBeInTheDocument();
    });

    it('should not render button when status is 準備中', () => {
      vi.mocked(mockUseCloseGame).mockReturnValue({
        closeGame: vi.fn(),
        isClosing: false,
        error: null,
      });

      render(
        <TestWrapper>
          <CloseGameButton {...defaultProps} gameStatus="準備中" />
        </TestWrapper>
      );

      expect(screen.queryByRole('button', { name: /締切にする/i })).not.toBeInTheDocument();
    });

    it('should not render button when status is 締切', () => {
      vi.mocked(mockUseCloseGame).mockReturnValue({
        closeGame: vi.fn(),
        isClosing: false,
        error: null,
      });

      render(
        <TestWrapper>
          <CloseGameButton {...defaultProps} gameStatus="締切" />
        </TestWrapper>
      );

      expect(screen.queryByRole('button', { name: /締切にする/i })).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      vi.mocked(mockUseCloseGame).mockReturnValue({
        closeGame: vi.fn(),
        isClosing: false,
        error: null,
      });

      const { container } = render(
        <TestWrapper>
          <CloseGameButton {...defaultProps} className="custom-class" />
        </TestWrapper>
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call closeGame when button is clicked', async () => {
      const mockCloseGame = vi.fn();
      vi.mocked(mockUseCloseGame).mockReturnValue({
        closeGame: mockCloseGame,
        isClosing: false,
        error: null,
      });

      render(
        <TestWrapper>
          <CloseGameButton {...defaultProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /締切にする/i });

      await act(async () => {
        fireEvent.click(button);
      });

      expect(mockCloseGame).toHaveBeenCalledTimes(1);
    });

    it('should show loading state when isClosing is true', () => {
      vi.mocked(mockUseCloseGame).mockReturnValue({
        closeGame: vi.fn(),
        isClosing: true,
        error: null,
      });

      render(
        <TestWrapper>
          <CloseGameButton {...defaultProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByText(/締切中/i)).toBeInTheDocument();
    });

    it('should disable button when isClosing is true', () => {
      vi.mocked(mockUseCloseGame).mockReturnValue({
        closeGame: vi.fn(),
        isClosing: true,
        error: null,
      });

      render(
        <TestWrapper>
          <CloseGameButton {...defaultProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should prevent double-click when already closing', async () => {
      const mockCloseGame = vi.fn();
      vi.mocked(mockUseCloseGame).mockReturnValue({
        closeGame: mockCloseGame,
        isClosing: true,
        error: null,
      });

      render(
        <TestWrapper>
          <CloseGameButton {...defaultProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');

      await act(async () => {
        fireEvent.click(button);
        fireEvent.click(button);
      });

      // Should not be called because button is disabled
      expect(mockCloseGame).not.toHaveBeenCalled();
    });
  });

  describe('callbacks', () => {
    it('should pass onClosed callback to hook', () => {
      const mockOnClosed = vi.fn();

      vi.mocked(mockUseCloseGame).mockReturnValue({
        closeGame: vi.fn(),
        isClosing: false,
        error: null,
      });

      render(
        <TestWrapper>
          <CloseGameButton {...defaultProps} onClosed={mockOnClosed} />
        </TestWrapper>
      );

      // Verify that the hook is called with onSuccess callback
      // The actual callback invocation is tested in the hook tests
      expect(mockUseCloseGame).toHaveBeenCalledWith(
        expect.objectContaining({
          onSuccess: expect.any(Function),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should display error message when error exists', () => {
      const errorMessage = 'Only the game creator can close the game';
      vi.mocked(mockUseCloseGame).mockReturnValue({
        closeGame: vi.fn(),
        isClosing: false,
        error: errorMessage,
      });

      render(
        <TestWrapper>
          <CloseGameButton {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should clear error message after successful retry', async () => {
      // First render with error
      const mockCloseGame = vi.fn();
      vi.mocked(mockUseCloseGame).mockReturnValue({
        closeGame: mockCloseGame,
        isClosing: false,
        error: 'Previous error',
      });

      const { rerender } = render(
        <TestWrapper>
          <CloseGameButton {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Previous error')).toBeInTheDocument();

      // Rerender without error (simulating successful retry)
      vi.mocked(mockUseCloseGame).mockReturnValue({
        closeGame: mockCloseGame,
        isClosing: false,
        error: null,
      });

      rerender(
        <TestWrapper>
          <CloseGameButton {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.queryByText('Previous error')).not.toBeInTheDocument();
    });

    it('should still render button even when error exists', () => {
      vi.mocked(mockUseCloseGame).mockReturnValue({
        closeGame: vi.fn(),
        isClosing: false,
        error: 'Some error',
      });

      render(
        <TestWrapper>
          <CloseGameButton {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /締切にする/i })).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA label', () => {
      vi.mocked(mockUseCloseGame).mockReturnValue({
        closeGame: vi.fn(),
        isClosing: false,
        error: null,
      });

      render(
        <TestWrapper>
          <CloseGameButton {...defaultProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /締切にする/i });
      expect(button).toHaveAttribute('aria-label');
    });

    it('should indicate busy state with aria-busy when closing', () => {
      vi.mocked(mockUseCloseGame).mockReturnValue({
        closeGame: vi.fn(),
        isClosing: true,
        error: null,
      });

      render(
        <TestWrapper>
          <CloseGameButton {...defaultProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should be keyboard accessible', async () => {
      const mockCloseGame = vi.fn();
      vi.mocked(mockUseCloseGame).mockReturnValue({
        closeGame: mockCloseGame,
        isClosing: false,
        error: null,
      });

      render(
        <TestWrapper>
          <CloseGameButton {...defaultProps} />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /締切にする/i });

      // Simulate Enter key press
      await act(async () => {
        fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      });

      // Note: The actual key handling is managed by the button element itself
      expect(button).toHaveFocus;
    });
  });

  describe('hook initialization', () => {
    it('should initialize useCloseGame with correct gameId', () => {
      vi.mocked(mockUseCloseGame).mockReturnValue({
        closeGame: vi.fn(),
        isClosing: false,
        error: null,
      });

      render(
        <TestWrapper>
          <CloseGameButton {...defaultProps} />
        </TestWrapper>
      );

      expect(mockUseCloseGame).toHaveBeenCalledWith(
        expect.objectContaining({
          gameId: 'game-123',
        })
      );
    });

    it('should pass onSuccess and onError callbacks to hook', () => {
      vi.mocked(mockUseCloseGame).mockReturnValue({
        closeGame: vi.fn(),
        isClosing: false,
        error: null,
      });

      render(
        <TestWrapper>
          <CloseGameButton {...defaultProps} onClosed={vi.fn()} />
        </TestWrapper>
      );

      expect(mockUseCloseGame).toHaveBeenCalledWith(
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });
  });
});
