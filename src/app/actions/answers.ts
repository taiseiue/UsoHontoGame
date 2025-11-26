'use server';

// Answer Submission Server Actions
// Feature: 001-lie-detection-answers
// Server Actions with Zod validation for answer submission

import type { GetGameForAnswersResponse } from '@/server/application/use-cases/answers/GetGameForAnswers';
import { GetGameForAnswers } from '@/server/application/use-cases/answers/GetGameForAnswers';
import { SubmitAnswer } from '@/server/application/use-cases/answers/SubmitAnswer';
import { ValidateSession } from '@/server/application/use-cases/session/ValidateSession';
import { SubmitAnswerSchema } from '@/server/domain/schemas/answerSchemas';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';
import {
  createAnswerRepository,
  createGameRepository,
  createParticipationRepository,
} from '@/server/infrastructure/repositories';
import { CookieSessionRepository } from '@/server/infrastructure/repositories/CookieSessionRepository';

// Create session repository instance for session validation
const sessionRepository = new CookieSessionRepository();

/**
 * Server Action: Get game data for answer submission page
 * @param gameId - Game ID to retrieve
 * @returns Game data or error response
 */
export async function getGameForAnswersAction(gameId: string): Promise<GetGameForAnswersResponse> {
  const gameRepository = createGameRepository();
  const useCase = new GetGameForAnswers(gameRepository);

  return await useCase.execute(gameId);
}

/**
 * Server Action: Submit answer
 * @param formData - Form data containing gameId and selections
 * @returns Success response with answerId or validation errors
 */
export async function submitAnswerAction(
  formData: FormData
): Promise<
  | { success: true; data: { answerId: string; message: string } }
  | { success: false; errors: Record<string, string[]> }
> {
  // Get session
  let sessionId: string;
  let nickname: string;

  try {
    const sessionService = SessionServiceContainer.getSessionService();
    sessionId = await sessionService.requireCurrentSession();

    // Use ValidateSession to get session data with nickname
    const validateUseCase = new ValidateSession(sessionRepository);
    const session = await validateUseCase.execute(sessionId);

    // Use nickname if available, otherwise use default name based on sessionId
    nickname = session?.nickname ?? `参加者_${sessionId.slice(0, 8)}`;
  } catch {
    return {
      success: false,
      errors: {
        _form: ['セッションが見つかりません。'],
      },
    };
  }

  // Parse form data
  const gameId = formData.get('gameId') as string;
  const selectionsRaw = formData.get('selections') as string;

  let selections: Record<string, string>;
  try {
    selections = JSON.parse(selectionsRaw);
  } catch {
    return {
      success: false,
      errors: {
        selections: ['回答データの形式が不正です'],
      },
    };
  }

  // Validate input
  const validation = SubmitAnswerSchema.safeParse({
    gameId,
    selections,
  });

  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of validation.error.issues) {
      const path = issue.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path]?.push(issue.message);
    }
    return {
      success: false,
      errors,
    };
  }

  // Execute use case
  const gameRepository = createGameRepository();
  const answerRepository = createAnswerRepository();
  const participationRepository = createParticipationRepository();

  const useCase = new SubmitAnswer(answerRepository, participationRepository, gameRepository);

  const result = await useCase.execute({
    gameId,
    sessionId,
    nickname,
    selections,
  });

  // Convert use case result to server action result
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  // Map error codes to user-friendly messages
  return {
    success: false,
    errors: {
      _form: [result.error.message],
    },
  };
}
