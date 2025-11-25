// API Route: GET /api/games/[gameId]/results
// Feature: 006-results-dashboard, User Story 3
// Returns final rankings with winner highlighting

import { NextResponse, type NextRequest } from 'next/server';
import { GetResults } from '@/server/application/use-cases/results/GetResults';
import { createGameRepository, createAnswerRepository } from '@/server/infrastructure/repositories';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';

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

    // Execute use case
    const gameRepository = createGameRepository();
    const answerRepository = createAnswerRepository();
    const useCase = new GetResults(gameRepository, answerRepository);
    const result = await useCase.execute(gameId);

    // Handle errors
    if (!result.success) {
      const errorMessages = Object.values(result.errors).flat();
      return NextResponse.json(
        {
          error: 'Failed to get results',
          details: errorMessages.join(', '),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/games/[gameId]/results:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
