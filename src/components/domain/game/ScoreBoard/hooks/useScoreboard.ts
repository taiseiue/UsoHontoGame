import { useMemo } from 'react';

export interface TeamScore {
  teamId: string;
  teamName: string;
  score: number;
  memberIds: string[];
}

export interface UseScoreboardProps {
  teams: TeamScore[];
  currentTeamId?: string;
}

/**
 * useScoreboard
 * Custom hook for scoreboard logic
 */
export function useScoreboard({ teams, currentTeamId }: UseScoreboardProps) {
  /**
   * Sort teams by score descending
   */
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => b.score - a.score);
  }, [teams]);

  /**
   * Get rank for a specific team
   */
  const getTeamRank = (teamId: string): number => {
    const index = sortedTeams.findIndex((team) => team.teamId === teamId);
    return index + 1;
  };

  /**
   * Get leading team (highest score)
   */
  const leadingTeam = sortedTeams.length > 0 && sortedTeams[0].score > 0 ? sortedTeams[0] : null;

  /**
   * Check if a team is leading
   */
  const isTeamLeading = (teamId: string): boolean => {
    return leadingTeam?.teamId === teamId;
  };

  /**
   * Check if a team is the current team
   */
  const isCurrentTeam = (teamId: string): boolean => {
    return teamId === currentTeamId;
  };

  /**
   * Get team by ID
   */
  const getTeam = (teamId: string): TeamScore | undefined => {
    return teams.find((team) => team.teamId === teamId);
  };

  return {
    sortedTeams,
    leadingTeam,
    getTeamRank,
    isTeamLeading,
    isCurrentTeam,
    getTeam,
    hasScores: teams.length > 0,
  };
}
