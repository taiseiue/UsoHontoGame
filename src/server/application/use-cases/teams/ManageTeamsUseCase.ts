import { Team } from '@/server/domain/entities/Team';
import type { IGameSessionRepository } from '@/server/domain/repositories/IGameSessionRepository';
import type { IParticipantRepository } from '@/server/domain/repositories/IParticipantRepository';
import type { ITeamRepository } from '@/server/domain/repositories/ITeamRepository';

export type ManageTeamsRequest =
  | {
      action: 'create';
      sessionId: string;
      hostId: string;
      teamName: string;
    }
  | {
      action: 'assign';
      sessionId: string;
      hostId: string;
      teamId: string;
      participantId: string;
    }
  | {
      action: 'remove';
      sessionId: string;
      hostId: string;
      participantId: string;
    }
  | {
      action: 'delete';
      sessionId: string;
      hostId: string;
      teamId: string;
    };

export interface ManageTeamsResponse {
  success: boolean;
  team?: {
    id: string;
    name: string;
    participantIds: string[];
    cumulativeScore: number;
  };
}

/**
 * ManageTeamsUseCase - Handles team management operations
 */
export class ManageTeamsUseCase {
  constructor(
    private sessionRepository: IGameSessionRepository,
    private teamRepository: ITeamRepository,
    private participantRepository: IParticipantRepository
  ) {}

  async execute(request: ManageTeamsRequest): Promise<ManageTeamsResponse> {
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
    if (session.phase !== 'preparation') {
      throw new Error('Cannot modify teams after game started');
    }

    switch (request.action) {
      case 'create':
        return await this.createTeam(request);
      case 'assign':
        return await this.assignParticipant(request);
      case 'remove':
        return await this.removeParticipant(request);
      case 'delete':
        return await this.deleteTeam(request);
    }
  }

  private async createTeam(
    request: Extract<ManageTeamsRequest, { action: 'create' }>
  ): Promise<ManageTeamsResponse> {
    // Check for duplicate team name
    const existingTeams = await this.teamRepository.findBySessionId(request.sessionId);
    const duplicate = existingTeams.find(
      (t) => t.name.toLowerCase() === request.teamName.toLowerCase()
    );
    if (duplicate) {
      throw new Error('Team name already exists');
    }

    // Create new team
    const team = new Team(crypto.randomUUID(), request.sessionId, request.teamName, [], 0, null);

    await this.teamRepository.save(team);

    return {
      success: true,
      team: {
        id: team.id,
        name: team.name,
        participantIds: team.participantIds,
        cumulativeScore: team.cumulativeScore,
      },
    };
  }

  private async assignParticipant(
    request: Extract<ManageTeamsRequest, { action: 'assign' }>
  ): Promise<ManageTeamsResponse> {
    // Verify participant exists
    const participant = await this.participantRepository.findById(request.participantId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    // Verify participant is not host
    if (participant.role === 'host') {
      throw new Error('Cannot assign host to team');
    }

    // Verify team exists
    const team = await this.teamRepository.findById(request.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Remove participant from current team if assigned
    if (participant.teamId) {
      const oldTeam = await this.teamRepository.findById(participant.teamId);
      if (oldTeam) {
        oldTeam.removeParticipant(request.participantId);
        await this.teamRepository.save(oldTeam);
      }
    }

    // Add participant to new team
    team.addParticipant(request.participantId);
    participant.teamId = request.teamId;

    await this.teamRepository.save(team);
    await this.participantRepository.save(participant);

    return {
      success: true,
      team: {
        id: team.id,
        name: team.name,
        participantIds: team.participantIds,
        cumulativeScore: team.cumulativeScore,
      },
    };
  }

  private async removeParticipant(
    request: Extract<ManageTeamsRequest, { action: 'remove' }>
  ): Promise<ManageTeamsResponse> {
    // Verify participant exists
    const participant = await this.participantRepository.findById(request.participantId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    // Remove from team if assigned
    if (participant.teamId) {
      const team = await this.teamRepository.findById(participant.teamId);
      if (team) {
        team.removeParticipant(request.participantId);
        await this.teamRepository.save(team);
      }
    }

    // Update participant
    participant.teamId = null;
    await this.participantRepository.save(participant);

    return {
      success: true,
    };
  }

  private async deleteTeam(
    request: Extract<ManageTeamsRequest, { action: 'delete' }>
  ): Promise<ManageTeamsResponse> {
    // Verify team exists
    const team = await this.teamRepository.findById(request.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Unassign all participants
    const participants = await this.participantRepository.findByTeamId(request.teamId);
    for (const participant of participants) {
      participant.teamId = null;
      await this.participantRepository.save(participant);
    }

    // Delete team
    await this.teamRepository.delete(request.teamId);

    return {
      success: true,
    };
  }
}
