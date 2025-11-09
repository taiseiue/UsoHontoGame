import { beforeEach, describe, expect, it } from 'vitest';
import { CreateSessionUseCase } from '@/server/application/use-cases/sessions/CreateSessionUseCase';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';
import { InMemoryParticipantRepository } from '@/server/infrastructure/repositories/InMemoryParticipantRepository';

describe('CreateSessionUseCase', () => {
  let sessionRepository: InMemoryGameSessionRepository;
  let participantRepository: InMemoryParticipantRepository;
  let useCase: CreateSessionUseCase;

  beforeEach(() => {
    sessionRepository = InMemoryGameSessionRepository.getInstance();
    participantRepository = InMemoryParticipantRepository.getInstance();
    // Clear repositories for test isolation
    sessionRepository.clearAll();
    participantRepository.clearAll();
    useCase = new CreateSessionUseCase(sessionRepository, participantRepository);
  });

  it('should create a new game session with unique 6-character ID', async () => {
    // Arrange
    const request = {
      hostNickname: 'Keisuke',
      scoringRules: {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      },
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.sessionId).toMatch(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
    expect(result.phase).toBe('preparation');
    expect(result.hostId).toBeDefined();
  });

  it('should create host participant with HOST role', async () => {
    // Arrange
    const request = {
      hostNickname: 'Keisuke',
      scoringRules: { pointsForCorrectGuess: 10, pointsPerDeception: 5 },
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    const host = await participantRepository.findById(result.hostId);
    expect(host).not.toBeNull();
    expect(host?.role).toBe('host');
    expect(host?.nickname).toBe('Keisuke');
  });

  it('should use default scoring rules when not provided', async () => {
    // Arrange
    const request = {
      hostNickname: 'Keisuke',
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    const session = await sessionRepository.findById(result.sessionId);
    expect(session?.scoringRules).toEqual({
      pointsForCorrectGuess: 10,
      pointsPerDeception: 5,
    });
  });

  it('should initialize session in preparation phase', async () => {
    // Arrange
    const request = {
      hostNickname: 'Keisuke',
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    const session = await sessionRepository.findById(result.sessionId);
    expect(session?.phase).toBe('preparation');
    expect(session?.currentTurnId).toBeNull();
    expect(session?.presentationOrder).toEqual([]);
    expect(session?.currentPresentingTeamIndex).toBe(0);
  });
});
