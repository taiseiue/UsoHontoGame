import { type NextRequest, NextResponse } from 'next/server';
import {
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from '@/server/application/errors/ApplicationErrors';
import { RevealAnswerUseCase } from '@/server/application/use-cases/turns/RevealAnswerUseCase';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';
import { InMemoryVoteRepository } from '@/server/infrastructure/repositories/InMemoryVoteRepository';

/**
 * POST /api/turns/[id]/reveal
 * Reveals the correct answer and calculates scores
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { id: turnId } = await params;

    const voteRepository = InMemoryVoteRepository.getInstance();
    const sessionRepository = InMemoryGameSessionRepository.getInstance();
    const useCase = new RevealAnswerUseCase(voteRepository, sessionRepository);

    const result = await useCase.execute({
      turnId,
      correctEpisodeNumber: body.correctEpisodeNumber,
      presentingTeamId: body.presentingTeamId,
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

    console.error('Error revealing answer:', error);
    return NextResponse.json({ error: 'Failed to reveal answer' }, { status: 500 });
  }
}
