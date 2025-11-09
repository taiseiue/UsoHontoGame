import { beforeEach, describe, expect, it } from 'vitest';
import { SubmitVoteUseCase } from '@/server/application/use-cases/voting/SubmitVoteUseCase';
import { GameSession } from '@/server/domain/entities/GameSession';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';
import { InMemoryVoteRepository } from '@/server/infrastructure/repositories/InMemoryVoteRepository';
import type { SessionPhase } from '@/types/game';

describe('SubmitVoteUseCase', () => {
  let voteRepository: InMemoryVoteRepository;
  let sessionRepository: InMemoryGameSessionRepository;
  let useCase: SubmitVoteUseCase;

  beforeEach(() => {
    voteRepository = InMemoryVoteRepository.getInstance();
    sessionRepository = InMemoryGameSessionRepository.getInstance();
    // Clear repositories for test isolation
    voteRepository.clearAll();
    sessionRepository.clearAll();
    useCase = new SubmitVoteUseCase(voteRepository, sessionRepository);
  });

  it('should allow team to submit vote during voting phase', async () => {
    // Arrange
    const session = new GameSession(
      'TEST42',
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

    const request = {
      sessionId: 'TEST42',
      teamId: 'team-2',
      turnId: 'turn-1',
      selectedEpisodeNumber: 2,
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.voteId).toBeDefined();
    expect(result.teamId).toBe('team-2');
    expect(result.selectedEpisodeNumber).toBe(2);
  });

  it('should validate selectedEpisodeNumber is between 1 and 3', async () => {
    // Arrange
    const session = new GameSession(
      'TEST42',
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

    const request = {
      sessionId: 'TEST42',
      teamId: 'team-2',
      turnId: 'turn-1',
      selectedEpisodeNumber: 5,
    };

    // Act & Assert
    await expect(useCase.execute(request)).rejects.toThrow();
  });

  it('should prevent presenting team from voting on their own turn', async () => {
    // Arrange
    const session = new GameSession(
      'TEST42',
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

    const request = {
      sessionId: 'TEST42',
      teamId: 'team-1', // Presenting team
      turnId: 'turn-1',
      selectedEpisodeNumber: 2,
      presentingTeamId: 'team-1',
    };

    // Act & Assert
    await expect(useCase.execute(request)).rejects.toThrow();
  });

  it('should prevent duplicate voting by same team', async () => {
    // Arrange
    const session = new GameSession(
      'TEST42',
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

    const request = {
      sessionId: 'TEST42',
      teamId: 'team-2',
      turnId: 'turn-1',
      selectedEpisodeNumber: 2,
    };

    // First vote
    await useCase.execute(request);

    // Act & Assert - try to vote again
    await expect(useCase.execute(request)).rejects.toThrow('Team has already voted on this turn');
  });
});
