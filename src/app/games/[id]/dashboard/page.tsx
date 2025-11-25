// App Router Page: Response Status Dashboard
// Feature: 006-results-dashboard, User Story 1
// Server Component that handles session check and delegates to ResponseStatusPage

import { redirect } from 'next/navigation';
import { ResponseStatusPage } from '@/components/pages/ResponseStatusPage';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';
import { GetResponseStatus } from '@/server/application/use-cases/results/GetResponseStatus';
import { createGameRepository, createAnswerRepository } from '@/server/infrastructure/repositories';
import { GameId } from '@/server/domain/value-objects/GameId';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Next.js App Router page for /games/[id]/dashboard
 * Handles session check, authorization, and initial data fetching
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

  // Fetch initial response status data (for SSR)
  const gameRepository = createGameRepository();
  const answerRepository = createAnswerRepository();
  const useCase = new GetResponseStatus(gameRepository, answerRepository);

  const result = await useCase.execute(gameId);

  // Check authorization - verify user is game creator
  const game = await gameRepository.findById(new GameId(gameId));
  if (game && game.creatorId !== sessionId) {
    // Not authorized - redirect to game detail page
    redirect(`/games/${gameId}`);
  }

  // Pass initial data to client component
  // Client component will handle polling and real-time updates
  return (
    <ResponseStatusPage gameId={gameId} initialData={result.success ? result.data : undefined} />
  );
}
