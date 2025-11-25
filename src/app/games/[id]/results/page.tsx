// App Router Page: /games/[id]/results
// Feature: 006-results-dashboard, User Story 3
// Displays final rankings with winner celebration

import { redirect } from 'next/navigation';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';
import { GetResults } from '@/server/application/use-cases/results/GetResults';
import { createGameRepository, createAnswerRepository } from '@/server/infrastructure/repositories';
import { ResultsPage } from '@/components/pages/ResultsPage';

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
