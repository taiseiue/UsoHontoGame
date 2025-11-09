import type { NextRequest } from 'next/server';
import { getSSEManager } from '@/server/infrastructure/realtime/SSEManager';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';
import { InMemoryParticipantRepository } from '@/server/infrastructure/repositories/InMemoryParticipantRepository';
import { InMemoryTeamRepository } from '@/server/infrastructure/repositories/InMemoryTeamRepository';
import type { FullStateSyncEvent } from '@/types/events';

/**
 * GET /api/sessions/[id]/events
 * Establishes SSE connection for real-time game updates
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;

  // Validate session exists
  const sessionRepository = InMemoryGameSessionRepository.getInstance();
  const session = await sessionRepository.findById(sessionId);

  if (!session) {
    return new Response(JSON.stringify({ error: 'Session not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Generate unique client ID
  const clientId = `${sessionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create readable stream for SSE
  const stream = new ReadableStream({
    start: async (controller) => {
      const sseManager = getSSEManager();

      // Register client
      sseManager.addClient(clientId, sessionId, controller);

      // Send initial full state sync
      try {
        const participantRepository = InMemoryParticipantRepository.getInstance();
        const teamRepository = InMemoryTeamRepository.getInstance();

        const participants = await participantRepository.findBySessionId(sessionId);
        const teams = await Promise.all(
          session.presentationOrder.map((teamId) => teamRepository.findById(teamId))
        );

        const fullStateSyncData: FullStateSyncEvent = {
          sessionId: session.id,
          session: {
            id: session.id,
            phase: session.phase,
            currentTurnId: session.currentTurnId,
          },
          teams: teams.filter(Boolean).map((t) => ({
            id: t!.id,
            name: t!.name,
            score: t!.cumulativeScore,
          })),
          participants: participants.map((p) => ({
            id: p.id,
            nickname: p.nickname,
            teamId: p.teamId,
            role: p.role,
          })),
          currentTurn: null, // Will be populated when turn data is available
          timestamp: new Date().toISOString(),
        };

        sseManager.sendFullStateSync(clientId, fullStateSyncData);
        console.log(`[SSE] Client ${clientId} connected to session ${sessionId}`);
      } catch (error) {
        console.error('[SSE] Error sending initial state sync:', error);
        sseManager.removeClient(clientId);
        controller.close();
      }
    },

    cancel: () => {
      // Client disconnected
      const sseManager = getSSEManager();
      sseManager.removeClient(clientId);
      console.log(`[SSE] Client ${clientId} cancelled connection`);
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
