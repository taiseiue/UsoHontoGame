import { describe, expect, it } from 'vitest';
import { ScoreCalculationService } from '@/server/application/services/ScoreCalculationService';
import { Vote } from '@/server/domain/entities/Vote';

describe('ScoreCalculationService', () => {
  it('should calculate points for correct guesses', () => {
    // Arrange
    const correctEpisodeNumber = 2;
    const votes = [
      new Vote('vote-1', 'turn-1', 'team-1', 2, null), // Correct
      new Vote('vote-2', 'turn-1', 'team-2', 1, null), // Incorrect
    ];
    const scoringRules = { pointsForCorrectGuess: 10, pointsPerDeception: 5 };

    // Act
    const result = ScoreCalculationService.calculateTurnPoints(
      correctEpisodeNumber,
      votes,
      scoringRules
    );

    // Assert
    expect(result.correctGuessingTeams).toHaveLength(1);
    expect(result.correctGuessingTeams[0].points).toBe(10);
    expect(result.correctGuessingTeams[0].teamId).toBe('team-1');
  });

  it('should calculate presenting team points from deceived teams', () => {
    // Arrange
    const correctEpisodeNumber = 2;
    const votes = [
      new Vote('vote-1', 'turn-1', 'team-1', 1, null), // Incorrect
      new Vote('vote-2', 'turn-1', 'team-2', 3, null), // Incorrect
      new Vote('vote-3', 'turn-1', 'team-3', 1, null), // Incorrect
    ];
    const scoringRules = { pointsForCorrectGuess: 10, pointsPerDeception: 5 };

    // Act
    const result = ScoreCalculationService.calculateTurnPoints(
      correctEpisodeNumber,
      votes,
      scoringRules
    );

    // Assert
    expect(result.presentingTeamPoints).toBe(15); // 3 deceived × 5 points
    expect(result.correctGuessingTeams).toHaveLength(0);
  });

  it('should handle scenario where all teams guess correctly', () => {
    // Arrange
    const correctEpisodeNumber = 2;
    const votes = [
      new Vote('vote-1', 'turn-1', 'team-1', 2, null),
      new Vote('vote-2', 'turn-1', 'team-2', 2, null),
      new Vote('vote-3', 'turn-1', 'team-3', 2, null),
    ];
    const scoringRules = { pointsForCorrectGuess: 10, pointsPerDeception: 5 };

    // Act
    const result = ScoreCalculationService.calculateTurnPoints(
      correctEpisodeNumber,
      votes,
      scoringRules
    );

    // Assert
    expect(result.presentingTeamPoints).toBe(0); // No one deceived
    expect(result.correctGuessingTeams).toHaveLength(3);
    expect(result.correctGuessingTeams.every((t) => t.points === 10)).toBe(true);
  });

  it('should validate scoring rules are non-negative integers', () => {
    // Arrange
    const invalidRules1 = { pointsForCorrectGuess: -5, pointsPerDeception: 5 };
    const invalidRules2 = { pointsForCorrectGuess: 10.5, pointsPerDeception: 5 };

    // Act & Assert
    expect(() => ScoreCalculationService.validateScoringRules(invalidRules1)).toThrow();
    expect(() => ScoreCalculationService.validateScoringRules(invalidRules2)).toThrow();
  });

  it('should use custom scoring rules when provided', () => {
    // Arrange
    const correctEpisodeNumber = 2;
    const votes = [
      new Vote('vote-1', 'turn-1', 'team-1', 2, null), // Correct
      new Vote('vote-2', 'turn-1', 'team-2', 1, null), // Incorrect
    ];
    const scoringRules = { pointsForCorrectGuess: 20, pointsPerDeception: 10 };

    // Act
    const result = ScoreCalculationService.calculateTurnPoints(
      correctEpisodeNumber,
      votes,
      scoringRules
    );

    // Assert
    expect(result.correctGuessingTeams[0].points).toBe(20);
    expect(result.presentingTeamPoints).toBe(10);
  });
});
