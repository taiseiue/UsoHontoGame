import { beforeEach, describe, expect, it } from 'vitest';
import { RevealAnswerUseCase } from '@/server/application/use-cases/turns/RevealAnswerUseCase';
import { GameSession } from '@/server/domain/entities/GameSession';
import { Vote } from '@/server/domain/entities/Vote';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';
import { InMemoryVoteRepository } from '@/server/infrastructure/repositories/InMemoryVoteRepository';
import type { SessionPhase } from '@/types/game';

describe('RevealAnswerUseCase', () => {
  let voteRepository: InMemoryVoteRepository;
  let sessionRepository: InMemoryGameSessionRepository;
  let useCase: RevealAnswerUseCase;

  beforeEach(() => {
    voteRepository = InMemoryVoteRepository.getInstance();
    sessionRepository = InMemoryGameSessionRepository.getInstance();
    // Clear repositories for test isolation
    voteRepository.clearAll();
    sessionRepository.clearAll();
    useCase = new RevealAnswerUseCase(voteRepository, sessionRepository);
  });

  it('should reveal correct answer and calculate scores', async () => {
    // Arrange
    const session = new GameSession(
      'TEST01',
      new Date(),
      new Date(),
      'voting' as SessionPhase,
      'host-123',
      'turn-1',
      { pointsForCorrectGuess: 10, pointsPerDeception: 5 },
      ['team-1', 'team-2', 'team-3'],
      0
    );
    await sessionRepository.save(session);

    // Add votes
    const vote1 = new Vote('vote-1', 'turn-1', 'team-2', 2, null); // Correct guess
    const vote2 = new Vote('vote-2', 'turn-1', 'team-3', 1, null); // Incorrect guess
    await voteRepository.save(vote1);
    await voteRepository.save(vote2);

    const request = {
      turnId: 'turn-1',
      correctEpisodeNumber: 2, // Episode 2 is the lie
      presentingTeamId: 'team-1',
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.correctEpisodeNumber).toBe(2);
    expect(result.votes).toHaveLength(2);
    expect(result.pointsAwarded.presentingTeamPoints).toBe(5); // 1 team deceived
    expect(result.pointsAwarded.correctGuessingTeams).toHaveLength(1); // 1 team correct
  });

  it('should mark votes as correct or incorrect', async () => {
    // Arrange
    const session = new GameSession(
      'TEST01',
      new Date(),
      new Date(),
      'voting' as SessionPhase,
      'host-123',
      'turn-1',
      { pointsForCorrectGuess: 10, pointsPerDeception: 5 },
      ['team-1', 'team-2'],
      0
    );
    await sessionRepository.save(session);

    const vote = new Vote('vote-1', 'turn-1', 'team-2', 2, null);
    await voteRepository.save(vote);

    const request = {
      turnId: 'turn-1',
      correctEpisodeNumber: 2,
      presentingTeamId: 'team-1',
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    const votes = result.votes;
    expect(votes[0].isCorrect).toBe(true);
  });

  it('should calculate presenting team points based on deceived teams', async () => {
    // Arrange
    const session = new GameSession(
      'TEST01',
      new Date(),
      new Date(),
      'voting' as SessionPhase,
      'host-123',
      'turn-1',
      { pointsForCorrectGuess: 10, pointsPerDeception: 5 },
      ['team-1', 'team-2', 'team-3', 'team-4'],
      0
    );
    await sessionRepository.save(session);

    // All 3 teams guess incorrectly
    const vote1 = new Vote('vote-1', 'turn-1', 'team-2', 1, null);
    const vote2 = new Vote('vote-2', 'turn-1', 'team-3', 1, null);
    const vote3 = new Vote('vote-3', 'turn-1', 'team-4', 3, null);
    await voteRepository.save(vote1);
    await voteRepository.save(vote2);
    await voteRepository.save(vote3);

    const request = {
      turnId: 'turn-1',
      correctEpisodeNumber: 2,
      presentingTeamId: 'team-1',
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.pointsAwarded.presentingTeamPoints).toBe(15); // 3 teams × 5 points
  });
});
