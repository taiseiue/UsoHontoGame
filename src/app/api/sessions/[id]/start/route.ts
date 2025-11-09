import { type NextRequest, NextResponse } from 'next/server';
import { StartGameUseCase } from '@/server/application/use-cases/sessions/StartGameUseCase';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';
import { InMemoryParticipantRepository } from '@/server/infrastructure/repositories/InMemoryParticipantRepository';
import { InMemoryTeamRepository } from '@/server/infrastructure/repositories/InMemoryTeamRepository';

/**
 * POST /api/sessions/[id]/start
 * Starts the game and transitions to presentation phase
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const sessionRepository = InMemoryGameSessionRepository.getInstance();
    const teamRepository = InMemoryTeamRepository.getInstance();
    const participantRepository = InMemoryParticipantRepository.getInstance();

    const useCase = new StartGameUseCase(sessionRepository, teamRepository, participantRepository);

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
      if (
        error.message.includes('already started') ||
        error.message.includes('Minimum') ||
        error.message.includes('must register') ||
        error.message.includes('must be assigned')
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    console.error('Error starting game:', error);
    return NextResponse.json({ error: 'Failed to start game' }, { status: 500 });
  }
}
