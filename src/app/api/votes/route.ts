import { type NextRequest, NextResponse } from 'next/server';
import { validateVoteSubmission } from '@/lib/validators';
import {
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from '@/server/application/errors/ApplicationErrors';
import { SubmitVoteUseCase } from '@/server/application/use-cases/voting/SubmitVoteUseCase';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';
import { InMemoryVoteRepository } from '@/server/infrastructure/repositories/InMemoryVoteRepository';

/**
 * POST /api/votes
 * Submits a vote for which episode is the lie
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate vote submission data
    const validation = validateVoteSubmission({
      sessionId: body.sessionId,
      teamId: body.teamId,
      turnId: body.turnId,
      selectedEpisodeNumber: body.selectedEpisodeNumber,
      presentingTeamId: body.presentingTeamId,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const voteRepository = InMemoryVoteRepository.getInstance();
    const sessionRepository = InMemoryGameSessionRepository.getInstance();
    const useCase = new SubmitVoteUseCase(voteRepository, sessionRepository);

    const result = await useCase.execute({
      sessionId: body.sessionId,
      teamId: body.teamId,
      turnId: body.turnId,
      selectedEpisodeNumber: body.selectedEpisodeNumber,
      presentingTeamId: body.presentingTeamId,
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

    console.error('Error submitting vote:', error);
    return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
  }
}
