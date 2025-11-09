/**
 * Team entity - Represents a competing group of participants
 */
export class Team {
  constructor(
    public id: string,
    public sessionId: string,
    public name: string,
    public participantIds: string[],
    public cumulativeScore: number,
    public presentationOrder: number | null
  ) {}

  /**
   * Add points to team score
   */
  addPoints(points: number): void {
    this.cumulativeScore += points;
  }

  /**
   * Check if participant is in this team
   */
  hasParticipant(participantId: string): boolean {
    return this.participantIds.includes(participantId);
  }

  /**
   * Add participant to team
   */
  addParticipant(participantId: string): void {
    if (!this.hasParticipant(participantId)) {
      this.participantIds.push(participantId);
    }
  }

  /**
   * Remove participant from team
   */
  removeParticipant(participantId: string): void {
    this.participantIds = this.participantIds.filter((id) => id !== participantId);
  }
}
