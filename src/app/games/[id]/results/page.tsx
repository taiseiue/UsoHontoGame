// App Router Page: /games/[id]/results
// Feature: 006-results-dashboard, User Story 3
// Displays final rankings with winner celebration

import { redirect } from 'next/navigation';
import { ResultsPage } from '@/components/pages/ResultsPage';
import { GetResults } from '@/server/application/use-cases/results/GetResults';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';
import { createAnswerRepository, createGameRepository } from '@/server/infrastructure/repositories';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  // Check session
  const sessionService = SessionServiceContainer.getSessionService();
  const sessionId = await sessionService.getCurrentSessionId();
  if (!sessionId) {
    redirect('/');
  }

  // Get game ID
  const { id: gameId } = await params;

  // Fetch initial data
  const gameRepository = createGameRepository();
  const answerRepository = createAnswerRepository();
  const useCase = new GetResults(gameRepository, answerRepository);
  const result = await useCase.execute(gameId);

  // Pass data to client component
  return <ResultsPage gameId={gameId} initialData={result.success ? result.data : undefined} />;
}
