'use client';

import { useState } from 'react';
import { ParticipantList } from '@/components/domain/team/ParticipantList';
import { TeamCard } from '@/components/domain/team/TeamCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import type { Participant, Team } from './hooks/useTeamManagement';
import { useTeamManagement } from './hooks/useTeamManagement';

export interface TeamManagerProps {
  sessionId: string;
  hostId: string;
  initialTeams: Team[];
  initialParticipants: Participant[];
  disabled?: boolean;
}

/**
 * TeamManager component - Main component for managing teams and participants
 * Orchestrates child components and hooks
 */
export function TeamManager({
  sessionId,
  hostId,
  initialTeams,
  initialParticipants,
  disabled = false,
}: TeamManagerProps) {
  const [newTeamName, setNewTeamName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teamNameError, setTeamNameError] = useState<string>('');

  const {
    teams,
    participants,
    loading,
    error,
    createTeam,
    assignParticipant,
    removeParticipant,
    deleteTeam,
  } = useTeamManagement(sessionId, hostId, initialTeams, initialParticipants);

  const {
    draggedParticipantId,
    dropTargetTeamId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useDragAndDrop();

  /**
   * Handle team creation
   */
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTeamName.trim()) {
      setTeamNameError('チーム名を入力してください');
      return;
    }

    if (newTeamName.trim().length < 2) {
      setTeamNameError('チーム名は2文字以上で入力してください');
      return;
    }

    if (teams.some((team) => team.name === newTeamName.trim())) {
      setTeamNameError('このチーム名は既に使用されています');
      return;
    }

    setTeamNameError('');

    try {
      await createTeam(newTeamName.trim());
      setNewTeamName('');
      setShowCreateForm(false);
    } catch (err) {
      // Error is handled by useTeamManagement hook
      console.error('Failed to create team:', err);
    }
  };

  /**
   * Handle delete team with confirmation
   */
  const handleDeleteTeam = async (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${team.name}"? All participants will be unassigned.`
    );

    if (confirmed) {
      try {
        await deleteTeam(teamId);
      } catch (err) {
        console.error('Failed to delete team:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
        {!disabled && !showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)} disabled={loading}>
            Create New Team
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Create Team Form */}
      {showCreateForm && !disabled && (
        <form
          onSubmit={handleCreateTeam}
          className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm"
        >
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Create New Team</h3>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Team name"
                value={newTeamName}
                onChange={(e) => {
                  setNewTeamName(e.target.value);
                  if (teamNameError) setTeamNameError('');
                }}
                disabled={loading}
                required
                autoFocus
                error={teamNameError}
              />
              <Button type="submit" disabled={loading || !newTeamName.trim()}>
                Create
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewTeamName('');
                  setTeamNameError('');
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Unassigned Participants */}
        <div className="lg:col-span-1">
          <ParticipantList
            participants={participants}
            onDragStart={handleDragStart}
            disabled={disabled || loading}
          />
        </div>

        {/* Teams Grid */}
        <div className="lg:col-span-2">
          {teams.length === 0 ? (
            <div className="rounded-lg border border-gray-300 bg-gray-50 p-8 text-center">
              <p className="text-gray-500">
                No teams created yet. Click "Create New Team" to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {teams.map((team) => (
                <div
                  key={team.id}
                  onDragOver={(e) => handleDragOver(e, team.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, team.id, assignParticipant)}
                  onDragEnd={handleDragEnd}
                  className={`transition-all ${
                    dropTargetTeamId === team.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                  }`}
                >
                  <TeamCard
                    teamId={team.id}
                    teamName={team.name}
                    participantIds={team.participantIds}
                    participants={participants}
                    score={team.cumulativeScore}
                    onDeleteTeam={handleDeleteTeam}
                    onRemoveParticipant={removeParticipant}
                    disabled={disabled || loading}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <p className="text-lg font-medium text-gray-900">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}
