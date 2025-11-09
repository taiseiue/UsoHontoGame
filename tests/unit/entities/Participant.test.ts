import { describe, expect, it } from 'vitest';
import { Participant } from '@/server/domain/entities/Participant';
import { Episode } from '@/server/domain/entities/Episode';
import { ConnectionStatus, ParticipantRole } from '@/types/game';

describe('Participant', () => {
  describe('constructor', () => {
    it('should create participant with valid data', () => {
      const episodes: Episode[] = [];
      const participant = new Participant(
        'participant-1',
        'session-1',
        'John Doe',
        ParticipantRole.PLAYER,
        'team-1',
        ConnectionStatus.CONNECTED,
        episodes
      );

      expect(participant.id).toBe('participant-1');
      expect(participant.sessionId).toBe('session-1');
      expect(participant.nickname).toBe('John Doe');
      expect(participant.role).toBe(ParticipantRole.PLAYER);
      expect(participant.teamId).toBe('team-1');
      expect(participant.connectionStatus).toBe(ConnectionStatus.CONNECTED);
      expect(participant.episodes).toBe(episodes);
      expect(participant.lastSeenTimestamp).toBeInstanceOf(Date);
    });

    it('should create host participant without team', () => {
      const episodes: Episode[] = [];
      const participant = new Participant(
        'participant-1',
        'session-1',
        'Host Name',
        ParticipantRole.HOST,
        null,
        ConnectionStatus.CONNECTED,
        episodes
      );

      expect(participant.role).toBe(ParticipantRole.HOST);
      expect(participant.teamId).toBeNull();
    });

    it('should create participant with custom lastSeenTimestamp', () => {
      const customTimestamp = new Date('2025-01-01');
      const episodes: Episode[] = [];
      const participant = new Participant(
        'participant-1',
        'session-1',
        'Jane Doe',
        ParticipantRole.PLAYER,
        'team-1',
        ConnectionStatus.CONNECTED,
        episodes,
        customTimestamp
      );

      expect(participant.lastSeenTimestamp).toBe(customTimestamp);
    });
  });

  describe('updateLastSeen', () => {
    it('should update lastSeenTimestamp to current time', () => {
      const oldTimestamp = new Date('2025-01-01');
      const episodes: Episode[] = [];
      const participant = new Participant(
        'participant-1',
        'session-1',
        'John Doe',
        ParticipantRole.PLAYER,
        'team-1',
        ConnectionStatus.CONNECTED,
        episodes,
        oldTimestamp
      );

      participant.updateLastSeen();

      expect(participant.lastSeenTimestamp.getTime()).toBeGreaterThan(oldTimestamp.getTime());
    });
  });

  describe('setConnectionStatus', () => {
    it('should update connection status and lastSeenTimestamp', () => {
      const oldTimestamp = new Date('2025-01-01');
      const episodes: Episode[] = [];
      const participant = new Participant(
        'participant-1',
        'session-1',
        'John Doe',
        ParticipantRole.PLAYER,
        'team-1',
        ConnectionStatus.CONNECTED,
        episodes,
        oldTimestamp
      );

      participant.setConnectionStatus(ConnectionStatus.DISCONNECTED);

      expect(participant.connectionStatus).toBe(ConnectionStatus.DISCONNECTED);
      expect(participant.lastSeenTimestamp.getTime()).toBeGreaterThan(oldTimestamp.getTime());
    });

    it('should update from disconnected to connected', () => {
      const episodes: Episode[] = [];
      const participant = new Participant(
        'participant-1',
        'session-1',
        'John Doe',
        ParticipantRole.PLAYER,
        'team-1',
        ConnectionStatus.DISCONNECTED,
        episodes
      );

      participant.setConnectionStatus(ConnectionStatus.CONNECTED);

      expect(participant.connectionStatus).toBe(ConnectionStatus.CONNECTED);
    });
  });

  describe('assignToTeam', () => {
    it('should assign participant to a team', () => {
      const episodes: Episode[] = [];
      const participant = new Participant(
        'participant-1',
        'session-1',
        'John Doe',
        ParticipantRole.PLAYER,
        null,
        ConnectionStatus.CONNECTED,
        episodes
      );

      participant.assignToTeam('team-1');

      expect(participant.teamId).toBe('team-1');
    });

    it('should change team assignment', () => {
      const episodes: Episode[] = [];
      const participant = new Participant(
        'participant-1',
        'session-1',
        'John Doe',
        ParticipantRole.PLAYER,
        'team-1',
        ConnectionStatus.CONNECTED,
        episodes
      );

      participant.assignToTeam('team-2');

      expect(participant.teamId).toBe('team-2');
    });
  });

  describe('hasRegisteredEpisodes', () => {
    it('should return true when participant has exactly 3 episodes', () => {
      const episodes: Episode[] = [
        new Episode('ep-1', 'participant-1', 1, 'First episode text here', false),
        new Episode('ep-2', 'participant-1', 2, 'Second episode text here', false),
        new Episode('ep-3', 'participant-1', 3, 'Third episode text here', true),
      ];
      const participant = new Participant(
        'participant-1',
        'session-1',
        'John Doe',
        ParticipantRole.PLAYER,
        'team-1',
        ConnectionStatus.CONNECTED,
        episodes
      );

      expect(participant.hasRegisteredEpisodes()).toBe(true);
    });

    it('should return false when participant has no episodes', () => {
      const episodes: Episode[] = [];
      const participant = new Participant(
        'participant-1',
        'session-1',
        'John Doe',
        ParticipantRole.PLAYER,
        'team-1',
        ConnectionStatus.CONNECTED,
        episodes
      );

      expect(participant.hasRegisteredEpisodes()).toBe(false);
    });

    it('should return false when participant has only 1 episode', () => {
      const episodes: Episode[] = [
        new Episode('ep-1', 'participant-1', 1, 'First episode text here', false),
      ];
      const participant = new Participant(
        'participant-1',
        'session-1',
        'John Doe',
        ParticipantRole.PLAYER,
        'team-1',
        ConnectionStatus.CONNECTED,
        episodes
      );

      expect(participant.hasRegisteredEpisodes()).toBe(false);
    });

    it('should return false when participant has only 2 episodes', () => {
      const episodes: Episode[] = [
        new Episode('ep-1', 'participant-1', 1, 'First episode text here', false),
        new Episode('ep-2', 'participant-1', 2, 'Second episode text here', false),
      ];
      const participant = new Participant(
        'participant-1',
        'session-1',
        'John Doe',
        ParticipantRole.PLAYER,
        'team-1',
        ConnectionStatus.CONNECTED,
        episodes
      );

      expect(participant.hasRegisteredEpisodes()).toBe(false);
    });
  });

  describe('setEpisodes', () => {
    it('should set episodes when exactly 3 are provided with 1 lie', () => {
      const episodes: Episode[] = [];
      const participant = new Participant(
        'participant-1',
        'session-1',
        'John Doe',
        ParticipantRole.PLAYER,
        'team-1',
        ConnectionStatus.CONNECTED,
        episodes
      );

      const newEpisodes: Episode[] = [
        new Episode('ep-1', 'participant-1', 1, 'First episode text here', false),
        new Episode('ep-2', 'participant-1', 2, 'Second episode text here', true),
        new Episode('ep-3', 'participant-1', 3, 'Third episode text here', false),
      ];

      participant.setEpisodes(newEpisodes);

      expect(participant.episodes).toBe(newEpisodes);
      expect(participant.episodes.length).toBe(3);
    });

    it('should throw error when less than 3 episodes are provided', () => {
      const episodes: Episode[] = [];
      const participant = new Participant(
        'participant-1',
        'session-1',
        'John Doe',
        ParticipantRole.PLAYER,
        'team-1',
        ConnectionStatus.CONNECTED,
        episodes
      );

      const newEpisodes: Episode[] = [
        new Episode('ep-1', 'participant-1', 1, 'First episode text here', false),
        new Episode('ep-2', 'participant-1', 2, 'Second episode text here', true),
      ];

      expect(() => participant.setEpisodes(newEpisodes)).toThrow(
        'Participant must have exactly 3 episodes'
      );
    });

    it('should throw error when more than 3 episodes are provided', () => {
      const episodes: Episode[] = [];
      const participant = new Participant(
        'participant-1',
        'session-1',
        'John Doe',
        ParticipantRole.PLAYER,
        'team-1',
        ConnectionStatus.CONNECTED,
        episodes
      );

      const newEpisodes: Episode[] = [
        new Episode('ep-1', 'participant-1', 1, 'First episode text here', false),
        new Episode('ep-2', 'participant-1', 2, 'Second episode text here', true),
        new Episode('ep-3', 'participant-1', 3, 'Third episode text here', false),
        new Episode('ep-4', 'participant-1', 3, 'Fourth episode text here', false),
      ];

      expect(() => participant.setEpisodes(newEpisodes)).toThrow(
        'Participant must have exactly 3 episodes'
      );
    });

    it('should throw error when no episodes are marked as lies', () => {
      const episodes: Episode[] = [];
      const participant = new Participant(
        'participant-1',
        'session-1',
        'John Doe',
        ParticipantRole.PLAYER,
        'team-1',
        ConnectionStatus.CONNECTED,
        episodes
      );

      const newEpisodes: Episode[] = [
        new Episode('ep-1', 'participant-1', 1, 'First episode text here', false),
        new Episode('ep-2', 'participant-1', 2, 'Second episode text here', false),
        new Episode('ep-3', 'participant-1', 3, 'Third episode text here', false),
      ];

      expect(() => participant.setEpisodes(newEpisodes)).toThrow(
        'Exactly one episode must be marked as a lie'
      );
    });

    it('should throw error when more than one episode is marked as a lie', () => {
      const episodes: Episode[] = [];
      const participant = new Participant(
        'participant-1',
        'session-1',
        'John Doe',
        ParticipantRole.PLAYER,
        'team-1',
        ConnectionStatus.CONNECTED,
        episodes
      );

      const newEpisodes: Episode[] = [
        new Episode('ep-1', 'participant-1', 1, 'First episode text here', true),
        new Episode('ep-2', 'participant-1', 2, 'Second episode text here', true),
        new Episode('ep-3', 'participant-1', 3, 'Third episode text here', false),
      ];

      expect(() => participant.setEpisodes(newEpisodes)).toThrow(
        'Exactly one episode must be marked as a lie'
      );
    });

    it('should throw error when all three episodes are marked as lies', () => {
      const episodes: Episode[] = [];
      const participant = new Participant(
        'participant-1',
        'session-1',
        'John Doe',
        ParticipantRole.PLAYER,
        'team-1',
        ConnectionStatus.CONNECTED,
        episodes
      );

      const newEpisodes: Episode[] = [
        new Episode('ep-1', 'participant-1', 1, 'First episode text here', true),
        new Episode('ep-2', 'participant-1', 2, 'Second episode text here', true),
        new Episode('ep-3', 'participant-1', 3, 'Third episode text here', true),
      ];

      expect(() => participant.setEpisodes(newEpisodes)).toThrow(
        'Exactly one episode must be marked as a lie'
      );
    });
  });
});
