import type { Vote } from '../entities/Vote';

/**
 * Repository interface for Vote operations
 */
export interface IVoteRepository {
  /**
   * Save a vote
   */
  save(vote: Vote): Promise<void>;

  /**
   * Find a vote by ID
   */
  findById(id: string): Promise<Vote | null>;

  /**
   * Find all votes for a turn
   */
  findByTurnId(turnId: string): Promise<Vote[]>;

  /**
   * Check if team has voted on a turn
   */
  hasTeamVoted(turnId: string, teamId: string): Promise<boolean>;

  /**
   * Delete a vote
   */
  delete(id: string): Promise<void>;
}
