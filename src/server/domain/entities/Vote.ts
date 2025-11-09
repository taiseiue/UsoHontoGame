/**
 * Vote entity - Records a team's guess about which episode is the lie
 */
export class Vote {
  constructor(
    public id: string,
    public turnId: string,
    public votingTeamId: string,
    public selectedEpisodeNumber: number,
    public isCorrect: boolean | null,
    public submittedAt: Date = new Date()
  ) {
    this.validate();
  }

  /**
   * Validate vote data
   */
  private validate(): void {
    if (this.selectedEpisodeNumber < 1 || this.selectedEpisodeNumber > 3) {
      throw new Error('Selected episode number must be 1, 2, or 3');
    }
  }

  /**
   * Mark vote as correct or incorrect
   */
  setCorrectness(isCorrect: boolean): void {
    this.isCorrect = isCorrect;
  }
}
