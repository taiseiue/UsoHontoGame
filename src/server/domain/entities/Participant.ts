import type { ConnectionStatus, ParticipantRole } from '@/types/game';
import type { Episode } from './Episode';

/**
 * Participant entity - Represents an individual user (player or host)
 */
export class Participant {
  constructor(
    public id: string,
    public sessionId: string,
    public nickname: string,
    public role: ParticipantRole,
    public teamId: string | null,
    public connectionStatus: ConnectionStatus,
    public episodes: Episode[],
    public lastSeenTimestamp: Date = new Date()
  ) {}

  /**
   * Update last seen timestamp
   */
  updateLastSeen(): void {
    this.lastSeenTimestamp = new Date();
  }

  /**
   * Update connection status
   */
  setConnectionStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    this.updateLastSeen();
  }

  /**
   * Assign to team
   */
  assignToTeam(teamId: string): void {
    this.teamId = teamId;
  }

  /**
   * Check if participant has registered episodes
   */
  hasRegisteredEpisodes(): boolean {
    return this.episodes.length === 3;
  }

  /**
   * Set episodes (must be exactly 3)
   */
  setEpisodes(episodes: Episode[]): void {
    if (episodes.length !== 3) {
      throw new Error('Participant must have exactly 3 episodes');
    }
    const lieCount = episodes.filter((e) => e.isLie).length;
    if (lieCount !== 1) {
      throw new Error('Exactly one episode must be marked as a lie');
    }
    this.episodes = episodes;
  }
}
