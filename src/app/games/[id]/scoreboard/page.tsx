// App Router Page: Scoreboard
// Feature: 006-results-dashboard, User Story 2
// Server Component wrapper for scoreboard page

import { redirect } from 'next/navigation';
import { ScoreboardPage } from '@/components/pages/ScoreboardPage';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';
import { CalculateScores } from '@/server/application/use-cases/results/CalculateScores';
import { createGameRepository, createAnswerRepository } from '@/server/infrastructure/repositories';

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

  const { id: gameId } = await params;

  // Fetch initial scoreboard data
  const gameRepository = createGameRepository();
  const answerRepository = createAnswerRepository();
  const useCase = new CalculateScores(gameRepository, answerRepository);

  const result = await useCase.execute(gameId);

  return <ScoreboardPage gameId={gameId} initialData={result.success ? result.data : undefined} />;
}
