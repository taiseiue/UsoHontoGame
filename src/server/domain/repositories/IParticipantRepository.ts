import type { Participant } from '../entities/Participant';

/**
 * Repository interface for Participant operations
 */
export interface IParticipantRepository {
  /**
   * Save a participant
   */
  save(participant: Participant): Promise<void>;

  /**
   * Find a participant by ID
   */
  findById(id: string): Promise<Participant | null>;

  /**
   * Find all participants in a session
   */
  findBySessionId(sessionId: string): Promise<Participant[]>;

  /**
   * Find participants by team ID
   */
  findByTeamId(teamId: string): Promise<Participant[]>;

  /**
   * Delete a participant
   */
  delete(id: string): Promise<void>;

  /**
   * Check if nickname exists in session
   */
  existsNicknameInSession(sessionId: string, nickname: string): Promise<boolean>;
}
