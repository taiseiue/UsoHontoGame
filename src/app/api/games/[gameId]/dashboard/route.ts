// API Route: Response Status Dashboard
// Feature: 006-results-dashboard, User Story 1
// Feature: 007-game-closure, User Story 3 (added closed game support)
// Returns real-time response submission status (publicly accessible)

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { GetResponseStatus } from '@/server/application/use-cases/results/GetResponseStatus';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';
import { createAnswerRepository, createGameRepository } from '@/server/infrastructure/repositories';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    // Extract gameId from params
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

    // Execute GetResponseStatus use case
    const gameRepository = createGameRepository();
    const answerRepository = createAnswerRepository();
    const useCase = new GetResponseStatus(gameRepository, answerRepository);

    const result = await useCase.execute(gameId);

    // Handle errors from use case
    if (!result.success) {
      const errorMessage = result.errors._form?.[0] || 'Unknown error';

      // Determine appropriate status code
      if (errorMessage.includes('not found')) {
        return NextResponse.json(
          { error: 'Game not found', details: `No game with ID ${gameId}` },
          { status: 404 }
        );
      }

      if (errorMessage.includes('not accepting responses')) {
        return NextResponse.json(
          {
            error: 'Game not accepting responses',
            details: "Dashboard only available when game status is '出題中' or '締切'",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: 'Bad Request', details: errorMessage }, { status: 400 });
    }

    // Return successful response
    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
