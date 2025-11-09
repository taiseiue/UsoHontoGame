import { beforeEach, describe, expect, it } from 'vitest';
import { ManageTeamsUseCase } from '@/server/application/use-cases/teams/ManageTeamsUseCase';
import { GameSession } from '@/server/domain/entities/GameSession';
import { Participant } from '@/server/domain/entities/Participant';
import { Team } from '@/server/domain/entities/Team';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';
import { InMemoryParticipantRepository } from '@/server/infrastructure/repositories/InMemoryParticipantRepository';
import { InMemoryTeamRepository } from '@/server/infrastructure/repositories/InMemoryTeamRepository';

describe('ManageTeamsUseCase', () => {
  let sessionRepository: InMemoryGameSessionRepository;
  let teamRepository: InMemoryTeamRepository;
  let participantRepository: InMemoryParticipantRepository;
  let useCase: ManageTeamsUseCase;

  beforeEach(() => {
    sessionRepository = InMemoryGameSessionRepository.getInstance();
    teamRepository = InMemoryTeamRepository.getInstance();
    participantRepository = InMemoryParticipantRepository.getInstance();

    // Clear repositories for test isolation
    sessionRepository.clearAll();
    teamRepository.clearAll();
    participantRepository.clearAll();

    useCase = new ManageTeamsUseCase(sessionRepository, teamRepository, participantRepository);
  });

  describe('createTeam', () => {
    it('should create a new team in preparation phase', async () => {
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
        action: 'create' as const,
        sessionId: 'ABC123',
        hostId: 'host-id',
        teamName: 'Team Alpha',
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.team).toBeDefined();
      expect(result.team?.name).toBe('Team Alpha');
      expect(result.team?.participantIds).toEqual([]);
      expect(result.team?.cumulativeScore).toBe(0);
    });

    it('should reject team creation with duplicate name', async () => {
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

      const existingTeam = new Team('team-1', 'ABC123', 'Team Alpha', [], 0, null);
      await teamRepository.save(existingTeam);

      const request = {
        action: 'create' as const,
        sessionId: 'ABC123',
        hostId: 'host-id',
        teamName: 'Team Alpha',
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow('Team name already exists');
    });

    it('should reject team creation when session not found', async () => {
      // Arrange
      const request = {
        action: 'create' as const,
        sessionId: 'INVALID',
        hostId: 'host-id',
        teamName: 'Team Alpha',
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow('Session not found');
    });

    it('should reject team creation by non-host', async () => {
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
        action: 'create' as const,
        sessionId: 'ABC123',
        hostId: 'wrong-host-id',
        teamName: 'Team Alpha',
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow('Unauthorized');
    });

    it('should reject team creation after game started', async () => {
      // Arrange
      const session = new GameSession(
        'ABC123',
        new Date(),
        new Date(),
        'presentation',
        'host-id',
        null,
        { pointsForCorrectGuess: 10, pointsPerDeception: 5 },
        [],
        0
      );
      await sessionRepository.save(session);

      const request = {
        action: 'create' as const,
        sessionId: 'ABC123',
        hostId: 'host-id',
        teamName: 'Team Alpha',
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        'Cannot modify teams after game started'
      );
    });
  });

  describe('assignParticipant', () => {
    it('should assign participant to team', async () => {
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

      const team = new Team('team-1', 'ABC123', 'Team Alpha', [], 0, null);
      await teamRepository.save(team);

      const participant = new Participant(
        'player-1',
        'ABC123',
        'Alice',
        'player',
        null,
        'connected',
        [],
        new Date()
      );
      await participantRepository.save(participant);

      const request = {
        action: 'assign' as const,
        sessionId: 'ABC123',
        hostId: 'host-id',
        teamId: 'team-1',
        participantId: 'player-1',
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      const updatedTeam = await teamRepository.findById('team-1');
      expect(updatedTeam?.participantIds).toContain('player-1');
      const updatedParticipant = await participantRepository.findById('player-1');
      expect(updatedParticipant?.teamId).toBe('team-1');
    });

    it('should reject assigning host to team', async () => {
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

      const team = new Team('team-1', 'ABC123', 'Team Alpha', [], 0, null);
      await teamRepository.save(team);

      const host = new Participant(
        'host-id',
        'ABC123',
        'Host',
        'host',
        null,
        'connected',
        [],
        new Date()
      );
      await participantRepository.save(host);

      const request = {
        action: 'assign' as const,
        sessionId: 'ABC123',
        hostId: 'host-id',
        teamId: 'team-1',
        participantId: 'host-id',
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow('Cannot assign host to team');
    });

    it('should move participant from one team to another', async () => {
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

      const teamAlpha = new Team('team-1', 'ABC123', 'Team Alpha', ['player-1'], 0, null);
      await teamRepository.save(teamAlpha);

      const teamBeta = new Team('team-2', 'ABC123', 'Team Beta', [], 0, null);
      await teamRepository.save(teamBeta);

      const participant = new Participant(
        'player-1',
        'ABC123',
        'Alice',
        'player',
        'team-1',
        'connected',
        [],
        new Date()
      );
      await participantRepository.save(participant);

      const request = {
        action: 'assign' as const,
        sessionId: 'ABC123',
        hostId: 'host-id',
        teamId: 'team-2',
        participantId: 'player-1',
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      const oldTeam = await teamRepository.findById('team-1');
      expect(oldTeam?.participantIds).not.toContain('player-1');
      const newTeam = await teamRepository.findById('team-2');
      expect(newTeam?.participantIds).toContain('player-1');
    });
  });

  describe('removeParticipant', () => {
    it('should remove participant from team', async () => {
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

      const team = new Team('team-1', 'ABC123', 'Team Alpha', ['player-1'], 0, null);
      await teamRepository.save(team);

      const participant = new Participant(
        'player-1',
        'ABC123',
        'Alice',
        'player',
        'team-1',
        'connected',
        [],
        new Date()
      );
      await participantRepository.save(participant);

      const request = {
        action: 'remove' as const,
        sessionId: 'ABC123',
        hostId: 'host-id',
        participantId: 'player-1',
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      const updatedTeam = await teamRepository.findById('team-1');
      expect(updatedTeam?.participantIds).not.toContain('player-1');
      const updatedParticipant = await participantRepository.findById('player-1');
      expect(updatedParticipant?.teamId).toBeNull();
    });
  });

  describe('deleteTeam', () => {
    it('should delete team and unassign participants', async () => {
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

      const team = new Team('team-1', 'ABC123', 'Team Alpha', ['player-1', 'player-2'], 0, null);
      await teamRepository.save(team);

      const participant1 = new Participant(
        'player-1',
        'ABC123',
        'Alice',
        'player',
        'team-1',
        'connected',
        [],
        new Date()
      );
      await participantRepository.save(participant1);

      const participant2 = new Participant(
        'player-2',
        'ABC123',
        'Bob',
        'player',
        'team-1',
        'connected',
        [],
        new Date()
      );
      await participantRepository.save(participant2);

      const request = {
        action: 'delete' as const,
        sessionId: 'ABC123',
        hostId: 'host-id',
        teamId: 'team-1',
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      const deletedTeam = await teamRepository.findById('team-1');
      expect(deletedTeam).toBeNull();
      const updatedParticipant1 = await participantRepository.findById('player-1');
      expect(updatedParticipant1?.teamId).toBeNull();
      const updatedParticipant2 = await participantRepository.findById('player-2');
      expect(updatedParticipant2?.teamId).toBeNull();
    });
  });
});
