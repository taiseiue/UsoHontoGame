import { beforeEach, describe, expect, it } from 'vitest';
import { StartGameUseCase } from '@/server/application/use-cases/sessions/StartGameUseCase';
import { GameSession } from '@/server/domain/entities/GameSession';
import { Participant } from '@/server/domain/entities/Participant';
import { Team } from '@/server/domain/entities/Team';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';
import { InMemoryParticipantRepository } from '@/server/infrastructure/repositories/InMemoryParticipantRepository';
import { InMemoryTeamRepository } from '@/server/infrastructure/repositories/InMemoryTeamRepository';

describe('StartGameUseCase', () => {
  let sessionRepository: InMemoryGameSessionRepository;
  let teamRepository: InMemoryTeamRepository;
  let participantRepository: InMemoryParticipantRepository;
  let useCase: StartGameUseCase;

  beforeEach(() => {
    sessionRepository = InMemoryGameSessionRepository.getInstance();
    teamRepository = InMemoryTeamRepository.getInstance();
    participantRepository = InMemoryParticipantRepository.getInstance();

    // Clear repositories for test isolation
    sessionRepository.clearAll();
    teamRepository.clearAll();
    participantRepository.clearAll();

    useCase = new StartGameUseCase(sessionRepository, teamRepository, participantRepository);
  });

  it('should start game and transition to presentation phase', async () => {
    // Arrange
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

    const team1 = new Team('team-1', 'ABC123', 'Team Alpha', ['player-1'], 0, 0);
    await teamRepository.save(team1);

    const team2 = new Team('team-2', 'ABC123', 'Team Beta', ['player-2'], 0, 1);
    await teamRepository.save(team2);

    const player1 = new Participant(
      'player-1',
      'ABC123',
      'Alice',
      'player',
      'team-1',
      'connected',
      [
        {
          id: 'ep1',
          participantId: 'player-1',
          episodeNumber: 1,
          text: 'I like pizza',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep2',
          participantId: 'player-1',
          episodeNumber: 2,
          text: 'I like pasta',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep3',
          participantId: 'player-1',
          episodeNumber: 3,
          text: 'I like sushi',
          isLie: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      new Date()
    );
    await participantRepository.save(player1);

    const player2 = new Participant(
      'player-2',
      'ABC123',
      'Bob',
      'player',
      'team-2',
      'connected',
      [
        {
          id: 'ep4',
          participantId: 'player-2',
          episodeNumber: 1,
          text: 'I have a dog',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep5',
          participantId: 'player-2',
          episodeNumber: 2,
          text: 'I have a cat',
          isLie: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep6',
          participantId: 'player-2',
          episodeNumber: 3,
          text: 'I have a bird',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      new Date()
    );
    await participantRepository.save(player2);

    const request = {
      sessionId: 'ABC123',
      hostId: 'host-id',
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.success).toBe(true);
    const updatedSession = await sessionRepository.findById('ABC123');
    expect(updatedSession?.phase).toBe('presentation');
    expect(updatedSession?.presentationOrder).toEqual(['team-1', 'team-2']);
    expect(updatedSession?.currentPresentingTeamIndex).toBe(0);
  });

  it('should reject starting game when session not found', async () => {
    // Arrange
    const request = {
      sessionId: 'INVALID',
      hostId: 'host-id',
    };

    // Act & Assert
    await expect(useCase.execute(request)).rejects.toThrow('Session not found');
  });

  it('should reject starting game by non-host', async () => {
    // Arrange
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
      hostId: 'wrong-host-id',
    };

    // Act & Assert
    await expect(useCase.execute(request)).rejects.toThrow('Unauthorized');
  });

  it('should reject starting game when already started', async () => {
    // Arrange
    const session = new GameSession(
      'ABC123',
      new Date(),
      new Date(),
      'presentation',
      'host-id',
      null,
      { pointsForCorrectGuess: 10, pointsPerDeception: 5 },
      ['team-1'],
      0
    );
    await sessionRepository.save(session);

    const request = {
      sessionId: 'ABC123',
      hostId: 'host-id',
    };

    // Act & Assert
    await expect(useCase.execute(request)).rejects.toThrow('Game already started');
  });

  it('should reject starting game with fewer than 2 teams', async () => {
    // Arrange
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

    const team1 = new Team('team-1', 'ABC123', 'Team Alpha', ['player-1'], 0, 0);
    await teamRepository.save(team1);

    const player1 = new Participant(
      'player-1',
      'ABC123',
      'Alice',
      'player',
      'team-1',
      'connected',
      [
        {
          id: 'ep1',
          participantId: 'player-1',
          episodeNumber: 1,
          text: 'I like pizza',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep2',
          participantId: 'player-1',
          episodeNumber: 2,
          text: 'I like pasta',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep3',
          participantId: 'player-1',
          episodeNumber: 3,
          text: 'I like sushi',
          isLie: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      new Date()
    );
    await participantRepository.save(player1);

    const request = {
      sessionId: 'ABC123',
      hostId: 'host-id',
    };

    // Act & Assert
    await expect(useCase.execute(request)).rejects.toThrow('Minimum 2 teams required');
  });

  it('should reject starting game when participants have not registered episodes', async () => {
    // Arrange
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

    const team1 = new Team('team-1', 'ABC123', 'Team Alpha', ['player-1'], 0, 0);
    await teamRepository.save(team1);

    const team2 = new Team('team-2', 'ABC123', 'Team Beta', ['player-2'], 0, 1);
    await teamRepository.save(team2);

    const player1 = new Participant(
      'player-1',
      'ABC123',
      'Alice',
      'player',
      'team-1',
      'connected',
      [], // No episodes registered
      new Date()
    );
    await participantRepository.save(player1);

    const player2 = new Participant(
      'player-2',
      'ABC123',
      'Bob',
      'player',
      'team-2',
      'connected',
      [
        {
          id: 'ep4',
          participantId: 'player-2',
          episodeNumber: 1,
          text: 'I have a dog',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep5',
          participantId: 'player-2',
          episodeNumber: 2,
          text: 'I have a cat',
          isLie: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep6',
          participantId: 'player-2',
          episodeNumber: 3,
          text: 'I have a bird',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      new Date()
    );
    await participantRepository.save(player2);

    const request = {
      sessionId: 'ABC123',
      hostId: 'host-id',
    };

    // Act & Assert
    await expect(useCase.execute(request)).rejects.toThrow(
      'All participants must register episodes'
    );
  });

  it('should set presentation order based on team presentation order', async () => {
    // Arrange
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

    // Create teams with specific presentation order
    const team1 = new Team('team-1', 'ABC123', 'Team Alpha', ['player-1'], 0, 2);
    await teamRepository.save(team1);

    const team2 = new Team('team-2', 'ABC123', 'Team Beta', ['player-2'], 0, 0);
    await teamRepository.save(team2);

    const team3 = new Team('team-3', 'ABC123', 'Team Gamma', ['player-3'], 0, 1);
    await teamRepository.save(team3);

    const player1 = new Participant(
      'player-1',
      'ABC123',
      'Alice',
      'player',
      'team-1',
      'connected',
      [
        {
          id: 'ep1',
          participantId: 'player-1',
          episodeNumber: 1,
          text: 'I like pizza',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep2',
          participantId: 'player-1',
          episodeNumber: 2,
          text: 'I like pasta',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep3',
          participantId: 'player-1',
          episodeNumber: 3,
          text: 'I like sushi',
          isLie: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      new Date()
    );
    await participantRepository.save(player1);

    const player2 = new Participant(
      'player-2',
      'ABC123',
      'Bob',
      'player',
      'team-2',
      'connected',
      [
        {
          id: 'ep4',
          participantId: 'player-2',
          episodeNumber: 1,
          text: 'I have a dog',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep5',
          participantId: 'player-2',
          episodeNumber: 2,
          text: 'I have a cat',
          isLie: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep6',
          participantId: 'player-2',
          episodeNumber: 3,
          text: 'I have a bird',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      new Date()
    );
    await participantRepository.save(player2);

    const player3 = new Participant(
      'player-3',
      'ABC123',
      'Charlie',
      'player',
      'team-3',
      'connected',
      [
        {
          id: 'ep7',
          participantId: 'player-3',
          episodeNumber: 1,
          text: 'I play guitar',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep8',
          participantId: 'player-3',
          episodeNumber: 2,
          text: 'I play piano',
          isLie: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep9',
          participantId: 'player-3',
          episodeNumber: 3,
          text: 'I play drums',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      new Date()
    );
    await participantRepository.save(player3);

    const request = {
      sessionId: 'ABC123',
      hostId: 'host-id',
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.success).toBe(true);
    const updatedSession = await sessionRepository.findById('ABC123');
    // Expect order: team-2 (order 0), team-3 (order 1), team-1 (order 2)
    expect(updatedSession?.presentationOrder).toEqual(['team-2', 'team-3', 'team-1']);
  });

  it('should reject starting game with unassigned participants', async () => {
    // Arrange
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

    const team1 = new Team('team-1', 'ABC123', 'Team Alpha', ['player-1'], 0, 0);
    await teamRepository.save(team1);

    const team2 = new Team('team-2', 'ABC123', 'Team Beta', ['player-2'], 0, 1);
    await teamRepository.save(team2);

    const player1 = new Participant(
      'player-1',
      'ABC123',
      'Alice',
      'player',
      'team-1',
      'connected',
      [
        {
          id: 'ep1',
          participantId: 'player-1',
          episodeNumber: 1,
          text: 'I like pizza',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep2',
          participantId: 'player-1',
          episodeNumber: 2,
          text: 'I like pasta',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep3',
          participantId: 'player-1',
          episodeNumber: 3,
          text: 'I like sushi',
          isLie: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      new Date()
    );
    await participantRepository.save(player1);

    const player2 = new Participant(
      'player-2',
      'ABC123',
      'Bob',
      'player',
      'team-2',
      'connected',
      [
        {
          id: 'ep4',
          participantId: 'player-2',
          episodeNumber: 1,
          text: 'I have a dog',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep5',
          participantId: 'player-2',
          episodeNumber: 2,
          text: 'I have a cat',
          isLie: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep6',
          participantId: 'player-2',
          episodeNumber: 3,
          text: 'I have a bird',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      new Date()
    );
    await participantRepository.save(player2);

    // Unassigned participant
    const player3 = new Participant(
      'player-3',
      'ABC123',
      'Charlie',
      'player',
      null, // Not assigned to any team
      'connected',
      [
        {
          id: 'ep7',
          participantId: 'player-3',
          episodeNumber: 1,
          text: 'I play guitar',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep8',
          participantId: 'player-3',
          episodeNumber: 2,
          text: 'I play piano',
          isLie: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'ep9',
          participantId: 'player-3',
          episodeNumber: 3,
          text: 'I play drums',
          isLie: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      new Date()
    );
    await participantRepository.save(player3);

    const request = {
      sessionId: 'ABC123',
      hostId: 'host-id',
    };

    // Act & Assert
    await expect(useCase.execute(request)).rejects.toThrow('All players must be assigned to teams');
  });
});
