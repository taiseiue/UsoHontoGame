import { type NextRequest, NextResponse } from 'next/server';
import { ManageTeamsUseCase } from '@/server/application/use-cases/teams/ManageTeamsUseCase';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';
import { InMemoryParticipantRepository } from '@/server/infrastructure/repositories/InMemoryParticipantRepository';
import { InMemoryTeamRepository } from '@/server/infrastructure/repositories/InMemoryTeamRepository';

/**
 * PUT /api/sessions/[id]/teams
 * Manages team operations (create, assign, remove, delete)
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const sessionRepository = InMemoryGameSessionRepository.getInstance();
    const teamRepository = InMemoryTeamRepository.getInstance();
    const participantRepository = InMemoryParticipantRepository.getInstance();

    const useCase = new ManageTeamsUseCase(
      sessionRepository,
      teamRepository,
      participantRepository
    );

    const result = await useCase.execute({
      ...body,
      sessionId: id,
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
        error.message.includes('already exists') ||
        error.message.includes('after game started') ||
        error.message.includes('Cannot assign')
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    console.error('Error managing teams:', error);
    return NextResponse.json({ error: 'Failed to manage teams' }, { status: 500 });
  }
}
