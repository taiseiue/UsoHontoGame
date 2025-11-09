'use client';

import { useCallback, useEffect, useState } from 'react';
import type { TeamPerformance } from '@/components/domain/game/TeamPerformanceSummary';

interface Team {
  id: string;
  name: string;
  score: number;
}

interface Winner {
  id: string;
  name: string;
  score: number;
}

export interface GameResults {
  sessionId: string;
  teams: Team[];
  winner: Winner | null;
  performances?: Record<string, TeamPerformance>;
}

export interface UseResultsReturn {
  isLoading: boolean;
  results: GameResults | null;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * useResults hook - Fetches and manages game results data
 *
 * Handles:
 * - Fetching final game results from API
 * - Calculating winner based on scores
 * - Computing performance statistics
 * - Error handling and loading states
 */
export function useResults(sessionId: string): UseResultsReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<GameResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch game results from API
   */
  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch session data
      const response = await fetch(`/api/sessions/${sessionId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch results');
      }

      const sessionData = await response.json();

      // Extract teams and scores
      const teams: Team[] = sessionData.teams.map(
        (team: { id: string; name: string; score: number }) => ({
          id: team.id,
          name: team.name,
          score: team.score,
        })
      );

      // Sort teams by score to determine winner
      const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

      // Determine winner (null if tie at top)
      let winner: Winner | null = null;
      if (sortedTeams.length > 0) {
        const topScore = sortedTeams[0].score;
        const winnersCount = sortedTeams.filter((team) => team.score === topScore).length;

        // Only set winner if there's a single team with the highest score
        if (winnersCount === 1) {
          winner = {
            id: sortedTeams[0].id,
            name: sortedTeams[0].name,
            score: sortedTeams[0].score,
          };
        }
      }

      // Calculate performance statistics for each team
      const performances: Record<string, TeamPerformance> = {};

      for (const team of teams) {
        // Get team participants
        const teamParticipants = sessionData.participants.filter(
          (p: { teamId: string }) => p.teamId === team.id
        );

        // TODO: In a real implementation, we would fetch detailed stats from API
        // For now, we'll provide placeholder data
        performances[team.id] = {
          teamId: team.id,
          teamName: team.name,
          totalScore: team.score,
          episodesPresented: 0, // Would be calculated from actual game data
          correctGuesses: 0, // Would be calculated from voting records
          deceiveSuccesses: 0, // Would be calculated from voting records
          participantCount: teamParticipants.length,
        };
      }

      setResults({
        sessionId,
        teams,
        winner,
        performances,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch results';
      setError(errorMessage);
      console.error('[useResults] Error fetching results:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Fetch results on mount
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return {
    isLoading,
    results,
    error,
    refetch: fetchResults,
  };
}
