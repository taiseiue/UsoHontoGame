// App Router Page: Response Status Dashboard
// Feature: 006-results-dashboard, User Story 1
// Server Component that handles session check and delegates to ResponseStatusPage

import { redirect } from 'next/navigation';
import { ResponseStatusPage } from '@/components/pages/ResponseStatusPage';
import { GetResponseStatus } from '@/server/application/use-cases/results/GetResponseStatus';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';
import { createAnswerRepository, createGameRepository } from '@/server/infrastructure/repositories';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Next.js App Router page for /games/[id]/dashboard
 * Handles session check and initial data fetching
 * Dashboard is publicly accessible to all users
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

  // Pass initial data to client component
  // Client component will handle polling and real-time updates
  return (
    <ResponseStatusPage gameId={gameId} initialData={result.success ? result.data : undefined} />
  );
}
