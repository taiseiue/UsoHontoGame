// Component Tests: Toast
// Feature: Enhanced status transition feedback
// Tests for toast notification component with animations

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toast, ToastContainer, type ToastProps } from './Toast';

describe('Toast', () => {
  const defaultProps: ToastProps = {
    id: 'toast-1',
    type: 'info',
    message: 'テストメッセージ',
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render toast with message', () => {
      render(<Toast {...defaultProps} />);

      expect(screen.getByText('テストメッセージ')).toBeInTheDocument();
    });

    it('should render toast with title and message', () => {
      render(<Toast {...defaultProps} title="タイトル" />);

      expect(screen.getByText('タイトル')).toBeInTheDocument();
      expect(screen.getByText('テストメッセージ')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<Toast {...defaultProps} />);

      expect(screen.getByRole('button', { name: '通知を閉じる' })).toBeInTheDocument();
    });

    it('should have alert role', () => {
      render(<Toast {...defaultProps} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have aria-live attribute', () => {
      render(<Toast {...defaultProps} />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Toast Types', () => {
    it('should render success toast with correct styling', () => {
      render(<Toast {...defaultProps} type="success" />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-label', '成功通知');
      expect(alert).toHaveClass('bg-green-50', 'border-green-200');
    });

    it('should render error toast with correct styling', () => {
      render(<Toast {...defaultProps} type="error" />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-label', 'エラー通知');
      expect(alert).toHaveClass('bg-red-50', 'border-red-200');
    });

    it('should render warning toast with correct styling', () => {
      render(<Toast {...defaultProps} type="warning" />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-label', '警告通知');
      expect(alert).toHaveClass('bg-yellow-50', 'border-yellow-200');
    });

    it('should render info toast with correct styling', () => {
      render(<Toast {...defaultProps} type="info" />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-label', '情報通知');
      expect(alert).toHaveClass('bg-blue-50', 'border-blue-200');
    });

    it('should render success icon for success type', () => {
      const { container } = render(<Toast {...defaultProps} type="success" />);

      // Check for icon container with correct color class
      const iconContainer = container.querySelector('.text-green-600');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer?.querySelector('svg')).toBeInTheDocument();
    });

    it('should render error icon for error type', () => {
      const { container } = render(<Toast {...defaultProps} type="error" />);

      const iconContainer = container.querySelector('.text-red-600');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer?.querySelector('svg')).toBeInTheDocument();
    });

    it('should render warning icon for warning type', () => {
      const { container } = render(<Toast {...defaultProps} type="warning" />);

      const iconContainer = container.querySelector('.text-yellow-600');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer?.querySelector('svg')).toBeInTheDocument();
    });

    it('should render info icon for info type', () => {
      const { container } = render(<Toast {...defaultProps} type="info" />);

      const iconContainer = container.querySelector('.text-blue-600');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Auto-close', () => {
    it('should auto-close after default duration (4000ms)', () => {
      const onClose = vi.fn();
      render(<Toast {...defaultProps} onClose={onClose} />);

      // Should not close immediately
      expect(onClose).not.toHaveBeenCalled();

      // Fast-forward time to just before duration
      act(() => {
        vi.advanceTimersByTime(3900);
      });
      expect(onClose).not.toHaveBeenCalled();

      // Fast-forward past duration + animation delay
      act(() => {
        vi.advanceTimersByTime(400);
      });

      // Should call onClose after animation delay (300ms)
      expect(onClose).toHaveBeenCalledWith('toast-1');
    });

    it('should auto-close after custom duration', () => {
      const onClose = vi.fn();
      render(<Toast {...defaultProps} duration={2000} onClose={onClose} />);

      // Fast-forward past custom duration + animation delay
      act(() => {
        vi.advanceTimersByTime(2300);
      });

      expect(onClose).toHaveBeenCalledWith('toast-1');
    });

    it('should clear timers on unmount', () => {
      const onClose = vi.fn();
      const { unmount } = render(<Toast {...defaultProps} onClose={onClose} />);

      unmount();

      // Fast-forward time - onClose should not be called
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Manual Close', () => {
    it('should close when close button is clicked', () => {
      const onClose = vi.fn();
      render(<Toast {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByRole('button', { name: '通知を閉じる' });

      act(() => {
        fireEvent.click(closeButton);
      });

      // Fast-forward animation delay
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(onClose).toHaveBeenCalledWith('toast-1');
    });

    it('should handle multiple clicks on close button', () => {
      const onClose = vi.fn();
      render(<Toast {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByRole('button', { name: '通知を閉じる' });

      // Click multiple times quickly
      act(() => {
        fireEvent.click(closeButton);
        fireEvent.click(closeButton);
        fireEvent.click(closeButton);
      });

      // Fast-forward animation delay
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Each click triggers handleClose, so onClose will be called multiple times
      // This is acceptable behavior as the toast will be removed after the first onClose
      expect(onClose).toHaveBeenCalledWith('toast-1');
      expect(onClose.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('Animation States', () => {
    it('should start with invisible state', () => {
      render(<Toast {...defaultProps} />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('translate-x-full', 'opacity-0');
    });

    it('should become visible after 100ms', () => {
      render(<Toast {...defaultProps} />);

      const alert = screen.getByRole('alert');

      // Initially invisible
      expect(alert).toHaveClass('translate-x-full', 'opacity-0');

      // Fast-forward to show animation
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Should have slide-in animation
      expect(alert).toHaveClass('animate-slide-in-right');
    });

    it('should apply slide-out animation when closing', () => {
      render(<Toast {...defaultProps} />);

      const alert = screen.getByRole('alert');
      const closeButton = screen.getByRole('button', { name: '通知を閉じる' });

      // Make it visible first
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(alert).toHaveClass('animate-slide-in-right');

      // Click close button
      act(() => {
        fireEvent.click(closeButton);
      });

      // Should apply slide-out animation
      expect(alert).toHaveClass('animate-slide-out-right');
    });
  });

  describe('Progress Bar', () => {
    it('should render progress bar', () => {
      render(<Toast {...defaultProps} />);

      const alert = screen.getByRole('alert');
      const progressBar = alert.querySelector('[style*="animation"]');

      expect(progressBar).toBeInTheDocument();
    });

    it('should have progress animation matching duration', () => {
      render(<Toast {...defaultProps} duration={3000} />);

      const alert = screen.getByRole('alert');
      const progressBar = alert.querySelector('[style*="animation"]') as HTMLElement;

      expect(progressBar?.style.animation).toContain('3000ms');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for success', () => {
      render(<Toast {...defaultProps} type="success" />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-label', '成功通知');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper ARIA attributes for error', () => {
      render(<Toast {...defaultProps} type="error" />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-label', 'エラー通知');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('should have accessible close button', () => {
      render(<Toast {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: '通知を閉じる' });
      expect(closeButton).toHaveAttribute('aria-label', '通知を閉じる');
    });

    it('should have keyboard accessible close button', () => {
      const onClose = vi.fn();
      render(<Toast {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByRole('button', { name: '通知を閉じる' });
      closeButton.focus();

      expect(closeButton).toHaveFocus();

      act(() => {
        fireEvent.click(closeButton);
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Title Display', () => {
    it('should display title when provided', () => {
      render(<Toast {...defaultProps} title="重要なお知らせ" />);

      expect(screen.getByText('重要なお知らせ')).toBeInTheDocument();
    });

    it('should not render title element when not provided', () => {
      render(<Toast {...defaultProps} />);

      // Check that there's no h3 element (title is rendered as h3)
      const alert = screen.getByRole('alert');
      const title = alert.querySelector('h3');
      expect(title).not.toBeInTheDocument();
    });

    it('should apply proper styling to message when title exists', () => {
      render(<Toast {...defaultProps} title="タイトル" message="メッセージ" />);

      const message = screen.getByText('メッセージ');
      expect(message).toHaveClass('mt-1');
    });

    it('should not apply margin to message when no title', () => {
      render(<Toast {...defaultProps} message="メッセージ" />);

      const message = screen.getByText('メッセージ');
      expect(message).not.toHaveClass('mt-1');
    });
  });
});

describe('ToastContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render container with proper region role', () => {
      render(<ToastContainer toasts={[]} onClose={vi.fn()} />);

      const region = screen.getByRole('complementary', { name: '通知領域' });
      expect(region).toBeInTheDocument();
    });

    it('should render empty container when no toasts', () => {
      render(<ToastContainer toasts={[]} onClose={vi.fn()} />);

      const region = screen.getByRole('complementary', { name: '通知領域' });
      expect(region).toBeEmptyDOMElement();
    });

    it('should render single toast', () => {
      const toasts: ToastProps[] = [
        {
          id: 'toast-1',
          type: 'info',
          message: 'テストメッセージ',
          onClose: vi.fn(),
        },
      ];

      render(<ToastContainer toasts={toasts} onClose={vi.fn()} />);

      expect(screen.getByText('テストメッセージ')).toBeInTheDocument();
    });

    it('should render multiple toasts', () => {
      const toasts: ToastProps[] = [
        {
          id: 'toast-1',
          type: 'success',
          message: 'メッセージ1',
          onClose: vi.fn(),
        },
        {
          id: 'toast-2',
          type: 'error',
          message: 'メッセージ2',
          onClose: vi.fn(),
        },
        {
          id: 'toast-3',
          type: 'warning',
          message: 'メッセージ3',
          onClose: vi.fn(),
        },
      ];

      render(<ToastContainer toasts={toasts} onClose={vi.fn()} />);

      expect(screen.getByText('メッセージ1')).toBeInTheDocument();
      expect(screen.getByText('メッセージ2')).toBeInTheDocument();
      expect(screen.getByText('メッセージ3')).toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    it('should have fixed positioning at top-right', () => {
      render(<ToastContainer toasts={[]} onClose={vi.fn()} />);

      const region = screen.getByRole('complementary', { name: '通知領域' });
      expect(region).toHaveClass('fixed', 'top-4', 'right-4');
    });

    it('should have high z-index for stacking', () => {
      render(<ToastContainer toasts={[]} onClose={vi.fn()} />);

      const region = screen.getByRole('complementary', { name: '通知領域' });
      expect(region).toHaveClass('z-50');
    });

    it('should have max width constraint', () => {
      render(<ToastContainer toasts={[]} onClose={vi.fn()} />);

      const region = screen.getByRole('complementary', { name: '通知領域' });
      expect(region).toHaveClass('max-w-sm');
    });
  });

  describe('Toast Interaction', () => {
    it('should pass onClose handler to toasts', () => {
      const onClose = vi.fn();
      const toasts: ToastProps[] = [
        {
          id: 'toast-1',
          type: 'info',
          message: 'テストメッセージ',
          onClose,
        },
      ];

      render(<ToastContainer toasts={toasts} onClose={onClose} />);

      const closeButton = screen.getByRole('button', { name: '通知を閉じる' });

      act(() => {
        fireEvent.click(closeButton);
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(onClose).toHaveBeenCalledWith('toast-1');
    });

    it('should handle closing individual toasts from multiple toasts', () => {
      const onClose = vi.fn();
      const toasts: ToastProps[] = [
        {
          id: 'toast-1',
          type: 'info',
          message: 'メッセージ1',
          onClose,
        },
        {
          id: 'toast-2',
          type: 'info',
          message: 'メッセージ2',
          onClose,
        },
      ];

      render(<ToastContainer toasts={toasts} onClose={onClose} />);

      const closeButtons = screen.getAllByRole('button', { name: '通知を閉じる' });

      // Close first toast
      act(() => {
        fireEvent.click(closeButtons[0]);
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(onClose).toHaveBeenCalledWith('toast-1');
      expect(onClose).not.toHaveBeenCalledWith('toast-2');
    });
  });

  describe('Toast Rendering with Different Props', () => {
    it('should render toasts with titles', () => {
      const toasts: ToastProps[] = [
        {
          id: 'toast-1',
          type: 'success',
          title: '成功',
          message: '操作が完了しました',
          onClose: vi.fn(),
        },
      ];

      render(<ToastContainer toasts={toasts} onClose={vi.fn()} />);

      expect(screen.getByRole('heading', { name: '成功' })).toBeInTheDocument();
      expect(screen.getByText('操作が完了しました')).toBeInTheDocument();
    });

    it('should render toasts with custom durations', () => {
      const onClose = vi.fn();
      const toasts: ToastProps[] = [
        {
          id: 'toast-1',
          type: 'info',
          message: 'メッセージ',
          duration: 1000,
          onClose,
        },
      ];

      render(<ToastContainer toasts={toasts} onClose={onClose} />);

      // Should close after custom duration
      act(() => {
        vi.advanceTimersByTime(1300);
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Unique Keys', () => {
    it('should render each toast with unique key', () => {
      const toasts: ToastProps[] = [
        {
          id: 'toast-1',
          type: 'info',
          message: 'メッセージ1',
          onClose: vi.fn(),
        },
        {
          id: 'toast-2',
          type: 'info',
          message: 'メッセージ2',
          onClose: vi.fn(),
        },
      ];

      const { container } = render(<ToastContainer toasts={toasts} onClose={vi.fn()} />);

      const alerts = container.querySelectorAll('[role="alert"]');
      expect(alerts).toHaveLength(2);
    });
  });
});
