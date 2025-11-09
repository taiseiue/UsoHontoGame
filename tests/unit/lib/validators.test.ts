import { describe, expect, it } from 'vitest';
import {
  validateSessionId,
  validateNickname,
  validateEpisodeText,
  validateEpisodeSet,
  validateVoteEpisodeNumber,
  validateVoteSubmission,
  sanitizeInput,
} from '@/lib/validators';

describe('validators', () => {
  describe('validateSessionId', () => {
    it('should return true for valid session ID', () => {
      expect(validateSessionId('ABCDEF')).toBe(true);
      expect(validateSessionId('XYZ789')).toBe(true);
      expect(validateSessionId('QRSTUV')).toBe(true);
      expect(validateSessionId('234567')).toBe(true);
    });

    it('should return false for invalid length', () => {
      expect(validateSessionId('ABC')).toBe(false);
      expect(validateSessionId('ABCDEFG')).toBe(false);
      expect(validateSessionId('')).toBe(false);
    });

    it('should return false for invalid characters', () => {
      expect(validateSessionId('ABC01I')).toBe(false); // Contains 0, 1, I (excluded from base32)
      expect(validateSessionId('abcdef')).toBe(false); // Contains lowercase
      expect(validateSessionId('ABC-DE')).toBe(false); // Contains hyphen
    });
  });

  describe('validateNickname', () => {
    it('should return valid for proper nicknames', () => {
      expect(validateNickname('Player1')).toEqual({ valid: true });
      expect(validateNickname('Alice')).toEqual({ valid: true });
      expect(validateNickname('  Bob  ')).toEqual({ valid: true }); // Trimmed
    });

    it('should return error for empty nickname', () => {
      expect(validateNickname('')).toEqual({
        valid: false,
        error: 'Nickname cannot be empty',
      });
      expect(validateNickname('   ')).toEqual({
        valid: false,
        error: 'Nickname cannot be empty',
      });
    });

    it('should return error for nickname too long', () => {
      const longNickname = 'a'.repeat(31);
      expect(validateNickname(longNickname)).toEqual({
        valid: false,
        error: 'Nickname must be 30 characters or less',
      });
    });
  });

  describe('validateEpisodeText', () => {
    it('should return valid for proper episode text', () => {
      expect(validateEpisodeText('This is a valid episode text')).toEqual({ valid: true });
      expect(validateEpisodeText('A'.repeat(50))).toEqual({ valid: true });
    });

    it('should return error for episode text too short', () => {
      expect(validateEpisodeText('Short')).toEqual({
        valid: false,
        error: 'Episode must be at least 10 characters',
      });
      expect(validateEpisodeText('')).toEqual({
        valid: false,
        error: 'Episode must be at least 10 characters',
      });
    });

    it('should return error for episode text too long', () => {
      const longText = 'a'.repeat(501);
      expect(validateEpisodeText(longText)).toEqual({
        valid: false,
        error: 'Episode must be 500 characters or less',
      });
    });
  });

  describe('validateEpisodeSet', () => {
    it('should return valid for proper episode set', () => {
      const episodes = [
        { text: 'This is episode 1', isLie: false },
        { text: 'This is episode 2', isLie: true },
        { text: 'This is episode 3', isLie: false },
      ];
      expect(validateEpisodeSet(episodes)).toEqual({ valid: true });
    });

    it('should return error when not exactly 3 episodes', () => {
      const twoEpisodes = [
        { text: 'Episode 1 text', isLie: false },
        { text: 'Episode 2 text', isLie: true },
      ];
      expect(validateEpisodeSet(twoEpisodes)).toEqual({
        valid: false,
        error: 'Must provide exactly 3 episodes',
      });

      const fourEpisodes = [
        { text: 'Episode 1 text', isLie: false },
        { text: 'Episode 2 text', isLie: true },
        { text: 'Episode 3 text', isLie: false },
        { text: 'Episode 4 text', isLie: false },
      ];
      expect(validateEpisodeSet(fourEpisodes)).toEqual({
        valid: false,
        error: 'Must provide exactly 3 episodes',
      });
    });

    it('should return error when episode text is invalid', () => {
      const episodes = [
        { text: 'Short', isLie: false },
        { text: 'This is episode 2', isLie: true },
        { text: 'This is episode 3', isLie: false },
      ];
      expect(validateEpisodeSet(episodes)).toEqual({
        valid: false,
        error: 'Episode 1: Episode must be at least 10 characters',
      });
    });

    it('should return error when not exactly one lie', () => {
      const noLies = [
        { text: 'This is episode 1', isLie: false },
        { text: 'This is episode 2', isLie: false },
        { text: 'This is episode 3', isLie: false },
      ];
      expect(validateEpisodeSet(noLies)).toEqual({
        valid: false,
        error: 'Exactly one episode must be marked as a lie',
      });

      const twoLies = [
        { text: 'This is episode 1', isLie: true },
        { text: 'This is episode 2', isLie: true },
        { text: 'This is episode 3', isLie: false },
      ];
      expect(validateEpisodeSet(twoLies)).toEqual({
        valid: false,
        error: 'Exactly one episode must be marked as a lie',
      });
    });
  });

  describe('validateVoteEpisodeNumber', () => {
    it('should return valid for episode numbers 1, 2, 3', () => {
      expect(validateVoteEpisodeNumber(1)).toEqual({ valid: true });
      expect(validateVoteEpisodeNumber(2)).toEqual({ valid: true });
      expect(validateVoteEpisodeNumber(3)).toEqual({ valid: true });
    });

    it('should return error for non-integer', () => {
      expect(validateVoteEpisodeNumber(1.5)).toEqual({
        valid: false,
        error: 'Episode number must be an integer',
      });
      expect(validateVoteEpisodeNumber(2.9)).toEqual({
        valid: false,
        error: 'Episode number must be an integer',
      });
    });

    it('should return error for out of range', () => {
      expect(validateVoteEpisodeNumber(0)).toEqual({
        valid: false,
        error: 'Episode number must be 1, 2, or 3',
      });
      expect(validateVoteEpisodeNumber(4)).toEqual({
        valid: false,
        error: 'Episode number must be 1, 2, or 3',
      });
      expect(validateVoteEpisodeNumber(-1)).toEqual({
        valid: false,
        error: 'Episode number must be 1, 2, or 3',
      });
    });
  });

  describe('validateVoteSubmission', () => {
    const validData = {
      sessionId: 'ABC123',
      teamId: 'team-1',
      turnId: 'turn-1',
      selectedEpisodeNumber: 2,
      presentingTeamId: 'team-2',
    };

    it('should return valid for proper vote submission', () => {
      expect(validateVoteSubmission(validData)).toEqual({ valid: true });
    });

    it('should return error when sessionId is missing or invalid', () => {
      expect(validateVoteSubmission({ ...validData, sessionId: '' })).toEqual({
        valid: false,
        error: 'Session ID is required',
      });
      expect(
        validateVoteSubmission({ ...validData, sessionId: undefined as unknown as string })
      ).toEqual({
        valid: false,
        error: 'Session ID is required',
      });
    });

    it('should return error when teamId is missing or invalid', () => {
      expect(validateVoteSubmission({ ...validData, teamId: '' })).toEqual({
        valid: false,
        error: 'Team ID is required',
      });
      expect(
        validateVoteSubmission({ ...validData, teamId: undefined as unknown as string })
      ).toEqual({
        valid: false,
        error: 'Team ID is required',
      });
    });

    it('should return error when turnId is missing or invalid', () => {
      expect(validateVoteSubmission({ ...validData, turnId: '' })).toEqual({
        valid: false,
        error: 'Turn ID is required',
      });
      expect(
        validateVoteSubmission({ ...validData, turnId: undefined as unknown as string })
      ).toEqual({
        valid: false,
        error: 'Turn ID is required',
      });
    });

    it('should return error when episode number is invalid', () => {
      expect(validateVoteSubmission({ ...validData, selectedEpisodeNumber: 0 })).toEqual({
        valid: false,
        error: 'Episode number must be 1, 2, or 3',
      });
      expect(validateVoteSubmission({ ...validData, selectedEpisodeNumber: 4 })).toEqual({
        valid: false,
        error: 'Episode number must be 1, 2, or 3',
      });
    });

    it('should return error when voting on own team', () => {
      const sameTeamData = {
        ...validData,
        teamId: 'team-1',
        presentingTeamId: 'team-1',
      };
      expect(validateVoteSubmission(sameTeamData)).toEqual({
        valid: false,
        error: "Cannot vote on your own team's episodes",
      });
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
      expect(sanitizeInput('\n\thello\n\t')).toBe('hello');
    });

    it('should remove < and > characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
        'scriptalert("xss")/script'
      );
      expect(sanitizeInput('Hello <b>world</b>')).toBe('Hello bworld/b');
    });

    it('should limit length to 1000 characters', () => {
      const longInput = 'a'.repeat(1500);
      expect(sanitizeInput(longInput)).toBe('a'.repeat(1000));
    });

    it('should handle combination of all sanitization', () => {
      const input = `  <script>alert("xss")</script>${'a'.repeat(1000)}  `;
      const result = sanitizeInput(input);
      expect(result.length).toBeLessThanOrEqual(1000);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });
  });
});
