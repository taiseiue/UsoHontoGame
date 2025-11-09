import type { Team } from '../entities/Team';

/**
 * Team Repository Interface
 * Defines operations for team persistence
 */
export interface ITeamRepository {
  /**
   * Find team by ID
   */
  findById(id: string): Promise<Team | null>;

  /**
   * Find all teams in a session
   */
  findBySessionId(sessionId: string): Promise<Team[]>;

  /**
   * Save team (create or update)
   */
  save(team: Team): Promise<void>;

  /**
   * Delete team
   */
  delete(id: string): Promise<void>;

  /**
   * Find team by participant ID
   */
  findByParticipantId(participantId: string): Promise<Team | null>;

  /**
   * Clear all teams (for testing)
   */
  clearAll(): void;
}
