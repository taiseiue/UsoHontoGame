import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';
import { GameStatusBadge, GameStatusBadgeLarge } from './GameStatusBadge';

// Mock animation sequences
vi.mock('@/lib/animations', () => ({
  animationSequences: {
    statusBadgeUpdate: vi.fn((_element, callback) => {
      callback();
      return Promise.resolve();
    }),
  },
}));

// Test wrapper with AccessibilityProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AccessibilityProvider>{children}</AccessibilityProvider>
);

describe('GameStatusBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe('status display states', () => {
    it('should display 準備中 status with yellow styling', () => {
      render(
        <TestWrapper>
          <GameStatusBadge status="準備中" />
        </TestWrapper>
      );

      const badge = screen.getByText('準備中');
      expect(badge).toHaveTextContent('準備中');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800', 'border-yellow-200');
      expect(badge).toHaveAttribute('aria-label', 'ゲームは準備中です');
    });

    it('should display 出題中 status with green styling', () => {
      render(
        <TestWrapper>
          <GameStatusBadge status="出題中" />
        </TestWrapper>
      );

      const badge = screen.getByText('出題中');
      expect(badge).toHaveTextContent('出題中');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800', 'border-green-200');
      expect(badge).toHaveAttribute('aria-label', 'ゲームは出題中です');
    });

    it('should display 締切 status with gray styling', () => {
      render(
        <TestWrapper>
          <GameStatusBadge status="締切" />
        </TestWrapper>
      );

      const badge = screen.getByText('締切');
      expect(badge).toHaveTextContent('締切');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800', 'border-gray-200');
      expect(badge).toHaveAttribute('aria-label', 'ゲームは締切です');
    });

    it('should apply custom className', () => {
      render(
        <TestWrapper>
          <GameStatusBadge status="準備中" className="custom-class" />
        </TestWrapper>
      );

      const badge = screen.getByText('準備中');
      expect(badge).toHaveClass('custom-class');
    });
    it('should handle animation when animated prop is true', async () => {
      const { rerender } = render(
        <TestWrapper>
          <GameStatusBadge status="準備中" animated={true} />
        </TestWrapper>
      );

      // Change status to trigger animation
      rerender(
        <TestWrapper>
          <GameStatusBadge status="出題中" animated={true} />
        </TestWrapper>
      );

      // Verify the status changes
      expect(screen.getByText('出題中')).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      render(
        <TestWrapper>
          <GameStatusBadge status="準備中" animated={true} />
        </TestWrapper>
      );

      const badge = screen.getByText('準備中');
      expect(badge).toHaveAttribute('aria-label', 'ゲームは準備中です');
      expect(badge).toHaveAttribute('aria-live', 'polite');
      expect(badge).toHaveAttribute('role', 'status');
    });
  });

  describe('GameStatusBadgeLarge', () => {
    it('should display with larger styling for 準備中', () => {
      render(
        <TestWrapper>
          <GameStatusBadgeLarge status="準備中" />
        </TestWrapper>
      );

      const badge = screen.getByText('準備中');
      expect(badge).toHaveTextContent('準備中');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800', 'border-yellow-300');
      expect(badge).toHaveClass('px-4', 'py-2', 'text-sm', 'font-semibold', 'border-2');
    });

    it('should display with larger styling for 出題中', () => {
      render(
        <TestWrapper>
          <GameStatusBadgeLarge status="出題中" />
        </TestWrapper>
      );

      const badge = screen.getByText('出題中');
      expect(badge).toHaveTextContent('出題中');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800', 'border-green-300');
    });

    it('should display with larger styling for 締切', () => {
      render(
        <TestWrapper>
          <GameStatusBadgeLarge status="締切" />
        </TestWrapper>
      );

      const badge = screen.getByText('締切');
      expect(badge).toHaveTextContent('締切');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800', 'border-gray-300');
    });

    it('has proper accessibility attributes', () => {
      render(
        <TestWrapper>
          <GameStatusBadgeLarge status="出題中" animated={true} />
        </TestWrapper>
      );

      const badge = screen.getByText('出題中');
      expect(badge).toHaveAttribute('aria-label', 'ゲームは出題中です');
      expect(badge).toHaveAttribute('aria-live', 'polite');
      expect(badge).toHaveAttribute('role', 'status');
    });
  });
});
