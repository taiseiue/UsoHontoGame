import type { Vote } from '@/server/domain/entities/Vote';
import type { ScoringRules, TurnPoints } from '@/types/game';

/**
 * Score calculation service - Pure functional service for calculating points
 */
export class ScoreCalculationService {
  /**
   * Calculate points awarded for a turn based on votes
   * @param correctEpisodeNumber The episode number that is the lie (1-3)
   * @param votes All votes submitted for this turn
   * @param scoringRules Point values for correct guess and deception
   * @returns Points to award to each team
   */
  static calculateTurnPoints(
    correctEpisodeNumber: number,
    votes: Vote[],
    scoringRules: ScoringRules
  ): TurnPoints {
    const correctGuessingTeams: { teamId: string; points: number }[] = [];
    let incorrectGuessCount = 0;

    // Evaluate each vote
    for (const vote of votes) {
      const isCorrect = vote.selectedEpisodeNumber === correctEpisodeNumber;

      if (isCorrect) {
        // Team guessed correctly - award points
        correctGuessingTeams.push({
          teamId: vote.votingTeamId,
          points: scoringRules.pointsForCorrectGuess,
        });
      } else {
        // Team guessed incorrectly
        incorrectGuessCount += 1;
      }
    }

    // Presenting team gets points for each team they deceived
    const presentingTeamPoints = incorrectGuessCount * scoringRules.pointsPerDeception;

    return {
      presentingTeamPoints,
      correctGuessingTeams,
    };
  }

  /**
   * Validate scoring rules
   */
  static validateScoringRules(rules: ScoringRules): void {
    if (rules.pointsForCorrectGuess < 0 || rules.pointsPerDeception < 0) {
      throw new Error('Point values cannot be negative');
    }
    if (
      !Number.isInteger(rules.pointsForCorrectGuess) ||
      !Number.isInteger(rules.pointsPerDeception)
    ) {
      throw new Error('Point values must be integers');
    }
  }
}
