import { NotFoundError, ValidationError } from '@/lib/errors';
import { ScoreCalculationService } from '@/server/application/services/ScoreCalculationService';
import type { IGameSessionRepository } from '@/server/domain/repositories/IGameSessionRepository';
import type { IVoteRepository } from '@/server/domain/repositories/IVoteRepository';
import type { TurnPoints } from '@/types/game';

export interface RevealAnswerRequest {
  turnId: string;
  correctEpisodeNumber: number;
  presentingTeamId: string;
}

export interface RevealAnswerResponse {
  correctEpisodeNumber: number;
  votes: Array<{
    teamId: string;
    teamName?: string;
    selectedEpisodeNumber: number;
    isCorrect: boolean;
  }>;
  pointsAwarded: TurnPoints;
  updatedScores: Record<string, number>;
}

/**
 * Use Case: Reveal the correct answer and calculate scores
 * Host triggers answer reveal, system calculates and awards points
 */
export class RevealAnswerUseCase {
  constructor(
    private voteRepository: IVoteRepository,
    private sessionRepository: IGameSessionRepository
  ) {}

  async execute(request: RevealAnswerRequest): Promise<RevealAnswerResponse> {
    // Validate episode number
    if (request.correctEpisodeNumber < 1 || request.correctEpisodeNumber > 3) {
      throw new ValidationError('Correct episode number must be between 1 and 3');
    }

    // Get all votes for this turn
    const votes = await this.voteRepository.findByTurnId(request.turnId);

    // Get session for scoring rules
    const sessions = await this.sessionRepository.findAll();
    const session = sessions.find((s) => s.currentTurnId === request.turnId);
    if (!session) {
      throw new NotFoundError('Session for turn', request.turnId);
    }

    // Mark votes as correct/incorrect
    for (const vote of votes) {
      const isCorrect = vote.selectedEpisodeNumber === request.correctEpisodeNumber;
      vote.setCorrectness(isCorrect);
      await this.voteRepository.save(vote);
    }

    // Calculate points
    const pointsAwarded = ScoreCalculationService.calculateTurnPoints(
      request.correctEpisodeNumber,
      votes,
      session.scoringRules
    );

    // Format response
    const voteResults = votes.map((v) => ({
      teamId: v.votingTeamId,
      selectedEpisodeNumber: v.selectedEpisodeNumber,
      isCorrect: v.isCorrect || false,
    }));

    // Create updated scores map (placeholder - will be enhanced with team repository)
    const updatedScores: Record<string, number> = {};
    updatedScores[request.presentingTeamId] = pointsAwarded.presentingTeamPoints;
    for (const team of pointsAwarded.correctGuessingTeams) {
      updatedScores[team.teamId] = team.points;
    }

    // Update session activity
    session.updateActivity();
    await this.sessionRepository.save(session);

    return {
      correctEpisodeNumber: request.correctEpisodeNumber,
      votes: voteResults,
      pointsAwarded,
      updatedScores,
    };
  }
}
