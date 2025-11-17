// App Router Page: Game List
// Feature: 002-game-preparation
// Server Component that fetches data and delegates to GameListPage component

import { redirect } from 'next/navigation';
import { getGamesAction } from '@/app/actions/game';
import { GameListPage, GameListPageError } from '@/components/pages/GameListPage';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';

/**
 * Next.js App Router page for /games
 * Handles session check, data fetching, and error states
 */
export default async function Page() {
  // Check session
  const sessionService = SessionServiceContainer.getSessionService();
  const sessionId = await sessionService.getCurrentSessionId();
  if (!sessionId) {
    redirect('/');
  }

  // Fetch games
  const result = await getGamesAction();

  // Handle errors
  if (!result.success) {
    const errorMessage = result.errors._form?.[0] || 'ゲームの読み込みに失敗しました';
    return <GameListPageError errorMessage={errorMessage} />;
  }

  // Render page component with games data
  return <GameListPage games={result.games} />;
}
