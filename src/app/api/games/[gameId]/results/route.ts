// API Route: GET /api/games/[gameId]/results
// Feature: 006-results-dashboard, User Story 3
// Returns final rankings with winner highlighting

import { type NextRequest, NextResponse } from 'next/server';
import { GetResults } from '@/server/application/use-cases/results/GetResults';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';
import { createAnswerRepository, createGameRepository } from '@/server/infrastructure/repositories';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    // Validate session
    let _sessionId: string;
    try {
      const sessionService = SessionServiceContainer.getSessionService();
      _sessionId = await sessionService.requireCurrentSession();
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
