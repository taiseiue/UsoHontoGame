// Component Tests: AccessibilityProvider
// UI Primitive component for screen reader announcements

import { render, renderHook, screen } from '@testing-library/react';
import { act, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AccessibilityProvider,
  useAccessibility,
  useConditionalAnnouncement,
} from './AccessibilityProvider';

describe('AccessibilityProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render children', () => {
      render(
        <AccessibilityProvider>
          <div>Test Content</div>
        </AccessibilityProvider>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render screen reader announcement regions', () => {
      render(
        <AccessibilityProvider>
          <div>Content</div>
        </AccessibilityProvider>
      );

      const politeRegion = document.querySelector('[aria-live="polite"]');
      const assertiveRegion = document.querySelector('[aria-live="assertive"]');

      expect(politeRegion).toBeInTheDocument();
      expect(assertiveRegion).toBeInTheDocument();
    });

    it('should have sr-only class on announcer container', () => {
      const { container } = render(
        <AccessibilityProvider>
          <div>Content</div>
        </AccessibilityProvider>
      );

      const srOnlyContainer = container.querySelector('.sr-only');
      expect(srOnlyContainer).toBeInTheDocument();
    });

    it('should render polite announcer with correct attributes', () => {
      render(
        <AccessibilityProvider>
          <div>Content</div>
        </AccessibilityProvider>
      );

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion).toHaveAttribute('aria-live', 'polite');
      expect(politeRegion).toHaveAttribute('aria-atomic', 'true');
      expect(politeRegion?.tagName).toBe('OUTPUT');
    });

    it('should render assertive announcer with correct attributes', () => {
      render(
        <AccessibilityProvider>
          <div>Content</div>
        </AccessibilityProvider>
      );

      const assertiveRegion = document.querySelector('[aria-live="assertive"]');
      expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive');
      expect(assertiveRegion).toHaveAttribute('aria-atomic', 'true');
      expect(assertiveRegion).toHaveAttribute('role', 'alert');
    });
  });

  describe('useAccessibility Hook', () => {
    it('should provide accessibility context', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      expect(result.current).toHaveProperty('announceToScreenReader');
      expect(result.current).toHaveProperty('announceStatusChange');
      expect(result.current).toHaveProperty('announceError');
      expect(result.current).toHaveProperty('announceSuccess');
    });

    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useAccessibility());
      }).toThrow('useAccessibility must be used within an AccessibilityProvider');
    });
  });

  describe('announceToScreenReader', () => {
    it('should announce polite message by default', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.announceToScreenReader('Test message');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe('Test message');
    });

    it('should announce assertive message', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.announceToScreenReader('Urgent message', 'assertive');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const assertiveRegion = document.querySelector('[aria-live="assertive"]');
      expect(assertiveRegion?.textContent).toBe('Urgent message');
    });

    it('should clear message before announcing', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      // First announcement
      act(() => {
        result.current.announceToScreenReader('First message');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe('First message');

      // Before advancing timers, the message should be cleared
      act(() => {
        result.current.announceToScreenReader('Second message');
      });

      // Message is cleared immediately
      expect(politeRegion?.textContent).toBe('');

      // After 100ms, new message appears
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(politeRegion?.textContent).toBe('Second message');
    });

    it('should handle Japanese messages', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.announceToScreenReader('ステータスが更新されました');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe('ステータスが更新されました');
    });
  });

  describe('announceStatusChange', () => {
    it('should announce formatted status change', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.announceStatusChange('準備中', '出題中');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe(
        'ゲームステータスが「準備中」から「出題中」に変更されました'
      );
    });

    it('should use polite priority', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.announceStatusChange('出題中', '締切');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const politeRegion = document.querySelector('[aria-live="polite"]');
      const assertiveRegion = document.querySelector('[aria-live="assertive"]');

      expect(politeRegion?.textContent).toBe(
        'ゲームステータスが「出題中」から「締切」に変更されました'
      );
      expect(assertiveRegion?.textContent).toBe('');
    });

    it('should handle English status names', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.announceStatusChange('active', 'closed');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe(
        'ゲームステータスが「active」から「closed」に変更されました'
      );
    });
  });

  describe('announceError', () => {
    it('should announce formatted error message', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.announceError('操作に失敗しました');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const assertiveRegion = document.querySelector('[aria-live="assertive"]');
      expect(assertiveRegion?.textContent).toBe('エラーが発生しました: 操作に失敗しました');
    });

    it('should use assertive priority', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.announceError('データの読み込みに失敗しました');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const politeRegion = document.querySelector('[aria-live="polite"]');
      const assertiveRegion = document.querySelector('[aria-live="assertive"]');

      expect(assertiveRegion?.textContent).toBe(
        'エラーが発生しました: データの読み込みに失敗しました'
      );
      expect(politeRegion?.textContent).toBe('');
    });

    it('should handle English error messages', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.announceError('Operation failed');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const assertiveRegion = document.querySelector('[aria-live="assertive"]');
      expect(assertiveRegion?.textContent).toBe('エラーが発生しました: Operation failed');
    });
  });

  describe('announceSuccess', () => {
    it('should announce formatted success message', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.announceSuccess('保存しました');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe('操作が成功しました: 保存しました');
    });

    it('should use polite priority', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.announceSuccess('削除しました');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const politeRegion = document.querySelector('[aria-live="polite"]');
      const assertiveRegion = document.querySelector('[aria-live="assertive"]');

      expect(politeRegion?.textContent).toBe('操作が成功しました: 削除しました');
      expect(assertiveRegion?.textContent).toBe('');
    });

    it('should handle English success messages', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.announceSuccess('Saved successfully');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe('操作が成功しました: Saved successfully');
    });
  });

  describe('useConditionalAnnouncement Hook', () => {
    it('should provide announceIfEnabled function', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useConditionalAnnouncement(), { wrapper });

      expect(result.current).toHaveProperty('announceIfEnabled');
      expect(typeof result.current.announceIfEnabled).toBe('function');
    });

    it('should announce with prefix when reduced motion preferred', () => {
      // Mock matchMedia for prefers-reduced-motion
      const matchMediaMock = vi.fn((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: matchMediaMock,
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useConditionalAnnouncement(), { wrapper });

      act(() => {
        result.current.announceIfEnabled('Test announcement');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe('詳細な更新情報: Test announcement');
    });

    it('should announce without prefix when reduced motion not preferred', () => {
      // Mock matchMedia for no prefers-reduced-motion
      const matchMediaMock = vi.fn((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: matchMediaMock,
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useConditionalAnnouncement(), { wrapper });

      act(() => {
        result.current.announceIfEnabled('Direct announcement');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe('Direct announcement');
    });

    it('should support assertive priority', () => {
      const matchMediaMock = vi.fn((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: matchMediaMock,
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useConditionalAnnouncement(), { wrapper });

      act(() => {
        result.current.announceIfEnabled('Urgent announcement', 'assertive');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const assertiveRegion = document.querySelector('[aria-live="assertive"]');
      expect(assertiveRegion?.textContent).toBe('Urgent announcement');
    });
  });

  describe('Multiple Announcements', () => {
    it('should handle multiple announcements in sequence', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.announceToScreenReader('First');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe('First');

      act(() => {
        result.current.announceToScreenReader('Second');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(politeRegion?.textContent).toBe('Second');
    });

    it('should handle mixed priority announcements', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.announceToScreenReader('Polite message');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const politeRegion = document.querySelector('[aria-live="polite"]');
      const assertiveRegion = document.querySelector('[aria-live="assertive"]');

      expect(politeRegion?.textContent).toBe('Polite message');
      expect(assertiveRegion?.textContent).toBe('');

      act(() => {
        result.current.announceToScreenReader('Assertive message', 'assertive');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(politeRegion?.textContent).toBe('Polite message');
      expect(assertiveRegion?.textContent).toBe('Assertive message');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.announceToScreenReader('');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe('');
    });

    it('should handle special characters', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.announceToScreenReader('Special: <>&"\'');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe('Special: <>&"\'');
    });

    it('should handle very long messages', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AccessibilityProvider>{children}</AccessibilityProvider>
      );

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      const longMessage = 'A'.repeat(500);

      act(() => {
        result.current.announceToScreenReader(longMessage);
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe(longMessage);
    });
  });
});
