import { type NextRequest, NextResponse } from 'next/server';
import { ValidationError } from '@/server/application/errors/ApplicationErrors';
import { CreateSessionUseCase } from '@/server/application/use-cases/sessions/CreateSessionUseCase';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';
import { InMemoryParticipantRepository } from '@/server/infrastructure/repositories/InMemoryParticipantRepository';

/**
 * POST /api/sessions
 * Creates a new game session with host
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const sessionRepository = InMemoryGameSessionRepository.getInstance();
    const participantRepository = InMemoryParticipantRepository.getInstance();
    const useCase = new CreateSessionUseCase(sessionRepository, participantRepository);

    const result = await useCase.execute({
      hostNickname: body.hostNickname,
      scoringRules: body.scoringRules,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
