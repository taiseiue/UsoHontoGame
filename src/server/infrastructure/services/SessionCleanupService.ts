import type { IGameSessionRepository } from '@/server/domain/repositories/IGameSessionRepository';
import type { IParticipantRepository } from '@/server/domain/repositories/IParticipantRepository';
import type { ITeamRepository } from '@/server/domain/repositories/ITeamRepository';

/**
 * SessionCleanupService - Removes old sessions and associated data
 *
 * Cleans up:
 * - Sessions older than specified age
 * - Associated participants
 * - Associated teams
 * - SSE connections
 */
export class SessionCleanupService {
  private readonly MAX_SESSION_AGE_MS: number;

  constructor(
    private sessionRepository: IGameSessionRepository,
    private participantRepository: IParticipantRepository,
    private teamRepository: ITeamRepository,
    maxSessionAgeHours = 3
  ) {
    this.MAX_SESSION_AGE_MS = maxSessionAgeHours * 60 * 60 * 1000;
  }

  /**
   * Clean up old sessions and return count of deleted sessions
   */
  async cleanup(): Promise<number> {
    const now = new Date();
    let deletedCount = 0;

    try {
      // Get all sessions
      const allSessions = await this.sessionRepository.findAll();

      for (const session of allSessions) {
        const age = now.getTime() - session.lastActivityTimestamp.getTime();

        // Check if session is too old
        if (age > this.MAX_SESSION_AGE_MS) {
          console.log(
            `[SessionCleanup] Cleaning up session ${session.id} (age: ${Math.round(age / 1000 / 60)} minutes)`
          );

          // Delete associated participants
          const participants =
            await this.participantRepository.findBySessionId(session.id);
          for (const participant of participants) {
            await this.participantRepository.delete(participant.id);
          }

          // Delete associated teams
          const teams = await this.teamRepository.findBySessionId(session.id);
          for (const team of teams) {
            await this.teamRepository.delete(team.id);
          }

          // Delete session
          await this.sessionRepository.delete(session.id);

          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        console.log(
          `[SessionCleanup] Cleaned up ${deletedCount} old session(s)`
        );
      }
    } catch (error) {
      console.error('[SessionCleanup] Error during cleanup:', error);
      throw error;
    }

    return deletedCount;
  }

  /**
   * Start periodic cleanup (runs every hour by default)
   */
  startPeriodicCleanup(intervalHours = 1): NodeJS.Timeout {
    const intervalMs = intervalHours * 60 * 60 * 1000;

    console.log(
      `[SessionCleanup] Starting periodic cleanup (every ${intervalHours} hour(s), max age: ${this.MAX_SESSION_AGE_MS / 1000 / 60 / 60} hours)`
    );

    // Run initial cleanup
    this.cleanup().catch((error) => {
      console.error('[SessionCleanup] Initial cleanup failed:', error);
    });

    // Schedule periodic cleanup
    return setInterval(() => {
      this.cleanup().catch((error) => {
        console.error('[SessionCleanup] Periodic cleanup failed:', error);
      });
    }, intervalMs);
  }
}
