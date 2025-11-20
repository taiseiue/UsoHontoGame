// Repository Interface: Answer
// Defines data access operations for Answer entity

import type { AnswerEntity } from '../entities/Answer';

export interface IAnswerRepository {
  /**
   * Create or update an answer
   * Uses composite unique constraint (sessionId, gameId) for upsert behavior
   */
  upsert(answer: AnswerEntity): Promise<void>;

  /**
   * Find an answer by session and game
   * Returns null if not found
   */
  findBySessionAndGame(sessionId: string, gameId: string): Promise<AnswerEntity | null>;

  /**
   * Find all answers for a specific game
   */
  findByGameId(gameId: string): Promise<AnswerEntity[]>;

  /**
   * Delete an answer by session and game
   */
  delete(sessionId: string, gameId: string): Promise<void>;

  /**
   * Find all selections for a specific answer
   * Returns array of selections with presenter and episode information
   */
  findSelectionsByAnswer(answerId: string): Promise<
    Array<{
      presenterId: string;
      episodeId: string;
    }>
  >;
}
