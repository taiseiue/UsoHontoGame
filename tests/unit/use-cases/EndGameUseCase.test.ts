import { beforeEach, describe, expect, it } from 'vitest';
import { EndGameUseCase } from '@/server/application/use-cases/sessions/EndGameUseCase';
import { GameSession } from '@/server/domain/entities/GameSession';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';

describe('EndGameUseCase', () => {
  let sessionRepository: InMemoryGameSessionRepository;
  let useCase: EndGameUseCase;

  beforeEach(() => {
    sessionRepository = InMemoryGameSessionRepository.getInstance();
    // Clear repository for test isolation
    sessionRepository.clearAll();
    useCase = new EndGameUseCase(sessionRepository);
  });

  it('should end game and transition to completed phase', async () => {
    // Arrange
    const session = new GameSession(
      'ABC123',
      new Date(),
      new Date(),
      'presentation',
      'host-id',
      null,
      { pointsForCorrectGuess: 10, pointsPerDeception: 5 },
      ['team-1', 'team-2'],
      1
    );
    await sessionRepository.save(session);

    const request = {
      sessionId: 'ABC123',
      hostId: 'host-id',
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.success).toBe(true);
    const updatedSession = await sessionRepository.findById('ABC123');
    expect(updatedSession?.phase).toBe('completed');
  });

  it('should reject ending game when session not found', async () => {
    // Arrange
    const request = {
      sessionId: 'INVALID',
      hostId: 'host-id',
    };

    // Act & Assert
    await expect(useCase.execute(request)).rejects.toThrow('Session not found');
  });

  it('should reject ending game by non-host', async () => {
    // Arrange
    const session = new GameSession(
      'ABC123',
      new Date(),
      new Date(),
      'presentation',
      'host-id',
      null,
      { pointsForCorrectGuess: 10, pointsPerDeception: 5 },
      ['team-1', 'team-2'],
      0
    );
    await sessionRepository.save(session);

    const request = {
      sessionId: 'ABC123',
      hostId: 'wrong-host-id',
    };

    // Act & Assert
    await expect(useCase.execute(request)).rejects.toThrow('Unauthorized');
  });

  it('should allow ending game from any phase after game started', async () => {
    // Arrange - game in voting phase
    const session = new GameSession(
      'ABC123',
      new Date(),
      new Date(),
      'voting',
      'host-id',
      'turn-1',
      { pointsForCorrectGuess: 10, pointsPerDeception: 5 },
      ['team-1', 'team-2'],
      0
    );
    await sessionRepository.save(session);

    const request = {
      sessionId: 'ABC123',
      hostId: 'host-id',
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.success).toBe(true);
    const updatedSession = await sessionRepository.findById('ABC123');
    expect(updatedSession?.phase).toBe('completed');
  });

  it('should allow ending game even in preparation phase', async () => {
    // Arrange - host wants to cancel before starting
    const session = new GameSession(
      'ABC123',
      new Date(),
      new Date(),
      'preparation',
      'host-id',
      null,
      { pointsForCorrectGuess: 10, pointsPerDeception: 5 },
      [],
      0
    );
    await sessionRepository.save(session);

    const request = {
      sessionId: 'ABC123',
      hostId: 'host-id',
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.success).toBe(true);
    const updatedSession = await sessionRepository.findById('ABC123');
    expect(updatedSession?.phase).toBe('completed');
  });

  it('should reject ending game that is already completed', async () => {
    // Arrange
    const session = new GameSession(
      'ABC123',
      new Date(),
      new Date(),
      'completed',
      'host-id',
      null,
      { pointsForCorrectGuess: 10, pointsPerDeception: 5 },
      ['team-1', 'team-2'],
      2
    );
    await sessionRepository.save(session);

    const request = {
      sessionId: 'ABC123',
      hostId: 'host-id',
    };

    // Act & Assert
    await expect(useCase.execute(request)).rejects.toThrow('Game already completed');
  });

  it('should update last activity timestamp when ending game', async () => {
    // Arrange
    const oldTimestamp = new Date('2024-01-01T00:00:00Z');
    const session = new GameSession(
      'ABC123',
      new Date(),
      oldTimestamp,
      'presentation',
      'host-id',
      null,
      { pointsForCorrectGuess: 10, pointsPerDeception: 5 },
      ['team-1', 'team-2'],
      0
    );
    await sessionRepository.save(session);

    const request = {
      sessionId: 'ABC123',
      hostId: 'host-id',
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.success).toBe(true);
    const updatedSession = await sessionRepository.findById('ABC123');
    expect(updatedSession?.lastActivityTimestamp.getTime()).toBeGreaterThan(oldTimestamp.getTime());
  });
});
