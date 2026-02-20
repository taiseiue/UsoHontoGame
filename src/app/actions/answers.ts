'use server';

// Answer Submission Server Actions
// Feature: 001-lie-detection-answers, Server Actions リファクタリング - Phase 4
// Server Actions with Zod validation for answer submission
// Refactored to use AnswerApplicationService

import { t } from '@/lib/i18n/server';
import type { GetGameForAnswersResponse } from '@/server/application/use-cases/answers/GetGameForAnswers';
import { AnswerApplicationService } from '@/server/application/services/AnswerApplicationService';
import { SubmitAnswerSchema } from '@/server/domain/schemas/answerSchemas';

// AnswerApplicationService インスタンス（モジュールレベルSingleton）
const answerService = new AnswerApplicationService();

/**
 * Server Action: Get game data for answer submission page
 * @param gameId Game ID to retrieve
 * @returns Game data or error response
 */
export async function getGameForAnswersAction(gameId: string): Promise<GetGameForAnswersResponse> {
  // Application Service呼び出し
  return await answerService.getGameForAnswers(gameId);
}

/**
 * Server Action: Submit answer
 * @param formData Form data containing gameId and selections
 * @returns Success response with answerId or validation errors
 */
export async function submitAnswerAction(
  formData: FormData
): Promise<
  | { success: true; data: { answerId: string; message: string } }
  | { success: false; errors: Record<string, string[]> }
> {
  // 1. FormDataパース
  const gameId = formData.get('gameId') as string;
  const selectionsRaw = formData.get('selections') as string;

  let selections: Record<string, string>;
  try {
    selections = JSON.parse(selectionsRaw);
  } catch {
    return {
      success: false,
      errors: {
        selections: [await t('errors.invalid')],
      },
    };
  }

  // 2. Zodバリデーション
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

  // 3. Application Service呼び出し
  const result = await answerService.submitAnswer({
    gameId: validation.data.gameId,
    selections: validation.data.selections,
  });

  return result;
}
