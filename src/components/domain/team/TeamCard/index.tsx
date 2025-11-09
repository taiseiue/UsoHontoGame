'use client';

import { Button } from '@/components/ui/Button';

export interface TeamCardProps {
  teamId: string;
  teamName: string;
  participantIds: string[];
  participants: Array<{
    id: string;
    nickname: string;
  }>;
  score: number;
  onDeleteTeam: (teamId: string) => void;
  onRemoveParticipant: (participantId: string) => void;
  disabled?: boolean;
}

/**
 * TeamCard component - Displays team information with participants
 * Pure presentational component
 */
export function TeamCard({
  teamId,
  teamName,
  participantIds,
  participants,
  score,
  onDeleteTeam,
  onRemoveParticipant,
  disabled = false,
}: TeamCardProps) {
  const teamParticipants = participants.filter((p) => participantIds.includes(p.id));

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
      {/* Team Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{teamName}</h3>
          <p className="text-sm text-gray-500">
            {teamParticipants.length} member{teamParticipants.length !== 1 ? 's' : ''}
            {' · '}Score: {score}
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDeleteTeam(teamId)}
          disabled={disabled}
          aria-label={`Delete ${teamName}`}
        >
          Delete Team
        </Button>
      </div>

      {/* Participants List */}
      <div className="space-y-2">
        {teamParticipants.length === 0 ? (
          <p className="text-sm italic text-gray-400">No participants yet</p>
        ) : (
          teamParticipants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between rounded-md bg-gray-50 p-2"
            >
              <span className="text-sm text-gray-700">{participant.nickname}</span>
              <button
                type="button"
                onClick={() => onRemoveParticipant(participant.id)}
                disabled={disabled}
                className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                aria-label={`Remove ${participant.nickname} from team`}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {/* Drop Zone Indicator */}
      {!disabled && (
        <div className="mt-3 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-3 text-center text-sm text-gray-500">
          Drag participants here to add them to this team
        </div>
      )}
    </div>
  );
}
