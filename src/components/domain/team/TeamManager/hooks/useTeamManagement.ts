'use client';

import { useState } from 'react';

export interface Team {
  id: string;
  name: string;
  participantIds: string[];
  cumulativeScore: number;
}

export interface Participant {
  id: string;
  nickname: string;
  teamId: string | null;
}

/**
 * useTeamManagement hook - Manages team operations and API calls
 * Extracted business logic from TeamManager component
 */
export function useTeamManagement(
  sessionId: string,
  hostId: string,
  initialTeams: Team[] = [],
  initialParticipants: Participant[] = []
) {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a new team
   */
  const createTeam = async (teamName: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${sessionId}/teams`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          hostId,
          teamName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create team');
      }

      const result = await response.json();
      if (result.team) {
        setTeams((prev) => [...prev, result.team]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Assign participant to team
   */
  const assignParticipant = async (participantId: string, teamId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${sessionId}/teams`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign',
          hostId,
          teamId,
          participantId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to assign participant');
      }

      const result = await response.json();
      if (result.team) {
        // Update teams
        setTeams((prev) => prev.map((t) => (t.id === teamId ? result.team : t)));
        // Update participant
        setParticipants((prev) => prev.map((p) => (p.id === participantId ? { ...p, teamId } : p)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign participant');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove participant from team
   */
  const removeParticipant = async (participantId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${sessionId}/teams`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          hostId,
          participantId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove participant');
      }

      // Update participant
      setParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, teamId: null } : p))
      );

      // Update teams
      setTeams((prev) =>
        prev.map((t) => ({
          ...t,
          participantIds: t.participantIds.filter((id) => id !== participantId),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove participant');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete team
   */
  const deleteTeam = async (teamId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${sessionId}/teams`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          hostId,
          teamId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete team');
      }

      // Remove team from list
      setTeams((prev) => prev.filter((t) => t.id !== teamId));

      // Update participants (unassign from deleted team)
      setParticipants((prev) =>
        prev.map((p) => (p.teamId === teamId ? { ...p, teamId: null } : p))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    teams,
    participants,
    loading,
    error,
    createTeam,
    assignParticipant,
    removeParticipant,
    deleteTeam,
  };
}
