import { describe, expect, it } from 'vitest';
import { Vote } from '@/server/domain/entities/Vote';

describe('Vote', () => {
  describe('constructor', () => {
    it('should create vote with valid data', () => {
      const vote = new Vote(
        'vote-1',
        'turn-1',
        'team-1',
        1,
        null
      );

      expect(vote.id).toBe('vote-1');
      expect(vote.turnId).toBe('turn-1');
      expect(vote.votingTeamId).toBe('team-1');
      expect(vote.selectedEpisodeNumber).toBe(1);
      expect(vote.isCorrect).toBeNull();
      expect(vote.submittedAt).toBeInstanceOf(Date);
    });

    it('should create vote with episode number 2', () => {
      const vote = new Vote(
        'vote-1',
        'turn-1',
        'team-1',
        2,
        null
      );

      expect(vote.selectedEpisodeNumber).toBe(2);
    });

    it('should create vote with episode number 3', () => {
      const vote = new Vote(
        'vote-1',
        'turn-1',
        'team-1',
        3,
        null
      );

      expect(vote.selectedEpisodeNumber).toBe(3);
    });

    it('should create vote with correctness already set', () => {
      const vote = new Vote(
        'vote-1',
        'turn-1',
        'team-1',
        1,
        true
      );

      expect(vote.isCorrect).toBe(true);
    });

    it('should create vote with custom timestamp', () => {
      const customTimestamp = new Date('2025-01-01');
      const vote = new Vote(
        'vote-1',
        'turn-1',
        'team-1',
        1,
        null,
        customTimestamp
      );

      expect(vote.submittedAt).toBe(customTimestamp);
    });

    it('should throw error for episode number 0', () => {
      expect(
        () =>
          new Vote(
            'vote-1',
            'turn-1',
            'team-1',
            0,
            null
          )
      ).toThrow('Selected episode number must be 1, 2, or 3');
    });

    it('should throw error for episode number 4', () => {
      expect(
        () =>
          new Vote(
            'vote-1',
            'turn-1',
            'team-1',
            4,
            null
          )
      ).toThrow('Selected episode number must be 1, 2, or 3');
    });

    it('should throw error for negative episode number', () => {
      expect(
        () =>
          new Vote(
            'vote-1',
            'turn-1',
            'team-1',
            -1,
            null
          )
      ).toThrow('Selected episode number must be 1, 2, or 3');
    });

    it('should throw error for episode number greater than 3', () => {
      expect(
        () =>
          new Vote(
            'vote-1',
            'turn-1',
            'team-1',
            10,
            null
          )
      ).toThrow('Selected episode number must be 1, 2, or 3');
    });

    it('should validate on construction even with correctness set', () => {
      expect(
        () =>
          new Vote(
            'vote-1',
            'turn-1',
            'team-1',
            0,
            true
          )
      ).toThrow('Selected episode number must be 1, 2, or 3');
    });
  });

  describe('setCorrectness', () => {
    it('should set vote as correct', () => {
      const vote = new Vote(
        'vote-1',
        'turn-1',
        'team-1',
        1,
        null
      );

      vote.setCorrectness(true);

      expect(vote.isCorrect).toBe(true);
    });

    it('should set vote as incorrect', () => {
      const vote = new Vote(
        'vote-1',
        'turn-1',
        'team-1',
        1,
        null
      );

      vote.setCorrectness(false);

      expect(vote.isCorrect).toBe(false);
    });

    it('should change correctness from true to false', () => {
      const vote = new Vote(
        'vote-1',
        'turn-1',
        'team-1',
        1,
        true
      );

      expect(vote.isCorrect).toBe(true);

      vote.setCorrectness(false);

      expect(vote.isCorrect).toBe(false);
    });

    it('should change correctness from false to true', () => {
      const vote = new Vote(
        'vote-1',
        'turn-1',
        'team-1',
        1,
        false
      );

      expect(vote.isCorrect).toBe(false);

      vote.setCorrectness(true);

      expect(vote.isCorrect).toBe(true);
    });

    it('should allow setting same correctness multiple times', () => {
      const vote = new Vote(
        'vote-1',
        'turn-1',
        'team-1',
        1,
        null
      );

      vote.setCorrectness(true);
      expect(vote.isCorrect).toBe(true);

      vote.setCorrectness(true);
      expect(vote.isCorrect).toBe(true);
    });

    it('should update correctness from null', () => {
      const vote = new Vote(
        'vote-1',
        'turn-1',
        'team-1',
        2,
        null
      );

      expect(vote.isCorrect).toBeNull();

      vote.setCorrectness(true);
      expect(vote.isCorrect).toBe(true);
    });
  });

  describe('validation', () => {
    it('should accept all valid episode numbers', () => {
      const validNumbers = [1, 2, 3];

      validNumbers.forEach((number) => {
        const vote = new Vote(
          'vote-1',
          'turn-1',
          'team-1',
          number,
          null
        );
        expect(vote.selectedEpisodeNumber).toBe(number);
      });
    });

    it('should reject all invalid episode numbers', () => {
      const invalidNumbers = [-10, -1, 0, 4, 5, 10, 100];

      invalidNumbers.forEach((number) => {
        expect(
          () =>
            new Vote(
              'vote-1',
              'turn-1',
              'team-1',
              number,
              null
            )
        ).toThrow('Selected episode number must be 1, 2, or 3');
      });
    });
  });

  describe('immutability', () => {
    it('should not modify submittedAt after creation', () => {
      const vote = new Vote(
        'vote-1',
        'turn-1',
        'team-1',
        1,
        null
      );

      const originalTimestamp = vote.submittedAt;

      vote.setCorrectness(true);

      expect(vote.submittedAt).toBe(originalTimestamp);
    });

    it('should not modify other properties when setting correctness', () => {
      const vote = new Vote(
        'vote-1',
        'turn-1',
        'team-1',
        2,
        null
      );

      const originalId = vote.id;
      const originalTurnId = vote.turnId;
      const originalVotingTeamId = vote.votingTeamId;
      const originalEpisodeNumber = vote.selectedEpisodeNumber;

      vote.setCorrectness(true);

      expect(vote.id).toBe(originalId);
      expect(vote.turnId).toBe(originalTurnId);
      expect(vote.votingTeamId).toBe(originalVotingTeamId);
      expect(vote.selectedEpisodeNumber).toBe(originalEpisodeNumber);
    });
  });
});
