/**
 * Episode entity - One of three statements made by a participant
 */
export class Episode {
  constructor(
    public id: string,
    public participantId: string,
    public episodeNumber: number,
    public text: string,
    public isLie: boolean,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    this.validate();
  }

  /**
   * Validate episode data
   */
  private validate(): void {
    if (this.episodeNumber < 1 || this.episodeNumber > 3) {
      throw new Error('Episode number must be 1, 2, or 3');
    }
    const trimmedText = this.text.trim();
    if (trimmedText.length < 10 || trimmedText.length > 500) {
      throw new Error('Episode text must be between 10 and 500 characters');
    }
  }

  /**
   * Update episode text
   */
  updateText(newText: string): void {
    this.text = newText;
    this.updatedAt = new Date();
    this.validate();
  }

  /**
   * Create a sanitized copy without the isLie field for client exposure
   */
  toClientSafe(): Omit<Episode, 'isLie'> {
    return {
      id: this.id,
      participantId: this.participantId,
      episodeNumber: this.episodeNumber,
      text: this.text,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      updateText: this.updateText.bind(this),
      toClientSafe: this.toClientSafe.bind(this),
    };
  }
}
