import { beforeEach, describe, expect, it } from 'vitest';
import { RegisterEpisodesUseCase } from '@/server/application/use-cases/episodes/RegisterEpisodesUseCase';
import { Participant } from '@/server/domain/entities/Participant';
import { InMemoryParticipantRepository } from '@/server/infrastructure/repositories/InMemoryParticipantRepository';
import type { ConnectionStatus, ParticipantRole } from '@/types/game';

describe('RegisterEpisodesUseCase', () => {
  let participantRepository: InMemoryParticipantRepository;
  let useCase: RegisterEpisodesUseCase;

  beforeEach(() => {
    participantRepository = InMemoryParticipantRepository.getInstance();
    // Clear repository for test isolation
    participantRepository.clearAll();
    useCase = new RegisterEpisodesUseCase(participantRepository);
  });

  it('should register exactly 3 episodes for participant', async () => {
    // Arrange
    const participant = new Participant(
      'participant-1',
      'session-1',
      'Taro',
      'player' as ParticipantRole,
      null,
      'connected' as ConnectionStatus,
      []
    );
    await participantRepository.save(participant);

    const request = {
      participantId: 'participant-1',
      episodes: [
        { episodeNumber: 1, text: 'I climbed Mount Fuji last summer', isLie: false },
        { episodeNumber: 2, text: 'I have a pet parrot named Charlie', isLie: true },
        { episodeNumber: 3, text: 'I can speak three languages fluently', isLie: false },
      ],
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.episodes).toHaveLength(3);
    expect(result.participantId).toBe('participant-1');
  });

  it('should validate exactly one episode is marked as lie', async () => {
    // Arrange
    const participant = new Participant(
      'participant-1',
      'session-1',
      'Taro',
      'player' as ParticipantRole,
      null,
      'connected' as ConnectionStatus,
      []
    );
    await participantRepository.save(participant);

    const request = {
      participantId: 'participant-1',
      episodes: [
        { episodeNumber: 1, text: 'I climbed Mount Fuji last summer', isLie: true },
        { episodeNumber: 2, text: 'I have a pet parrot named Charlie', isLie: true },
        { episodeNumber: 3, text: 'I can speak three languages fluently', isLie: false },
      ],
    };

    // Act & Assert
    await expect(useCase.execute(request)).rejects.toThrow(
      'Exactly one episode must be marked as a lie'
    );
  });

  it('should validate episode text length (minimum 10 characters)', async () => {
    // Arrange
    const participant = new Participant(
      'participant-1',
      'session-1',
      'Taro',
      'player' as ParticipantRole,
      null,
      'connected' as ConnectionStatus,
      []
    );
    await participantRepository.save(participant);

    const request = {
      participantId: 'participant-1',
      episodes: [
        { episodeNumber: 1, text: 'Short', isLie: false },
        { episodeNumber: 2, text: 'I have a pet parrot named Charlie', isLie: true },
        { episodeNumber: 3, text: 'I can speak three languages fluently', isLie: false },
      ],
    };

    // Act & Assert
    await expect(useCase.execute(request)).rejects.toThrow();
  });

  it('should throw error if participant not found', async () => {
    // Arrange
    const request = {
      participantId: 'non-existent',
      episodes: [
        { episodeNumber: 1, text: 'I climbed Mount Fuji last summer', isLie: false },
        { episodeNumber: 2, text: 'I have a pet parrot named Charlie', isLie: true },
        { episodeNumber: 3, text: 'I can speak three languages fluently', isLie: false },
      ],
    };

    // Act & Assert
    await expect(useCase.execute(request)).rejects.toThrow();
  });
});
