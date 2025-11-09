export interface Team {
  id: string;
  name: string;
  score: number;
}

export interface RankingDisplayProps {
  /** List of teams to display rankings for */
  teams: Team[];
  /** ID of the winning team (for highlighting) */
  winnerId?: string | null;
}

/**
 * RankingDisplay component
 *
 * Displays team rankings ordered by score with position indicators
 */
export function RankingDisplay({ teams, winnerId }: RankingDisplayProps) {
  // Sort teams by score (descending)
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  // Medal emojis for top 3
  const getMedalEmoji = (position: number): string => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  };

  return (
    <div data-testid="ranking-display" className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Final Rankings</h2>

      <div className="space-y-3">
        {sortedTeams.map((team, index) => {
          const position = index + 1;
          const isWinner = winnerId && team.id === winnerId;
          const medal = getMedalEmoji(position);

          return (
            <div
              key={team.id}
              data-testid={`team-${team.id}`}
              className={`
                flex items-center justify-between p-4 rounded-lg shadow-md transition-all
                ${
                  isWinner
                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 scale-105'
                    : 'bg-white hover:bg-gray-50'
                }
              `}
            >
              {/* Position and Medal */}
              <div className="flex items-center gap-3 min-w-[80px]">
                <span
                  className={`
                    text-2xl font-bold
                    ${isWinner ? 'text-yellow-600' : 'text-gray-500'}
                  `}
                >
                  #{position}
                </span>
                {medal && <span className="text-2xl">{medal}</span>}
              </div>

              {/* Team Name */}
              <div className="flex-1 px-4">
                <h3
                  className={`
                    text-lg font-semibold
                    ${isWinner ? 'text-yellow-800' : 'text-gray-800'}
                  `}
                >
                  {team.name}
                </h3>
                {isWinner && <p className="text-sm text-yellow-600 font-medium">🏆 Winner</p>}
              </div>

              {/* Score */}
              <div
                className={`
                  text-right min-w-[100px]
                  ${isWinner ? 'text-yellow-700' : 'text-gray-600'}
                `}
              >
                <div className="text-2xl font-bold">{team.score}</div>
                <div className="text-xs uppercase tracking-wide">points</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tie message if applicable */}
      {sortedTeams.length >= 2 && sortedTeams[0].score === sortedTeams[1].score && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-blue-800 font-medium">
            🤝 It's a tie! Multiple teams share the top score.
          </p>
        </div>
      )}
    </div>
  );
}
