'use client';

// useNicknameForm hook
// Custom hook for nickname form logic (follows constitution Principle III)

import { useState, useTransition } from 'react';
import { setNicknameAction } from '@/app/actions/session';

export interface UseNicknameFormReturn {
  nickname: string;
  error: string | null;
  isSubmitting: boolean;
  handleChange: (value: string) => void;
  handleSubmit: () => Promise<void>;
}

/**
 * Custom hook for nickname form logic
 * Separates business logic from presentation (constitution Principle III)
 */
export function useNicknameForm(): UseNicknameFormReturn {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string) => {
    setNickname(value);
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async () => {
    // Client-side validation
    if (!nickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }

    // Server action with transition for UI updates
    startTransition(async () => {
      const result = await setNicknameAction(nickname);

      if (!result.success) {
        setError(result.error.message);
      } else {
        // Success - page will re-render with new nickname from cookies
        // Force a page reload to show the updated state
        window.location.reload();
      }
    });
  };

  return {
    nickname,
    error,
    isSubmitting: isPending,
    handleChange,
    handleSubmit,
  };
}
