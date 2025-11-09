'use client';

import { useState } from 'react';

/**
 * useDragAndDrop hook - Manages drag-and-drop state for participant assignment
 * Extracted business logic from TeamManager component
 */
export function useDragAndDrop() {
  const [draggedParticipantId, setDraggedParticipantId] = useState<string | null>(null);
  const [dropTargetTeamId, setDropTargetTeamId] = useState<string | null>(null);

  /**
   * Handle drag start event
   */
  const handleDragStart = (participantId: string) => {
    setDraggedParticipantId(participantId);
  };

  /**
   * Handle drag over event (for drop zones)
   */
  const handleDragOver = (e: React.DragEvent, teamId: string) => {
    e.preventDefault(); // Required to allow drop
    setDropTargetTeamId(teamId);
  };

  /**
   * Handle drag leave event
   */
  const handleDragLeave = () => {
    setDropTargetTeamId(null);
  };

  /**
   * Handle drop event
   */
  const handleDrop = (
    e: React.DragEvent,
    teamId: string,
    onAssign: (participantId: string, teamId: string) => void
  ) => {
    e.preventDefault();

    if (draggedParticipantId) {
      onAssign(draggedParticipantId, teamId);
    }

    // Reset state
    setDraggedParticipantId(null);
    setDropTargetTeamId(null);
  };

  /**
   * Handle drag end event
   */
  const handleDragEnd = () => {
    setDraggedParticipantId(null);
    setDropTargetTeamId(null);
  };

  return {
    draggedParticipantId,
    dropTargetTeamId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
}
