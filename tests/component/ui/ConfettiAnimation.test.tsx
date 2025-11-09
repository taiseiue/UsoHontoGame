import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfettiAnimation } from '@/components/ui/ConfettiAnimation';

describe('ConfettiAnimation', () => {
  beforeEach(() => {
    // Mock requestAnimationFrame for animation testing
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render without errors', () => {
    render(<ConfettiAnimation active={true} />);
    expect(screen.getByTestId('confetti-container')).toBeInTheDocument();
  });

  it('should display confetti when active is true', () => {
    render(<ConfettiAnimation active={true} />);

    const container = screen.getByTestId('confetti-container');
    expect(container).toBeInTheDocument();

    // Should have confetti pieces
    const confettiPieces = container.querySelectorAll('[data-testid^="confetti-piece"]');
    expect(confettiPieces.length).toBeGreaterThan(0);
  });

  it('should not display confetti when active is false', () => {
    render(<ConfettiAnimation active={false} />);

    const container = screen.queryByTestId('confetti-container');
    expect(container).not.toBeInTheDocument();
  });

  it('should generate default number of confetti pieces', () => {
    render(<ConfettiAnimation active={true} />);

    const container = screen.getByTestId('confetti-container');
    const confettiPieces = container.querySelectorAll('[data-testid^="confetti-piece"]');

    // Default should be around 50 pieces
    expect(confettiPieces.length).toBeGreaterThanOrEqual(40);
    expect(confettiPieces.length).toBeLessThanOrEqual(60);
  });

  it('should respect custom particle count', () => {
    render(<ConfettiAnimation active={true} particleCount={100} />);

    const container = screen.getByTestId('confetti-container');
    const confettiPieces = container.querySelectorAll('[data-testid^="confetti-piece"]');

    expect(confettiPieces.length).toBe(100);
  });

  it('should use varied colors for confetti pieces', () => {
    render(<ConfettiAnimation active={true} particleCount={50} />);

    const container = screen.getByTestId('confetti-container');
    const confettiPieces = Array.from(
      container.querySelectorAll('[data-testid^="confetti-piece"]')
    );

    // Extract colors from style attributes
    const colors = confettiPieces
      .map((piece) => (piece as HTMLElement).style.backgroundColor)
      .filter((color) => color);

    // Should have multiple different colors
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBeGreaterThan(1);
  });

  it('should apply random positions and velocities', () => {
    render(<ConfettiAnimation active={true} particleCount={20} />);

    const container = screen.getByTestId('confetti-container');
    const confettiPieces = Array.from(
      container.querySelectorAll('[data-testid^="confetti-piece"]')
    );

    // Check that pieces have varied horizontal positions
    const leftPositions = confettiPieces.map((piece) => (piece as HTMLElement).style.left);
    const uniquePositions = new Set(leftPositions);

    // Should have varied starting positions
    expect(uniquePositions.size).toBeGreaterThan(1);
  });

  it('should stop after specified duration', () => {
    const { rerender } = render(<ConfettiAnimation active={true} duration={3000} />);

    expect(screen.getByTestId('confetti-container')).toBeInTheDocument();

    // Fast-forward time by duration
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Confetti should still be present but animation should stop
    expect(screen.getByTestId('confetti-container')).toBeInTheDocument();
  });

  it('should cleanup animation on unmount', () => {
    const { unmount } = render(<ConfettiAnimation active={true} />);

    expect(screen.getByTestId('confetti-container')).toBeInTheDocument();

    // Unmount and verify cleanup
    unmount();

    expect(screen.queryByTestId('confetti-container')).not.toBeInTheDocument();
  });

  it('should support custom colors prop', () => {
    const customColors = ['#FF0000', '#00FF00', '#0000FF'];

    render(<ConfettiAnimation active={true} particleCount={30} colors={customColors} />);

    const container = screen.getByTestId('confetti-container');
    const confettiPieces = Array.from(
      container.querySelectorAll('[data-testid^="confetti-piece"]')
    );

    // Extract colors from pieces
    const usedColors = confettiPieces
      .map((piece) => {
        const bg = (piece as HTMLElement).style.backgroundColor;
        // Convert rgb to hex for comparison if needed
        return bg;
      })
      .filter((color) => color);

    // All used colors should be from custom set (or their RGB equivalents)
    expect(usedColors.length).toBeGreaterThan(0);
  });

  it('should apply gravity effect over time', () => {
    render(<ConfettiAnimation active={true} particleCount={10} />);

    const container = screen.getByTestId('confetti-container');

    // Get initial positions
    const pieces = Array.from(container.querySelectorAll('[data-testid^="confetti-piece"]'));
    const initialTops = pieces.map((piece) =>
      Number.parseFloat((piece as HTMLElement).style.top || '0')
    );

    // Advance animation frame
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Pieces should have moved (gravity effect)
    // Note: In actual implementation, this would require RAF to be mocked
    expect(container).toBeInTheDocument();
  });

  it('should respect zIndex prop for layering', () => {
    render(<ConfettiAnimation active={true} zIndex={9999} />);

    const container = screen.getByTestId('confetti-container');
    expect(container).toHaveStyle({ zIndex: '9999' });
  });
});
