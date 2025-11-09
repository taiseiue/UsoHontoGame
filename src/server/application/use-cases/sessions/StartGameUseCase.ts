import type { IGameSessionRepository } from '@/server/domain/repositories/IGameSessionRepository';
import type { IParticipantRepository } from '@/server/domain/repositories/IParticipantRepository';
import type { ITeamRepository } from '@/server/domain/repositories/ITeamRepository';
import { SessionPhase } from '@/types/game';

export interface StartGameRequest {
  sessionId: string;
  hostId: string;
}

export interface StartGameResponse {
  success: boolean;
  phase?: string;
  presentationOrder?: string[];
}

/**
 * StartGameUseCase - Starts the game and transitions to presentation phase
 */
export class StartGameUseCase {
  constructor(
    private sessionRepository: IGameSessionRepository,
    private teamRepository: ITeamRepository,
    private participantRepository: IParticipantRepository
  ) {}

  async execute(request: StartGameRequest): Promise<StartGameResponse> {
    // Verify session exists
    const session = await this.sessionRepository.findById(request.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Verify authorization
    if (session.hostId !== request.hostId) {
      throw new Error('Unauthorized');
    }

    // Verify session phase
    if (session.phase !== SessionPhase.PREPARATION) {
      throw new Error('Game already started');
    }

    // Get all teams
    const teams = await this.teamRepository.findBySessionId(request.sessionId);
    if (teams.length < 2) {
      throw new Error('Minimum 2 teams required');
    }

    // Get all participants
    const participants = await this.participantRepository.findBySessionId(request.sessionId);
    const players = participants.filter((p) => p.role === 'player');

    // Check all players are assigned to teams
    const unassignedPlayers = players.filter((p) => p.teamId === null);
    if (unassignedPlayers.length > 0) {
      throw new Error('All players must be assigned to teams');
    }

    // Check all players have registered episodes
    const playersWithoutEpisodes = players.filter((p) => !p.hasRegisteredEpisodes());
    if (playersWithoutEpisodes.length > 0) {
      throw new Error('All participants must register episodes');
    }

    // Set presentation order based on team presentation order
    const sortedTeams = teams
      .filter((t) => t.presentationOrder !== null)
      .sort((a, b) => (a.presentationOrder ?? 0) - (b.presentationOrder ?? 0));

    // If some teams don't have presentation order set, add them at the end
    const unsortedTeams = teams.filter((t) => t.presentationOrder === null);
    const orderedTeams = [...sortedTeams, ...unsortedTeams];

    const presentationOrder = orderedTeams.map((t) => t.id);

    // Update session
    session.transitionToPhase(SessionPhase.PRESENTATION);
    session.presentationOrder = presentationOrder;
    session.currentPresentingTeamIndex = 0;

    await this.sessionRepository.save(session);

    return {
      success: true,
      phase: session.phase,
      presentationOrder: session.presentationOrder,
    };
  }
}
