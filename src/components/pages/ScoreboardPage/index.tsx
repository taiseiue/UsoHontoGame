// Scoreboard Page Component
// Feature: 006-results-dashboard, User Story 2
// Displays calculated scores with answer details

'use client';

import { useEffect, useState } from 'react';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';
import ScoreCard from '@/components/domain/results/ScoreCard';
import type { ScoreboardData, ScoreboardPageProps } from './ScoreboardPage.types';

export function ScoreboardPage({ gameId, initialData }: ScoreboardPageProps) {
  const [data, setData] = useState<ScoreboardData | null>(initialData || null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;

    const fetchScoreboard = async () => {
      try {
        const response = await fetch(`/api/games/${gameId}/scoreboard`);
        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.details || errorData.error);
          return;
        }
        const scoreData = await response.json();
        setData(scoreData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load scoreboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScoreboard();
  }, [gameId, initialData]);

  return (
    <AccessibilityProvider>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <a
            href={`/games/${gameId}`}
            className="mb-4 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← ゲーム詳細に戻る
          </a>
          <h1 className="text-3xl font-bold text-gray-900">スコアボード</h1>
          {data && (
            <p className="mt-2 text-sm text-gray-600">
              {data.gameName} - 計算日時: {new Date(data.calculatedAt).toLocaleString('ja-JP')}
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="text-sm text-gray-600">スコアを計算中...</p>
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

        {/* Scoreboard */}
        {data && !error && (
          <div className="space-y-4">
            {data.scores.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p className="text-gray-600">まだ回答がありません</p>
              </div>
            ) : (
              data.scores.map((score, index) => (
                <ScoreCard key={score.nickname} score={score} rank={index + 1} />
              ))
            )}
          </div>
        )}
      </div>
    </AccessibilityProvider>
  );
}
