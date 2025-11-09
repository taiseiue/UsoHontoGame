import { describe, expect, it } from 'vitest';
import { Team } from '@/server/domain/entities/Team';

describe('Team', () => {
  describe('constructor', () => {
    it('should create team with valid data', () => {
      const participantIds = ['participant-1', 'participant-2'];
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        participantIds,
        0,
        1
      );

      expect(team.id).toBe('team-1');
      expect(team.sessionId).toBe('session-1');
      expect(team.name).toBe('Team Alpha');
      expect(team.participantIds).toBe(participantIds);
      expect(team.cumulativeScore).toBe(0);
      expect(team.presentationOrder).toBe(1);
    });

    it('should create team with null presentation order', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Beta',
        [],
        0,
        null
      );

      expect(team.presentationOrder).toBeNull();
    });

    it('should create team with empty participant list', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Gamma',
        [],
        0,
        1
      );

      expect(team.participantIds).toEqual([]);
      expect(team.participantIds.length).toBe(0);
    });

    it('should create team with initial score', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Delta',
        [],
        50,
        1
      );

      expect(team.cumulativeScore).toBe(50);
    });
  });

  describe('addPoints', () => {
    it('should add positive points to score', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        [],
        0,
        1
      );

      team.addPoints(10);

      expect(team.cumulativeScore).toBe(10);
    });

    it('should accumulate multiple point additions', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        [],
        0,
        1
      );

      team.addPoints(10);
      team.addPoints(5);
      team.addPoints(15);

      expect(team.cumulativeScore).toBe(30);
    });

    it('should add points to existing score', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        [],
        50,
        1
      );

      team.addPoints(10);

      expect(team.cumulativeScore).toBe(60);
    });

    it('should handle negative points', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        [],
        50,
        1
      );

      team.addPoints(-10);

      expect(team.cumulativeScore).toBe(40);
    });

    it('should handle zero points', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        [],
        50,
        1
      );

      team.addPoints(0);

      expect(team.cumulativeScore).toBe(50);
    });

    it('should allow score to become negative', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        [],
        10,
        1
      );

      team.addPoints(-20);

      expect(team.cumulativeScore).toBe(-10);
    });
  });

  describe('hasParticipant', () => {
    it('should return true when participant is in team', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        ['participant-1', 'participant-2', 'participant-3'],
        0,
        1
      );

      expect(team.hasParticipant('participant-1')).toBe(true);
      expect(team.hasParticipant('participant-2')).toBe(true);
      expect(team.hasParticipant('participant-3')).toBe(true);
    });

    it('should return false when participant is not in team', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        ['participant-1', 'participant-2'],
        0,
        1
      );

      expect(team.hasParticipant('participant-3')).toBe(false);
      expect(team.hasParticipant('participant-999')).toBe(false);
    });

    it('should return false for empty team', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        [],
        0,
        1
      );

      expect(team.hasParticipant('participant-1')).toBe(false);
    });
  });

  describe('addParticipant', () => {
    it('should add participant to empty team', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        [],
        0,
        1
      );

      team.addParticipant('participant-1');

      expect(team.participantIds).toEqual(['participant-1']);
      expect(team.hasParticipant('participant-1')).toBe(true);
    });

    it('should add multiple participants', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        [],
        0,
        1
      );

      team.addParticipant('participant-1');
      team.addParticipant('participant-2');
      team.addParticipant('participant-3');

      expect(team.participantIds).toEqual([
        'participant-1',
        'participant-2',
        'participant-3',
      ]);
    });

    it('should not add duplicate participant', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        ['participant-1'],
        0,
        1
      );

      team.addParticipant('participant-1');

      expect(team.participantIds).toEqual(['participant-1']);
      expect(team.participantIds.length).toBe(1);
    });

    it('should not add participant that already exists even after multiple attempts', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        [],
        0,
        1
      );

      team.addParticipant('participant-1');
      team.addParticipant('participant-1');
      team.addParticipant('participant-1');

      expect(team.participantIds).toEqual(['participant-1']);
      expect(team.participantIds.length).toBe(1);
    });

    it('should add participant to existing team', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        ['participant-1', 'participant-2'],
        0,
        1
      );

      team.addParticipant('participant-3');

      expect(team.participantIds).toEqual([
        'participant-1',
        'participant-2',
        'participant-3',
      ]);
    });
  });

  describe('removeParticipant', () => {
    it('should remove participant from team', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        ['participant-1', 'participant-2', 'participant-3'],
        0,
        1
      );

      team.removeParticipant('participant-2');

      expect(team.participantIds).toEqual(['participant-1', 'participant-3']);
      expect(team.hasParticipant('participant-2')).toBe(false);
    });

    it('should remove first participant', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        ['participant-1', 'participant-2', 'participant-3'],
        0,
        1
      );

      team.removeParticipant('participant-1');

      expect(team.participantIds).toEqual(['participant-2', 'participant-3']);
    });

    it('should remove last participant', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        ['participant-1', 'participant-2', 'participant-3'],
        0,
        1
      );

      team.removeParticipant('participant-3');

      expect(team.participantIds).toEqual(['participant-1', 'participant-2']);
    });

    it('should handle removing non-existent participant gracefully', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        ['participant-1', 'participant-2'],
        0,
        1
      );

      team.removeParticipant('participant-999');

      expect(team.participantIds).toEqual(['participant-1', 'participant-2']);
    });

    it('should handle removing from empty team', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        [],
        0,
        1
      );

      team.removeParticipant('participant-1');

      expect(team.participantIds).toEqual([]);
    });

    it('should remove all participants one by one', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        ['participant-1', 'participant-2', 'participant-3'],
        0,
        1
      );

      team.removeParticipant('participant-1');
      expect(team.participantIds.length).toBe(2);

      team.removeParticipant('participant-2');
      expect(team.participantIds.length).toBe(1);

      team.removeParticipant('participant-3');
      expect(team.participantIds.length).toBe(0);
      expect(team.participantIds).toEqual([]);
    });

    it('should allow re-adding a removed participant', () => {
      const team = new Team(
        'team-1',
        'session-1',
        'Team Alpha',
        ['participant-1', 'participant-2'],
        0,
        1
      );

      team.removeParticipant('participant-1');
      expect(team.hasParticipant('participant-1')).toBe(false);

      team.addParticipant('participant-1');
      expect(team.hasParticipant('participant-1')).toBe(true);
    });
  });
});
