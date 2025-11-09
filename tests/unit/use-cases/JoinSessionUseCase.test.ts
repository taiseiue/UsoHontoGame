import { beforeEach, describe, expect, it } from 'vitest';
import { JoinSessionUseCase } from '@/server/application/use-cases/sessions/JoinSessionUseCase';
import { GameSession } from '@/server/domain/entities/GameSession';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';
import { InMemoryParticipantRepository } from '@/server/infrastructure/repositories/InMemoryParticipantRepository';
import type { SessionPhase } from '@/types/game';

describe('JoinSessionUseCase', () => {
  let sessionRepository: InMemoryGameSessionRepository;
  let participantRepository: InMemoryParticipantRepository;
  let useCase: JoinSessionUseCase;

  beforeEach(() => {
    sessionRepository = InMemoryGameSessionRepository.getInstance();
    participantRepository = InMemoryParticipantRepository.getInstance();
    // Clear repositories for test isolation
    sessionRepository.clearAll();
    participantRepository.clearAll();
    useCase = new JoinSessionUseCase(sessionRepository, participantRepository);
  });

  it('should allow participant to join existing session', async () => {
    // Arrange
    const session = new GameSession(
      'TEST42',
      new Date(),
      new Date(),
      'preparation' as SessionPhase,
      'host-123',
      null,
      { pointsForCorrectGuess: 10, pointsPerDeception: 5 },
      [],
      0
    );
    await sessionRepository.save(session);

    const request = {
      sessionId: 'TEST42',
      nickname: 'Taro',
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.participantId).toBeDefined();
    expect(result.sessionId).toBe('TEST42');
    expect(result.nickname).toBe('Taro');
  });

  it('should create participant with PLAYER role', async () => {
    // Arrange
    const session = new GameSession(
      'TEST42',
      new Date(),
      new Date(),
      'preparation' as SessionPhase,
      'host-123',
      null,
      { pointsForCorrectGuess: 10, pointsPerDeception: 5 },
      [],
      0
    );
    await sessionRepository.save(session);

    const request = {
      sessionId: 'TEST42',
      nickname: 'Taro',
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    const participant = await participantRepository.findById(result.participantId);
    expect(participant?.role).toBe('player');
    expect(participant?.connectionStatus).toBe('connected');
  });

  it('should throw error if session does not exist', async () => {
    // Arrange
    const request = {
      sessionId: 'INVALID',
      nickname: 'Taro',
    };

    // Act & Assert
    await expect(useCase.execute(request)).rejects.toThrow();
  });

  it('should throw error if nickname already exists in session', async () => {
    // Arrange
    const session = new GameSession(
      'TEST42',
      new Date(),
      new Date(),
      'preparation' as SessionPhase,
      'host-123',
      null,
      { pointsForCorrectGuess: 10, pointsPerDeception: 5 },
      [],
      0
    );
    await sessionRepository.save(session);

    // First participant
    await useCase.execute({ sessionId: 'TEST42', nickname: 'Taro' });

    // Act & Assert - try to join with same nickname
    await expect(useCase.execute({ sessionId: 'TEST42', nickname: 'Taro' })).rejects.toThrow();
  });
});
