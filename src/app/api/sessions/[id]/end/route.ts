import { type NextRequest, NextResponse } from 'next/server';
import { EndGameUseCase } from '@/server/application/use-cases/sessions/EndGameUseCase';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';

/**
 * POST /api/sessions/[id]/end
 * Ends the game and transitions to completed phase
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const sessionRepository = InMemoryGameSessionRepository.getInstance();

    const useCase = new EndGameUseCase(sessionRepository);

    const result = await useCase.execute({
      sessionId: id,
      hostId: body.hostId,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      // Map domain errors to HTTP status codes
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error.message.includes('already completed')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    console.error('Error ending game:', error);
    return NextResponse.json({ error: 'Failed to end game' }, { status: 500 });
  }
}
