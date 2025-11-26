// Hook Tests: useToast
// Feature: Enhanced status transition feedback
// Tests for toast management hook and context

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { statusTransitionToasts, ToastProvider, useGlobalToast, useToast } from './useToast';

describe('useToast', () => {
  let dateNowMock: ReturnType<typeof vi.spyOn>;
  let mathRandomMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date.now to return different values on each call
    let callCount = 0;
    dateNowMock = vi.spyOn(Date, 'now').mockImplementation(() => {
      callCount++;
      return 1234567890 + callCount * 1000;
    });
    // Mock Math.random to return different values on each call
    let randomCount = 0;
    mathRandomMock = vi.spyOn(Math, 'random').mockImplementation(() => {
      randomCount++;
      return 0.1 * randomCount;
    });
  });

  afterEach(() => {
    dateNowMock.mockRestore();
    mathRandomMock.mockRestore();
  });

  describe('Initial State', () => {
    it('should return empty toasts array initially', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.toasts).toEqual([]);
    });

    it('should provide all required methods', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.addToast).toBeInstanceOf(Function);
      expect(result.current.removeToast).toBeInstanceOf(Function);
      expect(result.current.clearAllToasts).toBeInstanceOf(Function);
      expect(result.current.showSuccess).toBeInstanceOf(Function);
      expect(result.current.showError).toBeInstanceOf(Function);
      expect(result.current.showInfo).toBeInstanceOf(Function);
      expect(result.current.showWarning).toBeInstanceOf(Function);
    });
  });

  describe('addToast', () => {
    it('should add toast with correct properties', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast({
          type: 'info',
          message: 'テストメッセージ',
        });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        type: 'info',
        message: 'テストメッセージ',
        duration: 4000,
      });
    });

    it('should generate unique ID for each toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast({ type: 'info', message: 'メッセージ1' });
      });

      act(() => {
        result.current.addToast({ type: 'info', message: 'メッセージ2' });
      });

      const ids = result.current.toasts.map((t) => t.id);
      expect(ids[0]).toBeTruthy();
      expect(ids[1]).toBeTruthy();
      expect(new Set(ids).size).toBe(2); // All IDs should be unique
    });

    it('should return toast ID', () => {
      const { result } = renderHook(() => useToast());

      let toastId: string = '';
      act(() => {
        toastId = result.current.addToast({
          type: 'info',
          message: 'テストメッセージ',
        });
      });

      expect(toastId).toBeTruthy();
      expect(result.current.toasts[0].id).toBe(toastId);
    });

    it('should add toast with optional title', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast({
          type: 'success',
          title: 'タイトル',
          message: 'メッセージ',
        });
      });

      expect(result.current.toasts[0].title).toBe('タイトル');
    });

    it('should use default duration of 4000ms for non-error toasts', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast({
          type: 'success',
          message: 'メッセージ',
        });
      });

      expect(result.current.toasts[0].duration).toBe(4000);
    });

    it('should use duration of 6000ms for error toasts', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast({
          type: 'error',
          message: 'エラーメッセージ',
        });
      });

      expect(result.current.toasts[0].duration).toBe(6000);
    });

    it('should use custom duration if provided', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast({
          type: 'info',
          message: 'メッセージ',
          duration: 10000,
        });
      });

      expect(result.current.toasts[0].duration).toBe(10000);
    });

    it('should limit toasts to maximum of 5', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.addToast({
            type: 'info',
            message: `メッセージ${i}`,
          });
        }
      });

      expect(result.current.toasts).toHaveLength(5);
    });

    it('should keep newest 5 toasts when exceeding limit', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast({ type: 'info', message: 'メッセージ1' });
        result.current.addToast({ type: 'info', message: 'メッセージ2' });
        result.current.addToast({ type: 'info', message: 'メッセージ3' });
        result.current.addToast({ type: 'info', message: 'メッセージ4' });
        result.current.addToast({ type: 'info', message: 'メッセージ5' });
        result.current.addToast({ type: 'info', message: 'メッセージ6' });
      });

      expect(result.current.toasts).toHaveLength(5);
      // Newest toast should be first
      expect(result.current.toasts[0].message).toBe('メッセージ6');
      // Oldest toast (メッセージ1) should be removed
      expect(result.current.toasts.find((t) => t.message === 'メッセージ1')).toBeUndefined();
    });

    it('should attach removeToast as onClose handler', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast({
          type: 'info',
          message: 'テストメッセージ',
        });
      });

      expect(result.current.toasts[0].onClose).toBe(result.current.removeToast);
    });
  });

  describe('removeToast', () => {
    it('should remove toast by ID', () => {
      const { result } = renderHook(() => useToast());

      let toastId: string = '';
      act(() => {
        toastId = result.current.addToast({
          type: 'info',
          message: 'テストメッセージ',
        });
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.removeToast(toastId);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should remove only the specified toast', () => {
      const { result } = renderHook(() => useToast());

      let toastId1: string = '';
      let toastId2: string = '';

      act(() => {
        toastId1 = result.current.addToast({ type: 'info', message: 'メッセージ1' });
        toastId2 = result.current.addToast({ type: 'info', message: 'メッセージ2' });
      });

      expect(result.current.toasts).toHaveLength(2);

      act(() => {
        result.current.removeToast(toastId1);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].id).toBe(toastId2);
    });

    it('should handle removing non-existent toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast({ type: 'info', message: 'メッセージ' });
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.removeToast('non-existent-id');
      });

      expect(result.current.toasts).toHaveLength(1);
    });
  });

  describe('clearAllToasts', () => {
    it('should remove all toasts', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast({ type: 'info', message: 'メッセージ1' });
        result.current.addToast({ type: 'info', message: 'メッセージ2' });
        result.current.addToast({ type: 'info', message: 'メッセージ3' });
      });

      expect(result.current.toasts).toHaveLength(3);

      act(() => {
        result.current.clearAllToasts();
      });

      expect(result.current.toasts).toEqual([]);
    });

    it('should work when no toasts exist', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.toasts).toEqual([]);

      act(() => {
        result.current.clearAllToasts();
      });

      expect(result.current.toasts).toEqual([]);
    });
  });

  describe('Convenience Methods', () => {
    describe('showSuccess', () => {
      it('should add success toast', () => {
        const { result } = renderHook(() => useToast());

        act(() => {
          result.current.showSuccess('成功しました');
        });

        expect(result.current.toasts).toHaveLength(1);
        expect(result.current.toasts[0].type).toBe('success');
        expect(result.current.toasts[0].message).toBe('成功しました');
      });

      it('should add success toast with title', () => {
        const { result } = renderHook(() => useToast());

        act(() => {
          result.current.showSuccess('操作完了', '成功');
        });

        expect(result.current.toasts[0].title).toBe('成功');
        expect(result.current.toasts[0].message).toBe('操作完了');
      });

      it('should return toast ID', () => {
        const { result } = renderHook(() => useToast());

        let toastId: string = '';
        act(() => {
          toastId = result.current.showSuccess('成功しました');
        });

        expect(toastId).toBeTruthy();
        expect(result.current.toasts[0].id).toBe(toastId);
      });
    });

    describe('showError', () => {
      it('should add error toast', () => {
        const { result } = renderHook(() => useToast());

        act(() => {
          result.current.showError('エラーが発生しました');
        });

        expect(result.current.toasts).toHaveLength(1);
        expect(result.current.toasts[0].type).toBe('error');
        expect(result.current.toasts[0].message).toBe('エラーが発生しました');
      });

      it('should use longer duration for error toasts', () => {
        const { result } = renderHook(() => useToast());

        act(() => {
          result.current.showError('エラーが発生しました');
        });

        expect(result.current.toasts[0].duration).toBe(6000);
      });

      it('should add error toast with title', () => {
        const { result } = renderHook(() => useToast());

        act(() => {
          result.current.showError('通信に失敗しました', 'ネットワークエラー');
        });

        expect(result.current.toasts[0].title).toBe('ネットワークエラー');
        expect(result.current.toasts[0].message).toBe('通信に失敗しました');
      });
    });

    describe('showInfo', () => {
      it('should add info toast', () => {
        const { result } = renderHook(() => useToast());

        act(() => {
          result.current.showInfo('情報をお知らせします');
        });

        expect(result.current.toasts).toHaveLength(1);
        expect(result.current.toasts[0].type).toBe('info');
        expect(result.current.toasts[0].message).toBe('情報をお知らせします');
      });

      it('should add info toast with title', () => {
        const { result } = renderHook(() => useToast());

        act(() => {
          result.current.showInfo('新機能が追加されました', 'お知らせ');
        });

        expect(result.current.toasts[0].title).toBe('お知らせ');
        expect(result.current.toasts[0].message).toBe('新機能が追加されました');
      });
    });

    describe('showWarning', () => {
      it('should add warning toast', () => {
        const { result } = renderHook(() => useToast());

        act(() => {
          result.current.showWarning('注意してください');
        });

        expect(result.current.toasts).toHaveLength(1);
        expect(result.current.toasts[0].type).toBe('warning');
        expect(result.current.toasts[0].message).toBe('注意してください');
      });

      it('should add warning toast with title', () => {
        const { result } = renderHook(() => useToast());

        act(() => {
          result.current.showWarning('保存されていない変更があります', '警告');
        });

        expect(result.current.toasts[0].title).toBe('警告');
        expect(result.current.toasts[0].message).toBe('保存されていない変更があります');
      });
    });
  });
});

describe('ToastProvider and useGlobalToast', () => {
  describe('useGlobalToast with Provider', () => {
    it('should provide toast context', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      );

      const { result } = renderHook(() => useGlobalToast(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.addToast).toBeInstanceOf(Function);
      expect(result.current.toasts).toEqual([]);
    });

    it('should share same toast instance from context', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ToastProvider>{children}</ToastProvider>
      );

      const { result } = renderHook(() => useGlobalToast(), { wrapper });

      act(() => {
        result.current.addToast({
          type: 'info',
          message: 'テストメッセージ',
        });
      });

      // The context should provide the same toast instance
      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('テストメッセージ');

      // Add another toast to verify state persistence
      act(() => {
        result.current.addToast({
          type: 'success',
          message: '2つ目のメッセージ',
        });
      });

      expect(result.current.toasts).toHaveLength(2);
    });
  });

  describe('useGlobalToast without Provider', () => {
    it('should throw error when used outside ToastProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useGlobalToast());
      }).toThrow('useGlobalToast must be used within a ToastProvider');

      consoleError.mockRestore();
    });
  });
});

describe('statusTransitionToasts', () => {
  describe('gameStarted', () => {
    it('should return success toast config for game start', () => {
      const config = statusTransitionToasts.gameStarted();

      expect(config).toEqual({
        type: 'success',
        title: 'ゲーム開始',
        message: 'ゲームが正常に開始されました',
      });
    });

    it('should accept custom title', () => {
      const config = statusTransitionToasts.gameStarted('カスタムタイトル');

      expect(config.title).toBe('カスタムタイトル');
      expect(config.message).toBe('ゲームが正常に開始されました');
    });
  });

  describe('gameClosed', () => {
    it('should return success toast config for game close', () => {
      const config = statusTransitionToasts.gameClosed();

      expect(config).toEqual({
        type: 'success',
        title: 'ゲーム締切',
        message: 'ゲームが正常に締切されました',
      });
    });

    it('should accept custom title', () => {
      const config = statusTransitionToasts.gameClosed('カスタム締切');

      expect(config.title).toBe('カスタム締切');
    });
  });

  describe('gameStartError', () => {
    it('should return error toast config for game start error', () => {
      const config = statusTransitionToasts.gameStartError('プレゼンターが不足しています');

      expect(config).toEqual({
        type: 'error',
        title: 'ゲーム開始エラー',
        message: 'プレゼンターが不足しています',
      });
    });
  });

  describe('gameCloseError', () => {
    it('should return error toast config for game close error', () => {
      const config = statusTransitionToasts.gameCloseError('回答が不足しています');

      expect(config).toEqual({
        type: 'error',
        title: 'ゲーム締切エラー',
        message: '回答が不足しています',
      });
    });
  });

  describe('statusUpdateSuccess', () => {
    it('should return success toast config for status update', () => {
      const config = statusTransitionToasts.statusUpdateSuccess('出題中');

      expect(config).toEqual({
        type: 'success',
        title: 'ステータス更新完了',
        message: 'ゲームステータスが「出題中」に変更されました',
      });
    });
  });

  describe('validationError', () => {
    it('should return error toast config for validation error', () => {
      const config = statusTransitionToasts.validationError('入力値が正しくありません');

      expect(config).toEqual({
        type: 'error',
        title: '入力エラー',
        message: '入力値が正しくありません',
      });
    });
  });

  describe('networkError', () => {
    it('should return error toast config for network error', () => {
      const config = statusTransitionToasts.networkError();

      expect(config).toEqual({
        type: 'error',
        title: '通信エラー',
        message: 'サーバーとの通信に失敗しました。しばらく時間をおいてから再度お試しください。',
      });
    });
  });
});
