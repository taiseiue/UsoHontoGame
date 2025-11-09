'use client';

import { RankingDisplay } from '@/components/domain/game/RankingDisplay';
import { TeamPerformanceSummary } from '@/components/domain/game/TeamPerformanceSummary';
import { ConfettiAnimation } from '@/components/ui/ConfettiAnimation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useResults } from './hooks/useResults';

export interface ResultsPageProps {
  /** Session ID to display results for */
  sessionId: string;
}

/**
 * ResultsPage component
 *
 * Displays final game results with:
 * - Team rankings
 * - Winner celebration
 * - Performance summaries
 * - Confetti animation
 */
export function ResultsPage({ sessionId }: ResultsPageProps) {
  const { isLoading, results, error } = useResults(sessionId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Results</h2>
          <p className="text-gray-600">Results not available for this session</p>
        </div>
      </div>
    );
  }

  const hasWinner = results.winner !== null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-8 px-4">
      {/* Confetti Animation for Winner */}
      <ConfettiAnimation active={hasWinner} duration={6000} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎉 Game Complete! 🎉</h1>
          <p className="text-gray-600">Thank you for playing Two Truths and a Lie</p>
        </div>

        {/* Winner Announcement */}
        {hasWinner && results.winner && (
          <div className="mb-8 p-6 bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-100 border-2 border-yellow-400 rounded-xl shadow-lg text-center animate-pulse">
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="text-3xl font-bold text-yellow-800 mb-2">Congratulations!</h2>
            <p className="text-xl text-yellow-700">
              <span className="font-bold">{results.winner.name}</span> wins with{' '}
              <span className="font-bold">{results.winner.score}</span> points!
            </p>
          </div>
        )}

        {/* Tie Announcement */}
        {!hasWinner && results.teams.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 rounded-xl shadow-lg text-center">
            <div className="text-5xl mb-3">🤝</div>
            <h2 className="text-3xl font-bold text-blue-800 mb-2">It's a Tie!</h2>
            <p className="text-xl text-blue-700">
              Multiple teams share the top score - everyone's a winner!
            </p>
          </div>
        )}

        {/* Rankings */}
        <div className="mb-8">
          <RankingDisplay teams={results.teams} winnerId={results.winner?.id} />
        </div>

        {/* Performance Summaries */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Team Performance Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.teams.map((team) => (
              <TeamPerformanceSummary
                key={team.id}
                teamId={team.id}
                performance={results.performances?.[team.id]}
                isWinner={hasWinner && team.id === results.winner?.id}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-gray-500 text-sm">Session ID: {results.sessionId}</p>
          <p className="text-gray-400 text-xs mt-2">
            Thank you for playing! We hope you had fun. 🎊
          </p>
        </div>
      </div>
    </div>
  );
}
