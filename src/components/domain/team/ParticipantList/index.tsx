'use client';

export interface ParticipantListProps {
  participants: Array<{
    id: string;
    nickname: string;
    teamId: string | null;
  }>;
  onDragStart?: (participantId: string) => void;
  disabled?: boolean;
}

/**
 * ParticipantList component - Displays list of participants for drag-and-drop
 * Pure presentational component
 */
export function ParticipantList({
  participants,
  onDragStart,
  disabled = false,
}: ParticipantListProps) {
  // Filter unassigned participants
  const unassignedParticipants = participants.filter((p) => p.teamId === null);

  if (unassignedParticipants.length === 0) {
    return (
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">All participants have been assigned to teams</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-gray-900">Unassigned Participants</h3>
      <div className="space-y-2">
        {unassignedParticipants.map((participant) => (
          <div
            key={participant.id}
            draggable={!disabled}
            onDragStart={() => onDragStart?.(participant.id)}
            className={`rounded-md border border-gray-200 bg-gray-50 p-3 ${
              !disabled
                ? 'cursor-move hover:border-blue-400 hover:bg-blue-50'
                : 'cursor-not-allowed opacity-50'
            }`}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={`Drag ${participant.nickname} to assign to a team`}
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-600">⋮⋮</span>
              <span className="text-sm font-medium text-gray-900">{participant.nickname}</span>
            </div>
          </div>
        ))}
      </div>
      {!disabled && (
        <p className="mt-3 text-xs text-gray-500">
          Drag participants to a team card to assign them
        </p>
      )}
    </div>
  );
}
