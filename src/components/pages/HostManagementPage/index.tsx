'use client';

import { useState } from 'react';
import { TeamManager } from '@/components/domain/team/TeamManager';
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useHostManagement } from './hooks/useHostManagement';

export interface HostManagementPageProps {
  sessionId: string;
  hostId: string;
}

/**
 * HostManagementPage component - Main page for host to manage game session
 * Orchestrates TeamManager and game control actions
 */
export function HostManagementPage({ sessionId, hostId }: HostManagementPageProps) {
  const [showEndGameConfirm, setShowEndGameConfirm] = useState(false);

  const { session, loading, error, startGame, endGame, canStartGame, getStartValidationMessage } =
    useHostManagement(sessionId, hostId);

  /**
   * Handle start game with validation
   */
  const handleStartGame = async () => {
    if (!canStartGame()) {
      const message = getStartValidationMessage();
      if (message) {
        alert(message);
      }
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to start the game? Teams cannot be modified after starting.'
    );

    if (confirmed) {
      try {
        await startGame();
      } catch (err) {
        console.error('Failed to start game:', err);
      }
    }
  };

  /**
   * Handle end game with confirmation modal
   */
  const handleEndGameClick = () => {
    setShowEndGameConfirm(true);
  };

  const handleEndGameConfirm = async () => {
    try {
      await endGame();
      setShowEndGameConfirm(false);
    } catch (err) {
      console.error('Failed to end game:', err);
    }
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  const isGameStarted = session.phase !== 'preparation';
  const isGameCompleted = session.phase === 'completed';
  const validationMessage = getStartValidationMessage();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Host Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Session ID: <span className="font-mono font-semibold">{sessionId}</span>
                {' · '}
                Phase: <span className="font-semibold capitalize">{session.phase}</span>
              </p>
            </div>
            <div className="flex gap-3">
              {!isGameStarted && (
                <Button onClick={handleStartGame} disabled={loading || !canStartGame()} size="lg">
                  Start Game
                </Button>
              )}
              {isGameStarted && !isGameCompleted && (
                <Button
                  variant="destructive"
                  onClick={handleEndGameClick}
                  disabled={loading}
                  size="lg"
                >
                  End Game
                </Button>
              )}
            </div>
          </div>

          {/* Validation Warning */}
          {!isGameStarted && validationMessage && (
            <div className="mt-4 rounded-md bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">⚠️ {validationMessage}</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Game Completed Message */}
          {isGameCompleted && (
            <div className="mt-4 rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">
                ✓ Game completed! View results or start a new session.
              </p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Participants</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {session.participants.filter((p) => p.role === 'player').length}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Teams Created</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{session.teams.length}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Unassigned</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {session.participants.filter((p) => p.role === 'player' && p.teamId === null).length}
            </p>
          </div>
        </div>

        {/* Team Manager */}
        {!isGameCompleted && (
          <TeamManager
            sessionId={sessionId}
            hostId={hostId}
            initialTeams={session.teams}
            initialParticipants={session.participants}
            disabled={isGameStarted}
          />
        )}

        {/* End Game Confirmation Modal */}
        <ConfirmationModal
          isOpen={showEndGameConfirm}
          onClose={() => setShowEndGameConfirm(false)}
          onConfirm={handleEndGameConfirm}
          title="End Game"
          message="Are you sure you want to end the game? This action cannot be undone and the session will be marked as completed."
          confirmText="End Game"
          cancelText="Cancel"
          variant="destructive"
          loading={loading}
        />
      </div>
    </div>
  );
}
