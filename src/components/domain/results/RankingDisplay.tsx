// Domain Component: Ranking Display
// Feature: 006-results-dashboard, User Story 3
// Displays ranked list of participants with winner highlighting

'use client';

import type { ParticipantRankingDto } from '@/server/application/dto/RankingDto';

export interface RankingDisplayProps {
  rankings: ParticipantRankingDto[];
  onShowDetails?: (nickname: string) => void;
}

export default function RankingDisplay({ rankings, onShowDetails }: RankingDisplayProps) {
  if (rankings.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600">まだ回答がありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rankings.map((entry, index) => {
        const isWinner = entry.isWinner;
        const correctCount = Object.values(entry.selections).filter((s) => s.wasCorrect).length;
        const totalCount = Object.values(entry.selections).length;

        return (
          <div
            key={`${entry.nickname}-${index}`}
            className={`rounded-lg border-2 p-5 shadow-md transition-all hover:shadow-lg ${
              isWinner
                ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              {/* Left: Rank and Nickname */}
              <div className="flex items-center gap-4">
                {/* Rank Badge */}
                <div
                  className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${
                    isWinner ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-100 text-gray-700'
                  } shadow-md`}
                >
                  {entry.rank === 1 && isWinner ? (
                    <span className="text-2xl">👑</span>
                  ) : (
                    <span className="text-xl font-bold">#{entry.rank}</span>
                  )}
                </div>

                {/* Nickname and Stats */}
                <div>
                  <h3
                    className={`text-xl font-semibold ${
                      isWinner ? 'text-yellow-900' : 'text-gray-900'
                    }`}
                  >
                    {entry.nickname}
                  </h3>
                  <p className="text-sm text-gray-600">
                    正解数: {correctCount} / {totalCount}
                  </p>
                </div>
              </div>

              {/* Right: Score */}
              <div className="text-right">
                <p
                  className={`text-3xl font-bold ${isWinner ? 'text-yellow-700' : 'text-blue-600'}`}
                >
                  {entry.totalScore}
                </p>
                <p className="text-sm text-gray-600">点</p>
              </div>
            </div>

            {/* Details Button (Optional) */}
            {onShowDetails && (
              <button
                type="button"
                onClick={() => onShowDetails(entry.nickname)}
                className="mt-3 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                回答詳細を表示
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
