import type { ScoringRules, SessionPhase } from '@/types/game';

/**
 * GameSession entity - Root aggregate representing a game instance
 */
export class GameSession {
  constructor(
    public id: string,
    public createdAt: Date,
    public lastActivityTimestamp: Date,
    public phase: SessionPhase,
    public hostId: string,
    public currentTurnId: string | null,
    public scoringRules: ScoringRules,
    public presentationOrder: string[],
    public currentPresentingTeamIndex: number
  ) {}

  /**
   * Update last activity timestamp
   */
  updateActivity(): void {
    this.lastActivityTimestamp = new Date();
  }

  /**
   * Transition to next phase
   */
  transitionToPhase(phase: SessionPhase): void {
    this.phase = phase;
    this.updateActivity();
  }

  /**
   * Advance to next team in presentation order
   */
  advanceToNextTeam(): void {
    this.currentPresentingTeamIndex += 1;
    this.updateActivity();
  }

  /**
   * Check if all teams have presented
   */
  isAllTeamsCompleted(): boolean {
    return this.currentPresentingTeamIndex >= this.presentationOrder.length;
  }

  /**
   * Get current presenting team ID
   */
  getCurrentPresentingTeamId(): string | null {
    if (this.currentPresentingTeamIndex < this.presentationOrder.length) {
      return this.presentationOrder[this.currentPresentingTeamIndex];
    }
    return null;
  }
}
