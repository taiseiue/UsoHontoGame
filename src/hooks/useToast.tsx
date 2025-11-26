/**
 * useToast Hook
 * Feature: Enhanced status transition feedback
 * Manages toast notifications with queue and auto-cleanup
 */

'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import type { ToastProps, ToastType } from '@/components/ui/Toast';

interface AddToastOptions {
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface UseToastReturn {
  toasts: ToastProps[];
  addToast: (options: AddToastOptions) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  showSuccess: (message: string, title?: string) => string;
  showError: (message: string, title?: string) => string;
  showInfo: (message: string, title?: string) => string;
  showWarning: (message: string, title?: string) => string;
}

/**
 * Hook for managing toast notifications
 */
export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback(
    (options: AddToastOptions): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const newToast: ToastProps = {
        id,
        type: options.type,
        title: options.title,
        message: options.message,
        duration: options.duration || (options.type === 'error' ? 6000 : 4000), // Errors stay longer
        onClose: removeToast,
      };

      setToasts((prev) => {
        // Limit to 5 toasts maximum
        const updatedToasts = [newToast, ...prev].slice(0, 5);
        return updatedToasts;
      });

      return id;
    },
    [removeToast]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast types
  const showSuccess = useCallback(
    (message: string, title?: string): string => {
      return addToast({ type: 'success', message, title });
    },
    [addToast]
  );

  const showError = useCallback(
    (message: string, title?: string): string => {
      return addToast({ type: 'error', message, title });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (message: string, title?: string): string => {
      return addToast({ type: 'info', message, title });
    },
    [addToast]
  );

  const showWarning = useCallback(
    (message: string, title?: string): string => {
      return addToast({ type: 'warning', message, title });
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}

/**
 * Global toast context for app-wide toast management
 */
const ToastContext = createContext<UseToastReturn | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();

  return <ToastContext.Provider value={toast}>{children}</ToastContext.Provider>;
}

export function useGlobalToast(): UseToastReturn {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useGlobalToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * Status transition specific toast messages
 */
export const statusTransitionToasts = {
  gameStarted: (title: string = 'ゲーム開始') => ({
    type: 'success' as ToastType,
    title,
    message: 'ゲームが正常に開始されました',
  }),

  gameClosed: (title: string = 'ゲーム締切') => ({
    type: 'success' as ToastType,
    title,
    message: 'ゲームが正常に締切されました',
  }),

  gameStartError: (error: string) => ({
    type: 'error' as ToastType,
    title: 'ゲーム開始エラー',
    message: error,
  }),

  gameCloseError: (error: string) => ({
    type: 'error' as ToastType,
    title: 'ゲーム締切エラー',
    message: error,
  }),

  statusUpdateSuccess: (newStatus: string) => ({
    type: 'success' as ToastType,
    title: 'ステータス更新完了',
    message: `ゲームステータスが「${newStatus}」に変更されました`,
  }),

  validationError: (error: string) => ({
    type: 'error' as ToastType,
    title: '入力エラー',
    message: error,
  }),

  networkError: () => ({
    type: 'error' as ToastType,
    title: '通信エラー',
    message: 'サーバーとの通信に失敗しました。しばらく時間をおいてから再度お試しください。',
  }),
} as const;
