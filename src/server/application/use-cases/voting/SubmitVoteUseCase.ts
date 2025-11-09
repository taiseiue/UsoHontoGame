import { BusinessRuleError, NotFoundError, ValidationError } from '@/lib/errors';
import type { SubmitVoteRequest } from '@/server/application/dto/requests/SubmitVoteRequest';
import { Vote } from '@/server/domain/entities/Vote';
import type { IGameSessionRepository } from '@/server/domain/repositories/IGameSessionRepository';
import type { IVoteRepository } from '@/server/domain/repositories/IVoteRepository';

export interface SubmitVoteResponse {
  voteId: string;
  teamId: string;
  selectedEpisodeNumber: number;
}

/**
 * Use Case: Submit a vote for which episode is the lie
 * Team votes during another team's turn
 */
export class SubmitVoteUseCase {
  constructor(
    private voteRepository: IVoteRepository,
    private sessionRepository: IGameSessionRepository
  ) {}

  async execute(
    request: SubmitVoteRequest & { turnId: string; presentingTeamId?: string }
  ): Promise<SubmitVoteResponse> {
    // Validate episode number
    if (request.selectedEpisodeNumber < 1 || request.selectedEpisodeNumber > 3) {
      throw new ValidationError('Selected episode number must be between 1 and 3');
    }

    // Check session exists
    const session = await this.sessionRepository.findById(request.sessionId);
    if (!session) {
      throw new NotFoundError('Session', request.sessionId);
    }

    // Prevent presenting team from voting
    if (request.presentingTeamId && request.teamId === request.presentingTeamId) {
      throw new BusinessRuleError('Presenting team cannot vote on their own turn');
    }

    // Check if team has already voted
    const hasVoted = await this.voteRepository.hasTeamVoted(request.turnId, request.teamId);
    if (hasVoted) {
      throw new BusinessRuleError('Team has already voted on this turn');
    }

    // Create vote
    const voteId = crypto.randomUUID();
    const vote = new Vote(
      voteId,
      request.turnId,
      request.teamId,
      request.selectedEpisodeNumber,
      null // isCorrect will be set during reveal
    );

    // Save vote
    await this.voteRepository.save(vote);

    // Update session activity
    session.updateActivity();
    await this.sessionRepository.save(session);

    return {
      voteId,
      teamId: request.teamId,
      selectedEpisodeNumber: request.selectedEpisodeNumber,
    };
  }
}
