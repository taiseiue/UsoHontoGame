import type { Participant } from '@/server/domain/entities/Participant';
import type { IParticipantRepository } from '@/server/domain/repositories/IParticipantRepository';

/**
 * In-memory implementation of ParticipantRepository
 */
export class InMemoryParticipantRepository implements IParticipantRepository {
  private static instance: InMemoryParticipantRepository;
  private participants: Map<string, Participant> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): InMemoryParticipantRepository {
    if (!InMemoryParticipantRepository.instance) {
      InMemoryParticipantRepository.instance = new InMemoryParticipantRepository();
    }
    return InMemoryParticipantRepository.instance;
  }

  async save(participant: Participant): Promise<void> {
    this.participants.set(participant.id, participant);
  }

  async findById(id: string): Promise<Participant | null> {
    return this.participants.get(id) || null;
  }

  async findBySessionId(sessionId: string): Promise<Participant[]> {
    return Array.from(this.participants.values()).filter((p) => p.sessionId === sessionId);
  }

  async findByTeamId(teamId: string): Promise<Participant[]> {
    return Array.from(this.participants.values()).filter((p) => p.teamId === teamId);
  }

  async delete(id: string): Promise<void> {
    this.participants.delete(id);
  }

  async existsNicknameInSession(sessionId: string, nickname: string): Promise<boolean> {
    const participants = await this.findBySessionId(sessionId);
    return participants.some((p) => p.nickname === nickname);
  }

  /**
   * Clear all participants (for testing only)
   */
  clearAll(): void {
    this.participants.clear();
  }
}
