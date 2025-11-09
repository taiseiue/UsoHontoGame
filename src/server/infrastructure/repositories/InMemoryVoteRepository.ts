import type { Vote } from '@/server/domain/entities/Vote';
import type { IVoteRepository } from '@/server/domain/repositories/IVoteRepository';

/**
 * In-memory implementation of VoteRepository
 */
export class InMemoryVoteRepository implements IVoteRepository {
  private static instance: InMemoryVoteRepository;
  private votes: Map<string, Vote> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): InMemoryVoteRepository {
    if (!InMemoryVoteRepository.instance) {
      InMemoryVoteRepository.instance = new InMemoryVoteRepository();
    }
    return InMemoryVoteRepository.instance;
  }

  async save(vote: Vote): Promise<void> {
    this.votes.set(vote.id, vote);
  }

  async findById(id: string): Promise<Vote | null> {
    return this.votes.get(id) || null;
  }

  async findByTurnId(turnId: string): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter((v) => v.turnId === turnId);
  }

  async hasTeamVoted(turnId: string, teamId: string): Promise<boolean> {
    const votes = await this.findByTurnId(turnId);
    return votes.some((v) => v.votingTeamId === teamId);
  }

  async delete(id: string): Promise<void> {
    this.votes.delete(id);
  }

  /**
   * Clear all votes (for testing only)
   */
  clearAll(): void {
    this.votes.clear();
  }
}
