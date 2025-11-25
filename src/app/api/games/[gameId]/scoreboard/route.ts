// API Route: Scoreboard
// Feature: 006-results-dashboard, User Story 2
// Returns calculated scores with answer details

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CalculateScores } from '@/server/application/use-cases/results/CalculateScores';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';
import { createGameRepository, createAnswerRepository } from '@/server/infrastructure/repositories';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    // Validate session
    let sessionId: string;
    try {
      const sessionService = SessionServiceContainer.getSessionService();
      sessionId = await sessionService.requireCurrentSession();
    } catch {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Session required' },
        { status: 401 }
      );
    }

    // Execute CalculateScores use case
    const gameRepository = createGameRepository();
    const answerRepository = createAnswerRepository();
    const useCase = new CalculateScores(gameRepository, answerRepository);

    const result = await useCase.execute(gameId);

    // Handle errors from use case
    if (!result.success) {
      const errorMessage = result.errors._form?.[0] || 'Unknown error';

      if (errorMessage.includes('not found')) {
        return NextResponse.json(
          { error: 'Game not found', details: `No game with ID ${gameId}` },
          { status: 404 }
        );
      }

      if (errorMessage.includes('only available')) {
        return NextResponse.json(
          {
            error: 'Game not closed',
            details: "Scoreboard only available when game status is '締切'",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: 'Bad Request', details: errorMessage }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Scoreboard API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
