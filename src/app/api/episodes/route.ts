import { type NextRequest, NextResponse } from 'next/server';
import {
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from '@/server/application/errors/ApplicationErrors';
import { RegisterEpisodesUseCase } from '@/server/application/use-cases/episodes/RegisterEpisodesUseCase';
import { InMemoryParticipantRepository } from '@/server/infrastructure/repositories/InMemoryParticipantRepository';

/**
 * POST /api/episodes
 * Registers 3 episodes (2 truths, 1 lie) for a participant
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const participantRepository = InMemoryParticipantRepository.getInstance();
    const useCase = new RegisterEpisodesUseCase(participantRepository);

    const result = await useCase.execute({
      participantId: body.participantId,
      episodes: body.episodes,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof BusinessRuleError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    console.error('Error registering episodes:', error);
    return NextResponse.json({ error: 'Failed to register episodes' }, { status: 500 });
  }
}

/**
 * PUT /api/episodes
 * Updates episodes for a participant (before game starts)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const participantRepository = InMemoryParticipantRepository.getInstance();
    const useCase = new RegisterEpisodesUseCase(participantRepository);

    // Same use case can be used for update - it replaces episodes
    const result = await useCase.execute({
      participantId: body.participantId,
      episodes: body.episodes,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof BusinessRuleError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    console.error('Error updating episodes:', error);
    return NextResponse.json({ error: 'Failed to update episodes' }, { status: 500 });
  }
}
