import { useCallback, useEffect, useState } from 'react';
import type { SessionPhase } from '@/types/game';

export interface GameState {
  phase: SessionPhase;
  currentTurnId: string | null;
  hostId: string;
  participants: Array<{
    id: string;
    nickname: string;
    teamId: string | null;
  }>;
  teams: Array<{
    id: string;
    name: string;
    score: number;
    memberIds: string[];
  }>;
  currentPresentingTeam?: {
    teamId: string;
    teamName: string;
    playerName: string;
  };
  episodes?: Array<{ episodeNumber: number; text: string }>;
  hasVoted?: boolean;
  revealData?: {
    correctEpisodeNumber: number;
    voteResults: Array<{
      teamId: string;
      teamName: string;
      selectedEpisodeNumber: number;
      isCorrect: boolean;
      pointsEarned: number;
    }>;
    presentingTeamPoints: number;
  };
}

export interface UseGamePageProps {
  sessionId: string;
  participantId: string;
}

/**
 * useGamePage
 * Custom hook for game page state management and logic
 */
export function useGamePage({ sessionId, participantId }: UseGamePageProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Derived state
  const currentParticipant = gameState?.participants.find((p) => p.id === participantId);
  const currentTeamId = currentParticipant?.teamId;
  const isHost = gameState?.hostId === participantId;

  /**
   * Fetch game state from API
   */
  const fetchGameState = useCallback(async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (!response.ok) throw new Error('セッションの取得に失敗しました');

      const data = await response.json();
      setGameState(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  /**
   * Poll for game state updates
   */
  useEffect(() => {
    fetchGameState();
    // Poll for updates every 5 seconds (in production, use WebSocket/SSE)
    const interval = setInterval(fetchGameState, 5000);
    return () => clearInterval(interval);
  }, [fetchGameState]);

  /**
   * Handle episode registration
   */
  const handleEpisodeSubmit = async (
    episodes: Array<{ episodeNumber: number; text: string; isLie: boolean }>
  ) => {
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/episodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, episodes }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'エピソードの登録に失敗しました');
      }

      await fetchGameState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle vote submission
   */
  const handleVoteSubmit = async (selectedEpisodeNumber: number) => {
    if (!gameState?.currentTurnId || !currentTeamId) return;

    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          teamId: currentTeamId,
          turnId: gameState.currentTurnId,
          selectedEpisodeNumber,
          presentingTeamId: gameState.currentPresentingTeam?.teamId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '投票に失敗しました');
      }

      setGameState({ ...gameState, hasVoted: true });
      await fetchGameState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle continue to next turn
   */
  const handleContinue = () => {
    fetchGameState();
  };

  /**
   * Reload game state manually
   */
  const reload = () => {
    setIsLoading(true);
    fetchGameState();
  };

  return {
    // State
    gameState,
    isLoading,
    error,
    actionLoading,

    // Derived state
    currentParticipant,
    currentTeamId,
    isHost,

    // Actions
    handleEpisodeSubmit,
    handleVoteSubmit,
    handleContinue,
    reload,
    fetchGameState,
  };
}
