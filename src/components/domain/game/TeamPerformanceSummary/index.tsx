export interface TeamPerformance {
  teamId: string;
  teamName: string;
  totalScore: number;
  episodesPresented: number;
  correctGuesses: number;
  deceiveSuccesses: number;
  participantCount: number;
}

export interface TeamPerformanceSummaryProps {
  /** Team ID to display performance for */
  teamId: string;
  /** Performance data for the team */
  performance?: TeamPerformance;
  /** Whether the team is the winner */
  isWinner?: boolean;
}

/**
 * TeamPerformanceSummary component
 *
 * Displays detailed performance statistics for a team
 */
export function TeamPerformanceSummary({
  teamId,
  performance,
  isWinner = false,
}: TeamPerformanceSummaryProps) {
  if (!performance) {
    return (
      <div data-testid={`performance-${teamId}`} className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500 text-sm">Performance data not available</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Episodes Presented',
      value: performance.episodesPresented,
      icon: '📖',
    },
    {
      label: 'Correct Guesses',
      value: performance.correctGuesses,
      icon: '✓',
    },
    {
      label: 'Successful Deceptions',
      value: performance.deceiveSuccesses,
      icon: '🎭',
    },
    {
      label: 'Team Members',
      value: performance.participantCount,
      icon: '👥',
    },
  ];

  const avgPointsPerMember =
    performance.participantCount > 0
      ? Math.round(performance.totalScore / performance.participantCount)
      : 0;

  return (
    <div
      data-testid={`performance-${teamId}`}
      className={`
        p-6 rounded-lg shadow-md
        ${isWinner ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300' : 'bg-white border border-gray-200'}
      `}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className={`text-lg font-bold ${isWinner ? 'text-yellow-800' : 'text-gray-800'}`}>
          {performance.teamName}
          {isWinner && <span className="ml-2">🏆</span>}
        </h3>
        <div className="flex items-center gap-4 mt-2">
          <div>
            <span className="text-3xl font-bold text-blue-600">{performance.totalScore}</span>
            <span className="text-sm text-gray-500 ml-1">total points</span>
          </div>
          <div className="border-l border-gray-300 pl-4">
            <span className="text-xl font-semibold text-green-600">{avgPointsPerMember}</span>
            <span className="text-sm text-gray-500 ml-1">per member</span>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <div className="text-lg font-semibold text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Insights */}
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Performance Insights</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          {performance.correctGuesses > 0 && (
            <li>• Strong detective skills with {performance.correctGuesses} correct guesses</li>
          )}
          {performance.deceiveSuccesses > 0 && (
            <li>
              • Excellent storytelling with {performance.deceiveSuccesses} successful deceptions
            </li>
          )}
          {avgPointsPerMember > 15 && <li>• Outstanding team coordination and strategy</li>}
          {performance.episodesPresented > 0 && (
            <li>• Participated actively with {performance.episodesPresented} episodes</li>
          )}
        </ul>
      </div>
    </div>
  );
}
