import { type NextRequest, NextResponse } from 'next/server';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@/server/application/errors/ApplicationErrors';
import { JoinSessionUseCase } from '@/server/application/use-cases/sessions/JoinSessionUseCase';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';
import { InMemoryParticipantRepository } from '@/server/infrastructure/repositories/InMemoryParticipantRepository';

/**
 * POST /api/sessions/[id]/join
 * Allows a participant to join an existing session
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { id: sessionId } = await params;

    const sessionRepository = InMemoryGameSessionRepository.getInstance();
    const participantRepository = InMemoryParticipantRepository.getInstance();
    const useCase = new JoinSessionUseCase(sessionRepository, participantRepository);

    const result = await useCase.execute({
      sessionId,
      nickname: body.nickname,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error('Error joining session:', error);
    return NextResponse.json({ error: 'Failed to join session' }, { status: 500 });
  }
}
