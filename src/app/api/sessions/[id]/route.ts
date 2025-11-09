import { type NextRequest, NextResponse } from 'next/server';
import { NotFoundError } from '@/server/application/errors/ApplicationErrors';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';
import { InMemoryParticipantRepository } from '@/server/infrastructure/repositories/InMemoryParticipantRepository';
import { InMemoryTeamRepository } from '@/server/infrastructure/repositories/InMemoryTeamRepository';

/**
 * GET /api/sessions/[id]
 * Retrieves session details including participants and teams
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;

    const sessionRepository = InMemoryGameSessionRepository.getInstance();
    const participantRepository = InMemoryParticipantRepository.getInstance();
    const teamRepository = InMemoryTeamRepository.getInstance();

    // Get session
    const session = await sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    // Get participants
    const participants = await participantRepository.findBySessionId(sessionId);

    // Get teams
    const teams = await Promise.all(
      session.presentationOrder.map((teamId) => teamRepository.findById(teamId))
    );

    return NextResponse.json({
      sessionId: session.id,
      phase: session.phase,
      hostId: session.hostId,
      currentTurnId: session.currentTurnId,
      scoringRules: session.scoringRules,
      presentationOrder: session.presentationOrder,
      currentPresentingTeamIndex: session.currentPresentingTeamIndex,
      createdAt: session.createdAt,
      lastActivityTimestamp: session.lastActivityTimestamp,
      participants: participants.map((p) => ({
        id: p.id,
        nickname: p.nickname,
        role: p.role,
        teamId: p.teamId,
        connectionStatus: p.connectionStatus,
      })),
      teams: teams.filter(Boolean).map((t) => ({
        id: t!.id,
        name: t!.name,
        score: t!.cumulativeScore,
        memberIds: t!.participantIds,
      })),
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Error retrieving session:', error);
    return NextResponse.json({ error: 'Failed to retrieve session' }, { status: 500 });
  }
}
