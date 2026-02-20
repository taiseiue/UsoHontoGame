'use server';

// Game Server Actions
// Feature: 002-game-preparation, Server Actions リファクタリング - Phase 2
// Server Actions with Zod validation for game management
// Refactored to use GameApplicationService

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { GameDetailDto } from '@/server/application/dto/GameDetailDto';
import type { CreateGameOutput, GameManagementDto } from '@/server/application/dto/GameDto';
import type { RankingDto } from '@/server/application/dto/RankingDto';
import { ServiceContainer } from '@/server/infrastructure/di/ServiceContainer';

/**
 * Server Action: Create new game
 * Parses FormData and delegates to GameApplicationService (validation included)
 * @param formData Form data from GameForm
 * @returns Created game data or validation errors
 */
export async function createGameAction(
  formData: FormData
): Promise<
  { success: true; game: CreateGameOutput } | { success: false; errors: Record<string, string[]> }
> {
  // 1. FormDataパース（型変換のみ）
  const gameName = formData.get('name');
  const rawData = {
    name: gameName === '' ? null : (gameName?.toString() ?? null),
    playerLimit: Number(formData.get('playerLimit')),
  };

  // 2. Application Service呼び出し（バリデーション含む）
  const result = await ServiceContainer.getGameService().createGame(rawData);

  // 3. 成功時のみrevalidatePath
  if (result.success) {
    revalidatePath('/');
    revalidatePath('/games');
    return { success: true, game: result.data };
  }

  return result;
}

/**
 * Server Action: Create game and redirect to game list
 * Convenience wrapper that redirects on success
 * @param formData Form data from GameForm
 */
export async function createGameAndRedirect(formData: FormData): Promise<void> {
  const result = await createGameAction(formData);

  if (result.success) {
    // Redirect to game list or game detail page
    redirect('/');
  }

  // On failure, let the form component handle errors
  // This should not happen as the form will call createGameAction directly
  throw new Error('Game creation failed');
}

/**
 * Server Action: Start accepting responses
 * Transitions game from 準備中 to 出題中
 * @param formData Form data with gameId
 * @returns Success status or validation errors
 */
export async function startAcceptingAction(
  formData: FormData
): Promise<{ success: true } | { success: false; errors: Record<string, string[]> }> {
  // 1. FormDataパース（型変換のみ）
  const rawData = {
    gameId: formData.get('gameId'),
  };

  // 2. Application Service呼び出し（バリデーション含む）
  const result = await ServiceContainer.getGameService().startAcceptingResponses(rawData);

  // 3. 成功時のみrevalidatePath
  if (result.success) {
    const gameId = (rawData.gameId as string) || '';
    revalidatePath('/games');
    revalidatePath(`/games/${gameId}`);
  }

  return result;
}

/**
 * Server Action: Get all games for current creator
 * @returns List of games with management info or errors
 */
export async function getGamesAction(): Promise<
  | { success: true; games: GameManagementDto[] }
  | { success: false; errors: Record<string, string[]> }
> {
  // Application Service呼び出し
  const result = await ServiceContainer.getGameService().getGamesByCreator();

  if (result.success) {
    return { success: true, games: result.data };
  }

  return result;
}

/**
 * Server Action: Get game detail by ID
 * Fetches game details for editing/viewing
 * @param gameId Game ID to fetch
 * @returns Game detail or error
 */
export async function getGameDetailAction(
  gameId: string
): Promise<
  { success: true; game: GameDetailDto } | { success: false; errors: Record<string, string[]> }
> {
  // Application Service呼び出し
  const result = await ServiceContainer.getGameService().getGameDetail(gameId);

  if (result.success) {
    return { success: true, game: result.data };
  }

  return result;
}

/**
 * Server Action: Get game results (rankings)
 * Requires session. Returns rankings for closed games only.
 * @param gameId Game ID
 * @returns Ranking data or error
 */
export async function getResultsAction(
  gameId: string
): Promise<
  { success: true; data: RankingDto } | { success: false; errors: Record<string, string[]> }
> {
  const result = await ServiceContainer.getResultsService().getResults(gameId);
  return result;
}

/**
 * Server Action: Update game settings
 * Updates game settings (player limit) when game is in preparation status
 * @param formData Form data with gameId and playerLimit
 * @returns Updated game detail or validation errors
 */
export async function updateGameAction(
  formData: FormData
): Promise<
  { success: true; game: GameDetailDto } | { success: false; errors: Record<string, string[]> }
> {
  // 1. FormDataパース（型変換のみ）
  const gameName = formData.get('name');
  const rawData = {
    gameId: formData.get('gameId') as string,
    name: gameName === '' ? null : (gameName?.toString() ?? undefined),
    playerLimit: formData.get('playerLimit') ? Number(formData.get('playerLimit')) : undefined,
  };

  // 2. Application Service呼び出し（バリデーション含む）
  const result = await ServiceContainer.getGameService().updateGame(rawData);

  // 3. 成功時のみrevalidatePath
  if (result.success) {
    const gameId = (rawData.gameId as string) || '';
    revalidatePath('/games');
    revalidatePath(`/games/${gameId}`);
    return { success: true, game: result.data };
  }

  return result;
}

/**
 * Server Action: Delete game
 * Deletes a game with authorization check
 * @param formData Form data with gameId
 * @returns Success status or validation errors
 */
export async function deleteGameAction(
  formData: FormData
): Promise<{ success: true } | { success: false; errors: Record<string, string[]> }> {
  // 1. FormDataパース（型変換のみ）
  const rawData = {
    gameId: formData.get('gameId') as string,
  };

  // 2. Application Service呼び出し（バリデーション含む）
  const result = await ServiceContainer.getGameService().deleteGame(rawData);

  // 3. 成功時のみrevalidatePath
  if (result.success) {
    revalidatePath('/');
    revalidatePath('/games');
  }

  return result;
}

/**
 * Server Action: Start Game (Status Transition)
 * Feature: 004-status-transition
 * Validates and transitions game from 準備中 to 出題中 with presenter validation
 * @param formData Form data with gameId
 * @returns Success status or validation errors
 */
export async function startGameAction(
  formData: FormData
): Promise<{ success: true } | { success: false; errors: Record<string, string[]> }> {
  // 1. FormDataパース（型変換のみ）
  const rawData = {
    gameId: formData.get('gameId'),
  };

  // 2. Application Service呼び出し（バリデーション含む）
  const result = await ServiceContainer.getGameService().startGame(rawData);

  // 3. 成功時のみrevalidatePath
  if (result.success) {
    const gameId = (rawData.gameId as string) || '';
    revalidatePath('/games');
    revalidatePath(`/games/${gameId}`);
    revalidatePath(`/games/${gameId}/presenters`);
  }

  return result;
}

/**
 * Server Action: Close Game (Status Transition)
 * Feature: 004-status-transition
 * Validates and transitions game from 出題中 to 締切 with confirmation
 * @param formData Form data with gameId and confirmed
 * @returns Success status or validation errors
 */
export async function closeGameAction(
  formData: FormData
): Promise<{ success: true } | { success: false; errors: Record<string, string[]> }> {
  // 1. FormDataパース（型変換のみ）
  const rawData = {
    gameId: formData.get('gameId'),
    confirmed: formData.get('confirmed') === 'true',
  };

  // 2. Application Service呼び出し（バリデーション含む）
  const result = await ServiceContainer.getGameService().closeGame(rawData);

  // 3. 成功時のみrevalidatePath
  if (result.success) {
    const gameId = (rawData.gameId as string) || '';
    revalidatePath('/games');
    revalidatePath(`/games/${gameId}`);
    revalidatePath(`/games/${gameId}/presenters`);
  }

  return result;
}
