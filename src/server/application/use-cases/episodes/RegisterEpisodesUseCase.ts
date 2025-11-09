import { NotFoundError, ValidationError } from '@/lib/errors';
import { validateEpisodeSet } from '@/lib/validators';
import type { RegisterEpisodesRequest } from '@/server/application/dto/requests/RegisterEpisodesRequest';
import { Episode } from '@/server/domain/entities/Episode';
import type { IParticipantRepository } from '@/server/domain/repositories/IParticipantRepository';

export interface RegisterEpisodesResponse {
  participantId: string;
  episodes: Array<{
    id: string;
    episodeNumber: number;
    text: string;
  }>;
}

/**
 * Use Case: Register 3 episodes for a participant
 * Participant submits 2 truths and 1 lie
 */
export class RegisterEpisodesUseCase {
  constructor(private participantRepository: IParticipantRepository) {}

  async execute(request: RegisterEpisodesRequest): Promise<RegisterEpisodesResponse> {
    // Find participant
    const participant = await this.participantRepository.findById(request.participantId);
    if (!participant) {
      throw new NotFoundError('Participant', request.participantId);
    }

    // Validate episode set
    const validation = validateEpisodeSet(request.episodes);
    if (!validation.valid) {
      throw new ValidationError(validation.error || 'Invalid episodes');
    }

    // Create episode entities
    const episodes = request.episodes.map(
      (ep) =>
        new Episode(
          crypto.randomUUID(),
          request.participantId,
          ep.episodeNumber,
          ep.text.trim(),
          ep.isLie
        )
    );

    // Set episodes on participant
    participant.setEpisodes(episodes);

    // Save participant
    await this.participantRepository.save(participant);

    // Return response without isLie field (keep it server-side only)
    return {
      participantId: request.participantId,
      episodes: episodes.map((ep) => ({
        id: ep.id,
        episodeNumber: ep.episodeNumber,
        text: ep.text,
      })),
    };
  }
}
