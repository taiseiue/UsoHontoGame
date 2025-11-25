// Domain Component: ScoreCard
// Feature: 006-results-dashboard, User Story 2
// Displays individual participant's score with answer details

import type { ScoreCardProps } from '@/components/pages/ScoreboardPage/ScoreboardPage.types';

export default function ScoreCard({ score, rank }: ScoreCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <span className="text-xl font-bold text-blue-600">#{rank}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{score.nickname}</h3>
            <p className="text-sm text-gray-600">
              {score.details.filter((d) => d.wasCorrect).length} / {score.details.length} 正解
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-blue-600">{score.totalScore}</p>
          <p className="text-sm text-gray-600">点</p>
        </div>
      </div>

      {/* Answer Details */}
      <div className="mt-4 space-y-3">
        {score.details.map((detail, index) => (
          <div
            key={detail.presenterId}
            className={`rounded-md p-3 ${detail.wasCorrect ? 'bg-green-50' : 'bg-red-50'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {detail.presenterNickname}さんの回答
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  選択: {detail.selectedEpisodeText || '未選択'}
                </p>
              </div>
              <div className="ml-4 text-right">
                {detail.wasCorrect ? (
                  <div className="flex items-center gap-1 text-green-700">
                    <span className="text-lg">✓</span>
                    <span className="font-semibold">+{detail.pointsEarned}点</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-700">
                    <span className="text-lg">✗</span>
                    <span className="font-semibold">0点</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
