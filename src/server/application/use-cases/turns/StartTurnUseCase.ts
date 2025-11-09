import { randomUUID } from 'node:crypto';
import {
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from '@/server/application/errors/ApplicationErrors';
import type { Episode } from '@/server/domain/entities/Episode';
import { Turn } from '@/server/domain/entities/Turn';
import type { IGameSessionRepository } from '@/server/domain/repositories/IGameSessionRepository';
import type { IParticipantRepository } from '@/server/domain/repositories/IParticipantRepository';
import type { ITeamRepository } from '@/server/domain/repositories/ITeamRepository';
import type { TurnPhase } from '@/types/game';

/**
 * StartTurnUseCase
 * Creates a new turn for the next presenting team
 */
export class StartTurnUseCase {
  constructor(
    private sessionRepository: IGameSessionRepository,
    private participantRepository: IParticipantRepository,
    private teamRepository: ITeamRepository
  ) {}

  /**
   * Execute the use case
   */
  async execute(request: { sessionId: string; presenterParticipantId?: string }): Promise<{
    turnId: string;
    presentingTeamId: string;
    presenterParticipantId: string;
    turnNumber: number;
    presentedEpisodes: Episode[];
  }> {
    // Validate session exists
    const session = await this.sessionRepository.findById(request.sessionId);
    if (!session) {
      throw new NotFoundError(`Session not found: ${request.sessionId}`);
    }

    // Check session is in correct phase
    if (session.phase !== 'presentation') {
      throw new BusinessRuleError(
        `Cannot start turn - session must be in presentation phase. Current phase: ${session.phase}`
      );
    }

    // Get current presenting team
    const presentingTeamId = session.getCurrentPresentingTeamId();
    if (!presentingTeamId) {
      throw new BusinessRuleError(
        'No more teams to present - all teams have completed their turns'
      );
    }

    const presentingTeam = await this.teamRepository.findById(presentingTeamId);
    if (!presentingTeam) {
      throw new NotFoundError(`Presenting team not found: ${presentingTeamId}`);
    }

    // Determine presenter participant
    let presenterParticipantId = request.presenterParticipantId;

    // If not specified, select first team member who has registered episodes
    if (!presenterParticipantId) {
      const teamMembers = await Promise.all(
        presentingTeam.participantIds.map((id) => this.participantRepository.findById(id))
      );

      const eligibleMembers = teamMembers.filter(
        (member): member is NonNullable<typeof member> =>
          member !== null && member.episodes.length === 3
      );

      if (eligibleMembers.length === 0) {
        throw new BusinessRuleError(
          `No team members have registered episodes for team: ${presentingTeamId}`
        );
      }

      presenterParticipantId = eligibleMembers[0].id;
    }

    // Validate presenter exists and belongs to team
    const presenter = await this.participantRepository.findById(presenterParticipantId);
    if (!presenter) {
      throw new NotFoundError(`Presenter not found: ${presenterParticipantId}`);
    }

    if (!presentingTeam.participantIds.includes(presenterParticipantId)) {
      throw new ValidationError(
        `Presenter ${presenterParticipantId} does not belong to presenting team ${presentingTeamId}`
      );
    }

    // Validate presenter has registered episodes
    if (presenter.episodes.length !== 3) {
      throw new BusinessRuleError(
        `Presenter must have exactly 3 registered episodes. Found: ${presenter.episodes.length}`
      );
    }

    // Determine which episode is the lie
    const lieEpisodeIndex = presenter.episodes.findIndex((ep) => ep.isLie);
    if (lieEpisodeIndex === -1) {
      throw new BusinessRuleError('Presenter must have exactly one episode marked as lie');
    }
    const correctEpisodeNumber = lieEpisodeIndex + 1; // 1-based index

    // Calculate turn number
    const turnNumber = session.currentPresentingTeamIndex + 1;

    // Create new turn
    const turnId = randomUUID();
    const turn = new Turn(
      turnId,
      request.sessionId,
      presentingTeamId,
      presenterParticipantId,
      turnNumber,
      'presenting' as TurnPhase,
      [...presenter.episodes], // Snapshot of episodes
      correctEpisodeNumber,
      [], // No votes yet
      null, // Timer not started
      null, // No timer duration yet
      null, // No points awarded yet
      new Date(),
      null // Not completed
    );

    // Update session with current turn
    session.currentTurnId = turnId;
    session.updateActivity();
    await this.sessionRepository.save(session);

    // Return turn data
    return {
      turnId: turn.id,
      presentingTeamId: turn.presentingTeamId,
      presenterParticipantId: turn.presenterParticipantId,
      turnNumber: turn.turnNumber,
      presentedEpisodes: turn.presentedEpisodes,
    };
  }
}
