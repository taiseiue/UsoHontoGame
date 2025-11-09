import { ValidationError } from '@/lib/errors';
import { validateNickname } from '@/lib/validators';
import type { CreateSessionRequest } from '@/server/application/dto/requests/CreateSessionRequest';
import type { SessionResponse } from '@/server/application/dto/responses/SessionResponse';
import { generateSessionId } from '@/server/application/services/SessionIdGenerator';
import { GameSession } from '@/server/domain/entities/GameSession';
import { Participant } from '@/server/domain/entities/Participant';
import type { IGameSessionRepository } from '@/server/domain/repositories/IGameSessionRepository';
import type { IParticipantRepository } from '@/server/domain/repositories/IParticipantRepository';
import { ConnectionStatus, ParticipantRole, SessionPhase } from '@/types/game';

/**
 * Use Case: Create a new game session
 * Host initiates a new game and receives a unique session ID
 */
export class CreateSessionUseCase {
  constructor(
    private sessionRepository: IGameSessionRepository,
    private participantRepository: IParticipantRepository
  ) {}

  async execute(request: CreateSessionRequest): Promise<SessionResponse> {
    // Validate host nickname
    const nicknameValidation = validateNickname(request.hostNickname);
    if (!nicknameValidation.valid) {
      throw new ValidationError(nicknameValidation.error || 'Invalid nickname');
    }

    // Generate unique session ID
    const sessionId = generateSessionId();

    // Create host participant
    const hostId = crypto.randomUUID();
    const host = new Participant(
      hostId,
      sessionId,
      request.hostNickname,
      ParticipantRole.HOST,
      null,
      ConnectionStatus.CONNECTED,
      []
    );

    // Create game session
    const now = new Date();
    const scoringRules = request.scoringRules || {
      pointsForCorrectGuess: 10,
      pointsPerDeception: 5,
    };

    const session = new GameSession(
      sessionId,
      now,
      now,
      SessionPhase.PREPARATION,
      hostId,
      null,
      scoringRules,
      [],
      0
    );

    // Save both
    await this.participantRepository.save(host);
    await this.sessionRepository.save(session);

    return {
      sessionId: session.id,
      hostId: session.hostId,
      phase: session.phase,
      createdAt: session.createdAt,
    };
  }
}
