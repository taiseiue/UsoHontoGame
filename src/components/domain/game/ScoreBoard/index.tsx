'use client';

import { type TeamScore, useScoreboard } from './hooks/useScoreboard';

export type { TeamScore };

export interface ScoreBoardProps {
  teams: TeamScore[];
  currentTeamId?: string;
}

/**
 * ScoreBoard
 * Displays current team scores
 */
export function ScoreBoard({ teams, currentTeamId }: ScoreBoardProps) {
  const { sortedTeams, isTeamLeading, isCurrentTeam, hasScores } = useScoreboard({
    teams,
    currentTeamId,
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">スコアボード</h2>

      <div className="space-y-3">
        {sortedTeams.map((team, index) => {
          const isCurrent = isCurrentTeam(team.teamId);
          const isLeading = isTeamLeading(team.teamId);

          return (
            <div
              key={team.teamId}
              className={`p-4 rounded-lg border-2 transition-all ${
                isCurrent
                  ? 'border-blue-500 bg-blue-50'
                  : isLeading
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-lg flex items-center gap-2">
                      {team.teamName}
                      {isLeading && (
                        <span className="text-yellow-600" title="トップ">
                          👑
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-sm text-blue-600 font-normal">(あなたのチーム)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{team.memberIds.length}人のメンバー</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">{team.score}点</div>
              </div>
            </div>
          );
        })}
      </div>

      {!hasScores && <div className="text-center text-gray-500 py-8">まだスコアがありません</div>}
    </div>
  );
}
