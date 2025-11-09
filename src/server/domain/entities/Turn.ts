import type { TurnPhase, TurnPoints } from '@/types/game';
import type { Episode } from './Episode';
import type { Vote } from './Vote';

/**
 * Turn entity - Represents one team's presentation round
 */
export class Turn {
  constructor(
    public id: string,
    public sessionId: string,
    public presentingTeamId: string,
    public presenterParticipantId: string,
    public turnNumber: number,
    public phase: TurnPhase,
    public presentedEpisodes: Episode[],
    public correctEpisodeNumber: number | null,
    public votes: Vote[],
    public timerStartedAt: Date | null,
    public timerDurationMs: number | null,
    public pointsAwarded: TurnPoints | null,
    public startedAt: Date = new Date(),
    public completedAt: Date | null = null
  ) {
    this.validate();
  }

  /**
   * Validate turn data
   */
  private validate(): void {
    if (this.presentedEpisodes.length !== 3) {
      throw new Error('Turn must have exactly 3 presented episodes');
    }
    if (this.correctEpisodeNumber !== null) {
      if (this.correctEpisodeNumber < 1 || this.correctEpisodeNumber > 3) {
        throw new Error('Correct episode number must be 1, 2, or 3');
      }
    }
  }

  /**
   * Transition to next phase
   */
  transitionToPhase(phase: TurnPhase): void {
    this.phase = phase;
  }

  /**
   * Start voting timer
   */
  startTimer(durationMs: number): void {
    this.timerStartedAt = new Date();
    this.timerDurationMs = durationMs;
    this.transitionToPhase('voting' as TurnPhase);
  }

  /**
   * Add a vote to the turn
   */
  addVote(vote: Vote): void {
    // Check if team has already voted
    const existingVote = this.votes.find((v) => v.votingTeamId === vote.votingTeamId);
    if (existingVote) {
      throw new Error('Team has already voted on this turn');
    }
    this.votes.push(vote);
  }

  /**
   * Calculate if timer has expired
   */
  isTimerExpired(): boolean {
    if (!this.timerStartedAt || !this.timerDurationMs) {
      return false;
    }
    const now = new Date();
    const elapsed = now.getTime() - this.timerStartedAt.getTime();
    return elapsed >= this.timerDurationMs;
  }

  /**
   * Get remaining timer milliseconds
   */
  getRemainingMs(): number | null {
    if (!this.timerStartedAt || !this.timerDurationMs) {
      return null;
    }
    const now = new Date();
    const elapsed = now.getTime() - this.timerStartedAt.getTime();
    const remaining = this.timerDurationMs - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Set points awarded for this turn
   */
  setPointsAwarded(points: TurnPoints): void {
    this.pointsAwarded = points;
  }

  /**
   * Complete the turn
   */
  complete(): void {
    this.completedAt = new Date();
    this.transitionToPhase('revealing' as TurnPhase);
  }
}
