import type { IGameSessionRepository } from '@/server/domain/repositories/IGameSessionRepository';
import { SessionPhase } from '@/types/game';

export interface EndGameRequest {
  sessionId: string;
  hostId: string;
}

export interface EndGameResponse {
  success: boolean;
  phase?: string;
}

/**
 * EndGameUseCase - Ends the game and transitions to completed phase
 */
export class EndGameUseCase {
  constructor(private sessionRepository: IGameSessionRepository) {}

  async execute(request: EndGameRequest): Promise<EndGameResponse> {
    // Verify session exists
    const session = await this.sessionRepository.findById(request.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Verify authorization
    if (session.hostId !== request.hostId) {
      throw new Error('Unauthorized');
    }

    // Verify session is not already completed
    if (session.phase === SessionPhase.COMPLETED) {
      throw new Error('Game already completed');
    }

    // Transition to completed phase
    session.transitionToPhase(SessionPhase.COMPLETED);

    await this.sessionRepository.save(session);

    return {
      success: true,
      phase: session.phase,
    };
  }
}
