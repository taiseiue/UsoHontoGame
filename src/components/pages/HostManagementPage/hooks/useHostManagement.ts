'use client';

import { useCallback, useEffect, useState } from 'react';

export interface GameSession {
  sessionId: string;
  hostId: string;
  phase: string;
  teams: Array<{
    id: string;
    name: string;
    participantIds: string[];
    cumulativeScore: number;
  }>;
  participants: Array<{
    id: string;
    nickname: string;
    teamId: string | null;
    role: string;
  }>;
}

/**
 * useHostManagement hook - Manages host operations (start game, end game, fetch session)
 * Extracted business logic from HostManagementPage component
 */
export function useHostManagement(sessionId: string, hostId: string) {
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch session data
   */
  const fetchSession = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${sessionId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch session');
      }

      const data = await response.json();
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  /**
   * Start the game
   */
  const startGame = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${sessionId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start game');
      }

      // Refresh session data
      await fetchSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * End the game
   */
  const endGame = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to end game');
      }

      // Refresh session data
      await fetchSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end game');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if game can be started
   */
  const canStartGame = (): boolean => {
    if (!session) return false;
    if (session.phase !== 'preparation') return false;
    if (session.teams.length < 2) return false;

    const players = session.participants.filter((p) => p.role === 'player');
    const unassigned = players.filter((p) => p.teamId === null);

    return unassigned.length === 0;
  };

  /**
   * Get validation message for why game cannot start
   */
  const getStartValidationMessage = (): string | null => {
    if (!session) return null;
    if (session.phase !== 'preparation') return 'Game already started';
    if (session.teams.length < 2) return 'Minimum 2 teams required';

    const players = session.participants.filter((p) => p.role === 'player');
    const unassigned = players.filter((p) => p.teamId === null);

    if (unassigned.length > 0) {
      return `${unassigned.length} participant(s) not assigned to teams`;
    }

    return null;
  };

  // Fetch session on mount
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return {
    session,
    loading,
    error,
    fetchSession,
    startGame,
    endGame,
    canStartGame,
    getStartValidationMessage,
  };
}
