import { describe, expect, it } from 'vitest';
import { GameSession } from '@/server/domain/entities/GameSession';
import { SessionPhase } from '@/types/game';

describe('GameSession', () => {
  describe('constructor', () => {
    it('should create game session with valid data', () => {
      const createdAt = new Date('2025-01-01');
      const lastActivity = new Date('2025-01-01');
      const scoringRules = {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      };
      const presentationOrder = ['team-1', 'team-2', 'team-3'];

      const session = new GameSession(
        'session-1',
        createdAt,
        lastActivity,
        SessionPhase.PREPARATION,
        'host-1',
        null,
        scoringRules,
        presentationOrder,
        0
      );

      expect(session.id).toBe('session-1');
      expect(session.createdAt).toBe(createdAt);
      expect(session.lastActivityTimestamp).toBe(lastActivity);
      expect(session.phase).toBe(SessionPhase.PREPARATION);
      expect(session.hostId).toBe('host-1');
      expect(session.currentTurnId).toBeNull();
      expect(session.scoringRules).toBe(scoringRules);
      expect(session.presentationOrder).toBe(presentationOrder);
      expect(session.currentPresentingTeamIndex).toBe(0);
    });

    it('should create game session with current turn', () => {
      const scoringRules = {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      };
      const session = new GameSession(
        'session-1',
        new Date(),
        new Date(),
        SessionPhase.PRESENTATION,
        'host-1',
        'turn-1',
        scoringRules,
        ['team-1', 'team-2'],
        0
      );

      expect(session.currentTurnId).toBe('turn-1');
    });

    it('should create game session in different phases', () => {
      const scoringRules = {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      };

      const phases = [
        SessionPhase.PREPARATION,
        SessionPhase.PRESENTATION,
        SessionPhase.VOTING,
        SessionPhase.REVEAL,
        SessionPhase.COMPLETED,
      ];

      phases.forEach((phase) => {
        const session = new GameSession(
          'session-1',
          new Date(),
          new Date(),
          phase,
          'host-1',
          null,
          scoringRules,
          ['team-1'],
          0
        );
        expect(session.phase).toBe(phase);
      });
    });
  });

  describe('updateActivity', () => {
    it('should update lastActivityTimestamp to current time', () => {
      const oldTimestamp = new Date('2025-01-01');
      const scoringRules = {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      };
      const session = new GameSession(
        'session-1',
        new Date('2025-01-01'),
        oldTimestamp,
        SessionPhase.PREPARATION,
        'host-1',
        null,
        scoringRules,
        ['team-1'],
        0
      );

      session.updateActivity();

      expect(session.lastActivityTimestamp.getTime()).toBeGreaterThan(
        oldTimestamp.getTime()
      );
    });
  });

  describe('transitionToPhase', () => {
    it('should transition from preparation to presentation', () => {
      const oldTimestamp = new Date('2025-01-01');
      const scoringRules = {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      };
      const session = new GameSession(
        'session-1',
        new Date('2025-01-01'),
        oldTimestamp,
        SessionPhase.PREPARATION,
        'host-1',
        null,
        scoringRules,
        ['team-1'],
        0
      );

      session.transitionToPhase(SessionPhase.PRESENTATION);

      expect(session.phase).toBe(SessionPhase.PRESENTATION);
      expect(session.lastActivityTimestamp.getTime()).toBeGreaterThan(
        oldTimestamp.getTime()
      );
    });

    it('should transition through all phases', () => {
      const scoringRules = {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      };
      const session = new GameSession(
        'session-1',
        new Date(),
        new Date(),
        SessionPhase.PREPARATION,
        'host-1',
        null,
        scoringRules,
        ['team-1'],
        0
      );

      session.transitionToPhase(SessionPhase.PRESENTATION);
      expect(session.phase).toBe(SessionPhase.PRESENTATION);

      session.transitionToPhase(SessionPhase.VOTING);
      expect(session.phase).toBe(SessionPhase.VOTING);

      session.transitionToPhase(SessionPhase.REVEAL);
      expect(session.phase).toBe(SessionPhase.REVEAL);

      session.transitionToPhase(SessionPhase.COMPLETED);
      expect(session.phase).toBe(SessionPhase.COMPLETED);
    });
  });

  describe('advanceToNextTeam', () => {
    it('should increment currentPresentingTeamIndex', () => {
      const scoringRules = {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      };
      const session = new GameSession(
        'session-1',
        new Date(),
        new Date(),
        SessionPhase.PRESENTATION,
        'host-1',
        null,
        scoringRules,
        ['team-1', 'team-2', 'team-3'],
        0
      );

      session.advanceToNextTeam();

      expect(session.currentPresentingTeamIndex).toBe(1);
    });

    it('should update last activity timestamp', () => {
      const oldTimestamp = new Date('2025-01-01');
      const scoringRules = {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      };
      const session = new GameSession(
        'session-1',
        new Date('2025-01-01'),
        oldTimestamp,
        SessionPhase.PRESENTATION,
        'host-1',
        null,
        scoringRules,
        ['team-1', 'team-2'],
        0
      );

      session.advanceToNextTeam();

      expect(session.lastActivityTimestamp.getTime()).toBeGreaterThan(
        oldTimestamp.getTime()
      );
    });

    it('should advance through multiple teams', () => {
      const scoringRules = {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      };
      const session = new GameSession(
        'session-1',
        new Date(),
        new Date(),
        SessionPhase.PRESENTATION,
        'host-1',
        null,
        scoringRules,
        ['team-1', 'team-2', 'team-3'],
        0
      );

      expect(session.currentPresentingTeamIndex).toBe(0);

      session.advanceToNextTeam();
      expect(session.currentPresentingTeamIndex).toBe(1);

      session.advanceToNextTeam();
      expect(session.currentPresentingTeamIndex).toBe(2);

      session.advanceToNextTeam();
      expect(session.currentPresentingTeamIndex).toBe(3);
    });
  });

  describe('isAllTeamsCompleted', () => {
    it('should return false when teams remain', () => {
      const scoringRules = {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      };
      const session = new GameSession(
        'session-1',
        new Date(),
        new Date(),
        SessionPhase.PRESENTATION,
        'host-1',
        null,
        scoringRules,
        ['team-1', 'team-2', 'team-3'],
        0
      );

      expect(session.isAllTeamsCompleted()).toBe(false);
    });

    it('should return false when on last team', () => {
      const scoringRules = {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      };
      const session = new GameSession(
        'session-1',
        new Date(),
        new Date(),
        SessionPhase.PRESENTATION,
        'host-1',
        null,
        scoringRules,
        ['team-1', 'team-2', 'team-3'],
        2
      );

      expect(session.isAllTeamsCompleted()).toBe(false);
    });

    it('should return true when index equals array length', () => {
      const scoringRules = {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      };
      const session = new GameSession(
        'session-1',
        new Date(),
        new Date(),
        SessionPhase.PRESENTATION,
        'host-1',
        null,
        scoringRules,
        ['team-1', 'team-2', 'team-3'],
        3
      );

      expect(session.isAllTeamsCompleted()).toBe(true);
    });

    it('should return true when index exceeds array length', () => {
      const scoringRules = {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      };
      const session = new GameSession(
        'session-1',
        new Date(),
        new Date(),
        SessionPhase.PRESENTATION,
        'host-1',
        null,
        scoringRules,
        ['team-1', 'team-2'],
        5
      );

      expect(session.isAllTeamsCompleted()).toBe(true);
    });

    it('should return true for empty presentation order', () => {
      const scoringRules = {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      };
      const session = new GameSession(
        'session-1',
        new Date(),
        new Date(),
        SessionPhase.PRESENTATION,
        'host-1',
        null,
        scoringRules,
        [],
        0
      );

      expect(session.isAllTeamsCompleted()).toBe(true);
    });
  });

  describe('getCurrentPresentingTeamId', () => {
    it('should return first team id when at index 0', () => {
      const scoringRules = {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      };
      const session = new GameSession(
        'session-1',
        new Date(),
        new Date(),
        SessionPhase.PRESENTATION,
        'host-1',
        null,
        scoringRules,
        ['team-1', 'team-2', 'team-3'],
        0
      );

      expect(session.getCurrentPresentingTeamId()).toBe('team-1');
    });

    it('should return correct team id at different indices', () => {
      const scoringRules = {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      };
      const session = new GameSession(
        'session-1',
        new Date(),
        new Date(),
        SessionPhase.PRESENTATION,
        'host-1',
        null,
        scoringRules,
        ['team-1', 'team-2', 'team-3'],
        1
      );

      expect(session.getCurrentPresentingTeamId()).toBe('team-2');

      session.advanceToNextTeam();
      expect(session.getCurrentPresentingTeamId()).toBe('team-3');
    });

    it('should return null when index equals array length', () => {
      const scoringRules = {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      };
      const session = new GameSession(
        'session-1',
        new Date(),
        new Date(),
        SessionPhase.PRESENTATION,
        'host-1',
        null,
        scoringRules,
        ['team-1', 'team-2'],
        2
      );

      expect(session.getCurrentPresentingTeamId()).toBeNull();
    });

    it('should return null when index exceeds array length', () => {
      const scoringRules = {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      };
      const session = new GameSession(
        'session-1',
        new Date(),
        new Date(),
        SessionPhase.PRESENTATION,
        'host-1',
        null,
        scoringRules,
        ['team-1', 'team-2'],
        5
      );

      expect(session.getCurrentPresentingTeamId()).toBeNull();
    });

    it('should return null for empty presentation order', () => {
      const scoringRules = {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5,
      };
      const session = new GameSession(
        'session-1',
        new Date(),
        new Date(),
        SessionPhase.PRESENTATION,
        'host-1',
        null,
        scoringRules,
        [],
        0
      );

      expect(session.getCurrentPresentingTeamId()).toBeNull();
    });
  });
});
