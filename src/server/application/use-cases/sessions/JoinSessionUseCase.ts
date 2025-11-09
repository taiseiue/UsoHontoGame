import { ConflictError, NotFoundError, ValidationError } from '@/lib/errors';
import { validateNickname, validateSessionId } from '@/lib/validators';
import { Participant } from '@/server/domain/entities/Participant';
import type { IGameSessionRepository } from '@/server/domain/repositories/IGameSessionRepository';
import type { IParticipantRepository } from '@/server/domain/repositories/IParticipantRepository';
import { ConnectionStatus, ParticipantRole } from '@/types/game';

export interface JoinSessionRequest {
  sessionId: string;
  nickname: string;
}

export interface JoinSessionResponse {
  participantId: string;
  sessionId: string;
  nickname: string;
}

/**
 * Use Case: Join an existing game session
 * Player joins a session using session ID and nickname
 */
export class JoinSessionUseCase {
  constructor(
    private sessionRepository: IGameSessionRepository,
    private participantRepository: IParticipantRepository
  ) {}

  async execute(request: JoinSessionRequest): Promise<JoinSessionResponse> {
    // Validate session ID format
    if (!validateSessionId(request.sessionId)) {
      throw new ValidationError('Invalid session ID format');
    }

    // Validate nickname
    const nicknameValidation = validateNickname(request.nickname);
    if (!nicknameValidation.valid) {
      throw new ValidationError(nicknameValidation.error || 'Invalid nickname');
    }

    // Check session exists
    const session = await this.sessionRepository.findById(request.sessionId);
    if (!session) {
      throw new NotFoundError('Session', request.sessionId);
    }

    // Check nickname is unique in session
    const nicknameExists = await this.participantRepository.existsNicknameInSession(
      request.sessionId,
      request.nickname
    );
    if (nicknameExists) {
      throw new ConflictError('Nickname already taken in this session');
    }

    // Create participant
    const participantId = crypto.randomUUID();
    const participant = new Participant(
      participantId,
      request.sessionId,
      request.nickname,
      ParticipantRole.PLAYER,
      null,
      ConnectionStatus.CONNECTED,
      []
    );

    // Save participant
    await this.participantRepository.save(participant);

    // Update session activity
    session.updateActivity();
    await this.sessionRepository.save(session);

    return {
      participantId,
      sessionId: request.sessionId,
      nickname: request.nickname,
    };
  }
}
