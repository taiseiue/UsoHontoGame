// App Router Page: Game Detail/Edit
// Feature: 002-game-preparation
// Server Component that fetches data and delegates to GameDetailPage component

import { redirect } from 'next/navigation';
import { getGameDetailAction } from '@/app/actions/game';
import { GameDetailPage, GameDetailPageError } from '@/components/pages/GameDetailPage';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Next.js App Router page for /games/[id]
 * Handles session check, data fetching, and error states
 */
export default async function Page({ params }: PageProps) {
  // Check session
  const sessionService = SessionServiceContainer.getSessionService();
  const sessionId = await sessionService.getCurrentSessionId();
  if (!sessionId) {
    redirect('/');
  }

  // Get game ID from params
  const { id: gameId } = await params;

  // Fetch game details
  const result = await getGameDetailAction(gameId);

  // Handle errors
  if (!result.success) {
    const errorMessage = result.errors._form?.[0] || 'ゲームの読み込みに失敗しました';
    return <GameDetailPageError errorMessage={errorMessage} />;
  }

  // Render page component with game data
  return <GameDetailPage game={result.game} />;
}
