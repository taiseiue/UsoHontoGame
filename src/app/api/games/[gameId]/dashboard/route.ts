// API Route: Response Status Dashboard
// Feature: 006-results-dashboard, User Story 1
// Returns real-time response submission status for moderators

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { GetResponseStatus } from '@/server/application/use-cases/results/GetResponseStatus';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';
import { createGameRepository, createAnswerRepository } from '@/server/infrastructure/repositories';
import { GameId } from '@/server/domain/value-objects/GameId';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    // Extract gameId from params
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
            details: "Dashboard only available when game status is '出題中'",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: 'Bad Request', details: errorMessage }, { status: 400 });
    }

    // Verify authorization (only game creator can view dashboard)
    const game = await gameRepository.findById(new GameId(gameId));
    if (game && game.creatorId !== sessionId) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          details: 'Only game creator can view response status',
        },
        { status: 403 }
      );
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
