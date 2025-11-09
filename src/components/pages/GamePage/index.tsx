'use client';

import { EpisodeRegistrationForm } from '@/components/domain/game/EpisodeRegistrationForm';
import { ResultReveal } from '@/components/domain/game/ResultReveal';
import { ScoreBoard } from '@/components/domain/game/ScoreBoard';
import { TurnDisplay } from '@/components/domain/game/TurnDisplay';
import { VotingInterface } from '@/components/domain/game/VotingInterface';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useGamePage } from './hooks/useGamePage';

export interface GamePageProps {
  sessionId: string;
  participantId: string;
}

/**
 * GamePage
 * Main game orchestration component
 */
export function GamePage({ sessionId, participantId }: GamePageProps) {
  const {
    gameState,
    isLoading,
    error,
    actionLoading,
    currentParticipant,
    currentTeamId,
    isHost,
    handleEpisodeSubmit,
    handleVoteSubmit,
    handleContinue,
    reload,
  } = useGamePage({ sessionId, participantId });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">セッション: {sessionId}</h1>
              <p className="text-sm text-gray-600">
                {currentParticipant?.nickname} {isHost && '(ホスト)'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">参加者</div>
              <div className="text-xl font-bold">{gameState.participants.length}人</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preparation Phase */}
            {gameState.phase === 'preparation' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">エピソードを登録してください</h2>
                <p className="text-gray-600 mb-6">
                  2つの本当のエピソードと1つの嘘のエピソードを入力してください
                </p>
                <EpisodeRegistrationForm
                  participantId={participantId}
                  onSubmit={handleEpisodeSubmit}
                  isLoading={actionLoading}
                />
              </div>
            )}

            {/* Voting Phase */}
            {gameState.phase === 'voting' &&
              gameState.currentPresentingTeam &&
              gameState.episodes && (
                <>
                  <TurnDisplay
                    presentingTeamName={gameState.currentPresentingTeam.teamName}
                    presentingPlayerName={gameState.currentPresentingTeam.playerName}
                    episodes={gameState.episodes}
                    phase="voting"
                  />
                  {currentTeamId !== gameState.currentPresentingTeam.teamId && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <VotingInterface
                        episodes={gameState.episodes}
                        onVoteSubmit={handleVoteSubmit}
                        isLoading={actionLoading}
                        hasVoted={gameState.hasVoted}
                      />
                    </div>
                  )}
                  {currentTeamId === gameState.currentPresentingTeam.teamId && (
                    <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-6 text-center">
                      <p className="text-lg font-medium">あなたのチームのターンです</p>
                      <p className="text-gray-600 mt-2">他のチームの投票を待っています...</p>
                    </div>
                  )}
                </>
              )}

            {/* Reveal Phase */}
            {gameState.phase === 'reveal' &&
              gameState.revealData &&
              gameState.episodes &&
              gameState.currentPresentingTeam && (
                <ResultReveal
                  correctEpisodeNumber={gameState.revealData.correctEpisodeNumber}
                  episodes={gameState.episodes}
                  voteResults={gameState.revealData.voteResults}
                  presentingTeamPoints={gameState.revealData.presentingTeamPoints}
                  presentingTeamName={gameState.currentPresentingTeam.teamName}
                  onContinue={handleContinue}
                />
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {gameState.teams.length > 0 && (
              <ScoreBoard
                teams={gameState.teams.map((t) => ({
                  teamId: t.id,
                  teamName: t.name,
                  score: t.score,
                  memberIds: t.memberIds,
                }))}
                currentTeamId={currentTeamId || undefined}
              />
            )}

            {/* Participants List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">参加者一覧</h3>
              <div className="space-y-2">
                {gameState.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`p-2 rounded ${participant.id === participantId ? 'bg-blue-50' : 'bg-gray-50'}`}
                  >
                    <div className="font-medium">{participant.nickname}</div>
                    {participant.id === gameState.hostId && (
                      <div className="text-xs text-gray-600">ホスト</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
