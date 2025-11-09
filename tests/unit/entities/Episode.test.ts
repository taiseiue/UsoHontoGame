import { describe, expect, it } from 'vitest';
import { Episode } from '@/server/domain/entities/Episode';

describe('Episode', () => {
  describe('constructor', () => {
    it('should create episode with valid data', () => {
      const episode = new Episode(
        'episode-1',
        'participant-1',
        1,
        'This is a valid episode text',
        false
      );

      expect(episode.id).toBe('episode-1');
      expect(episode.participantId).toBe('participant-1');
      expect(episode.episodeNumber).toBe(1);
      expect(episode.text).toBe('This is a valid episode text');
      expect(episode.isLie).toBe(false);
      expect(episode.createdAt).toBeInstanceOf(Date);
      expect(episode.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error for invalid episode number', () => {
      expect(
        () =>
          new Episode('episode-1', 'participant-1', 0, 'Valid text here', false)
      ).toThrow('Episode number must be 1, 2, or 3');

      expect(
        () =>
          new Episode('episode-1', 'participant-1', 4, 'Valid text here', false)
      ).toThrow('Episode number must be 1, 2, or 3');
    });

    it('should throw error for episode text too short', () => {
      expect(
        () =>
          new Episode('episode-1', 'participant-1', 1, 'Short', false)
      ).toThrow('Episode text must be between 10 and 500 characters');
    });

    it('should throw error for episode text too long', () => {
      const longText = 'a'.repeat(501);
      expect(
        () =>
          new Episode('episode-1', 'participant-1', 1, longText, false)
      ).toThrow('Episode text must be between 10 and 500 characters');
    });
  });

  describe('updateText', () => {
    it('should update text and updatedAt', () => {
      const episode = new Episode(
        'episode-1',
        'participant-1',
        1,
        'Original text that is long enough',
        false
      );

      const originalUpdatedAt = episode.updatedAt;

      // Wait a moment to ensure time difference
      setTimeout(() => {}, 1);

      episode.updateText('New text that is also long enough');

      expect(episode.text).toBe('New text that is also long enough');
      expect(episode.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('should validate new text', () => {
      const episode = new Episode(
        'episode-1',
        'participant-1',
        1,
        'Original text that is long enough',
        false
      );

      expect(() => episode.updateText('Short')).toThrow(
        'Episode text must be between 10 and 500 characters'
      );
    });
  });

  describe('toClientSafe', () => {
    it('should return episode without isLie field', () => {
      const episode = new Episode(
        'episode-1',
        'participant-1',
        1,
        'This is a valid episode text',
        true
      );

      const safe = episode.toClientSafe();

      expect(safe.id).toBe('episode-1');
      expect(safe.participantId).toBe('participant-1');
      expect(safe.episodeNumber).toBe(1);
      expect(safe.text).toBe('This is a valid episode text');
      expect(safe.createdAt).toBeInstanceOf(Date);
      expect(safe.updatedAt).toBeInstanceOf(Date);
      expect('isLie' in safe).toBe(false);
    });

    it('should include bound methods', () => {
      const episode = new Episode(
        'episode-1',
        'participant-1',
        1,
        'This is a valid episode text',
        false
      );

      const safe = episode.toClientSafe();

      expect(typeof safe.updateText).toBe('function');
      expect(typeof safe.toClientSafe).toBe('function');
    });
  });
});
