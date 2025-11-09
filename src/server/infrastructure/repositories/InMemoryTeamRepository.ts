import type { Team } from '@/server/domain/entities/Team';
import type { ITeamRepository } from '@/server/domain/repositories/ITeamRepository';

/**
 * In-memory implementation of Team Repository
 * Uses Map for storage with singleton pattern
 */
export class InMemoryTeamRepository implements ITeamRepository {
  private static instance: InMemoryTeamRepository;
  private teams: Map<string, Team>;

  private constructor() {
    this.teams = new Map();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): InMemoryTeamRepository {
    if (!InMemoryTeamRepository.instance) {
      InMemoryTeamRepository.instance = new InMemoryTeamRepository();
    }
    return InMemoryTeamRepository.instance;
  }

  async findById(id: string): Promise<Team | null> {
    const team = this.teams.get(id);
    return team || null;
  }

  async findBySessionId(sessionId: string): Promise<Team[]> {
    const teams: Team[] = [];
    for (const team of this.teams.values()) {
      if (team.sessionId === sessionId) {
        teams.push(team);
      }
    }
    return teams;
  }

  async save(team: Team): Promise<void> {
    this.teams.set(team.id, team);
  }

  async delete(id: string): Promise<void> {
    this.teams.delete(id);
  }

  async findByParticipantId(participantId: string): Promise<Team | null> {
    for (const team of this.teams.values()) {
      if (team.hasParticipant(participantId)) {
        return team;
      }
    }
    return null;
  }

  /**
   * Clear all teams (for testing only)
   */
  clearAll(): void {
    this.teams.clear();
  }
}
