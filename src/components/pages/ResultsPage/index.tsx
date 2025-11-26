// Results Page Component
// Feature: 006-results-dashboard, User Story 3
// Displays final rankings with winner celebration

'use client';

import { useEffect, useState } from 'react';
import RankingDisplay from '@/components/domain/results/RankingDisplay';
import WinnerCelebration from '@/components/domain/results/WinnerCelebration';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';
import type { ResultsPageData, ResultsPageProps } from './ResultsPage.types';

export function ResultsPage({ gameId, initialData }: ResultsPageProps) {
  const [data, setData] = useState<ResultsPageData | null>(initialData || null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (initialData) return;

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/games/${gameId}/results`);
        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.details || errorData.error);
          return;
        }
        const resultsData = await response.json();
        setData(resultsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [gameId, initialData]);

  // Trigger celebration animation when data loads
  useEffect(() => {
    if (data && data.rankings.length > 0) {
      // Small delay to ensure component is mounted
      setTimeout(() => setShowCelebration(true), 100);
    }
  }, [data]);

  const winners =
    data?.rankings
      .filter((r) => r.isWinner)
      .map((r) => ({ nickname: r.nickname, score: r.totalScore })) || [];

  return (
    <AccessibilityProvider>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <a
            href="/"
            className="mb-4 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← TOPページに戻る
          </a>
          <h1 className="text-3xl font-bold text-gray-900">最終結果</h1>
          {data && (
            <p className="mt-2 text-sm text-gray-600">
              {data.gameName} - 参加者数: {data.totalParticipants}名 - 最高得点: {data.highestScore}
              点
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="text-sm text-gray-600">結果を集計中...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h3 className="text-lg font-semibold text-red-900">エラーが発生しました</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {data && !error && (
          <div className="space-y-8">
            {/* Winner Celebration */}
            {winners.length > 0 && (
              <WinnerCelebration winners={winners} isActive={showCelebration} />
            )}

            {/* Rankings Section */}
            <div>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">ランキング</h2>
              <RankingDisplay rankings={data.rankings} />
            </div>

            {/* Summary Statistics */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">統計情報</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{data.totalParticipants}</p>
                  <p className="text-sm text-gray-600">参加者数</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{data.highestScore}点</p>
                  <p className="text-sm text-gray-600">最高得点</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {data.averageScore.toFixed(1)}点
                  </p>
                  <p className="text-sm text-gray-600">平均得点</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {data.medianScore.toFixed(1)}点
                  </p>
                  <p className="text-sm text-gray-600">中央値</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AccessibilityProvider>
  );
}
