// Domain Entity: Answer
// Represents a participant's answer submission for a game

import { nanoid } from 'nanoid';

export interface AnswerProps {
  id: string;
  sessionId: string;
  gameId: string;
  nickname: string;
  selections: Map<string, string>; // presenterId -> episodeId
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAnswerProps {
  sessionId: string;
  gameId: string;
  nickname: string;
  selections: Record<string, string>; // Plain object for input
}

export class AnswerEntity {
  private constructor(private readonly props: AnswerProps) {}

  static create(input: CreateAnswerProps): AnswerEntity {
    // Validate nickname length (1-20 characters)
    if (input.nickname.length < 1 || input.nickname.length > 20) {
      throw new Error('Nickname must be between 1 and 20 characters');
    }

    // Validate sessionId is not empty
    if (!input.sessionId || input.sessionId.trim() === '') {
      throw new Error('SessionId cannot be empty');
    }

    // Validate gameId is not empty
    if (!input.gameId || input.gameId.trim() === '') {
      throw new Error('GameId cannot be empty');
    }

    // Validate selections is not empty
    const selectionEntries = Object.entries(input.selections);
    if (selectionEntries.length === 0) {
      throw new Error('Selections cannot be empty');
    }

    // Convert selections object to Map
    const selectionsMap = new Map<string, string>(selectionEntries);

    const now = new Date();

    return new AnswerEntity({
      id: nanoid(),
      sessionId: input.sessionId,
      gameId: input.gameId,
      nickname: input.nickname,
      selections: selectionsMap,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Reconstruct an existing entity from persistence (preserves existing ID and timestamps)
   */
  static reconstruct(props: {
    id: string;
    sessionId: string;
    gameId: string;
    nickname: string;
    selections: Record<string, string>;
    createdAt: Date;
    updatedAt: Date;
  }): AnswerEntity {
    const selectionsMap = new Map<string, string>(Object.entries(props.selections));

    return new AnswerEntity({
      id: props.id,
      sessionId: props.sessionId,
      gameId: props.gameId,
      nickname: props.nickname,
      selections: selectionsMap,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get sessionId(): string {
    return this.props.sessionId;
  }

  get gameId(): string {
    return this.props.gameId;
  }

  get nickname(): string {
    return this.props.nickname;
  }

  get selections(): Map<string, string> {
    return new Map(this.props.selections); // Return copy to prevent external mutation
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON(): {
    id: string;
    sessionId: string;
    gameId: string;
    nickname: string;
    selections: Record<string, string>;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.props.id,
      sessionId: this.props.sessionId,
      gameId: this.props.gameId,
      nickname: this.props.nickname,
      selections: Object.fromEntries(this.props.selections), // Convert Map to plain object
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
