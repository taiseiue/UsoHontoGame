import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface UseJoinPageProps {
  sessionId?: string;
}

/**
 * useJoinPage
 * Custom hook for join page logic
 */
export function useJoinPage({ sessionId }: UseJoinPageProps) {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [joinSessionId, setJoinSessionId] = useState(sessionId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'join' | 'create'>(sessionId ? 'join' : 'create');

  /**
   * Handle session creation
   */
  const handleCreateSession = async () => {
    if (!nickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostNickname: nickname }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'セッションの作成に失敗しました');
      }

      const data = await response.json();
      router.push(`/game/${data.sessionId}?participantId=${data.hostId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle joining a session
   */
  const handleJoinSession = async () => {
    if (!nickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }

    if (!joinSessionId.trim()) {
      setError('セッションIDを入力してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${joinSessionId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'セッションへの参加に失敗しました');
      }

      const data = await response.json();
      router.push(`/game/${joinSessionId}?participantId=${data.participantId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null);
  };

  return {
    nickname,
    setNickname,
    joinSessionId,
    setJoinSessionId,
    isLoading,
    error,
    mode,
    setMode,
    handleCreateSession,
    handleJoinSession,
    clearError,
  };
}
