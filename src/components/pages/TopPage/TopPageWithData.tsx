/**
 * TopPageWithData - Client Component Wrapper
 * Feature: 005-top-active-games (User Story 4)
 * Feature: 006-results-dashboard (Dashboard authorization support)
 *
 * Wraps TopPage with auto-refresh functionality using React Query
 * Handles loading states and error states
 */

'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import { useActiveGames } from './hooks/useActiveGames';
import { TopPage } from './index';

export interface TopPageWithDataProps {
  /** User's nickname from session */
  nickname: string;
  /** Current user's session ID (for creator authorization) */
  currentSessionId: string;
}

/**
 * Client Component that fetches active games with auto-refresh
 * Displays loading state on initial load, then uses background refresh
 */
export function TopPageWithData({ nickname, currentSessionId }: TopPageWithDataProps) {
  const { games, isLoading, isFetching, error, refetch } = useActiveGames();

  // Show loading skeleton only on initial load
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">ようこそ、{nickname}さん!</h1>
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">出題中のゲーム</h2>
          </div>
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
                <div className="h-6 bg-gray-200 rounded mb-4 w-3/4" />
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">ようこそ、{nickname}さん!</h1>
          </div>
          <EmptyState
            message="ゲームの読み込みに失敗しました"
            subMessage="もう一度お試しください"
            action={
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                再試行
              </button>
            }
          />
        </div>
      </div>
    );
  }

  // Show loading indicator during background refresh
  const loadingIndicator = isFetching && !isLoading && (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2">
        <svg
          className="animate-spin h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-sm">更新中...</span>
      </div>
    </div>
  );

  return (
    <>
      {loadingIndicator}
      <TopPage nickname={nickname} games={games} currentSessionId={currentSessionId} />
    </>
  );
}
