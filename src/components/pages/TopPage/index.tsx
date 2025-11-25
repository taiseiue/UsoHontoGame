// TOP Page Components
// Feature: 001-session-top-page, 005-top-active-games
// Presentational components for the home/landing page

import { ActiveGamesList } from '@/components/domain/game/ActiveGamesList';
import { NicknameInput } from '@/components/domain/session/NicknameInput';
import { EmptyState } from '@/components/ui/EmptyState';
import type { TopPageProps } from './TopPage.types';

/**
 * TopPageNicknameSetup - Component for nickname setup state
 * Displayed when user doesn't have a nickname set
 * Pure presentational component with no business logic
 */
export function TopPageNicknameSetup() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <NicknameInput />
    </div>
  );
}

/**
 * TopPage - Main component for logged-in users
 * Displayed when user has nickname set
 * Pure presentational component with no business logic
 *
 * Feature 005: Now displays only active games (出題中 status)
 * Feature 006: Passes currentSessionId for dashboard authorization
 * Shows empty state when no active games available
 *
 * @param props - Component props including nickname, games, and currentSessionId
 */
export function TopPage({ nickname, games, currentSessionId }: TopPageProps) {
  const hasGames = games && games.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">ようこそ、{nickname}さん!</h1>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">出題中のゲーム</h2>
        </div>

        {hasGames ? (
          <ActiveGamesList games={games} currentSessionId={currentSessionId} />
        ) : (
          <EmptyState
            message="現在、出題中のゲームはありません"
            subMessage="新しいゲームが開始されるまでお待ちください"
          />
        )}
      </div>
    </div>
  );
}
