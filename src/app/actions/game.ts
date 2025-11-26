'use server';

// Game Server Actions
// Feature: 002-game-preparation
// Server Actions with Zod validation for game management

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { GameDetailDto } from '@/server/application/dto/GameDetailDto';
import type { CreateGameOutput, GameManagementDto } from '@/server/application/dto/GameDto';
import { CloseGame } from '@/server/application/use-cases/games/CloseGame';
import { CreateGame } from '@/server/application/use-cases/games/CreateGame';
import { DeleteGame } from '@/server/application/use-cases/games/DeleteGame';
import { GetGamesByCreator } from '@/server/application/use-cases/games/GetGamesByCreator';
import { StartAcceptingResponses } from '@/server/application/use-cases/games/StartAcceptingResponses';
import { UpdateGameSettings } from '@/server/application/use-cases/games/UpdateGameSettings';
import { ValidateStatusTransition } from '@/server/application/use-cases/games/ValidateStatusTransition';
import {
  CloseGameSchema,
  CreateGameSchema,
  DeleteGameSchema,
  StartAcceptingSchema,
  StartGameSchema,
  UpdateGameSchema,
} from '@/server/domain/schemas/gameSchemas';
import { GameId } from '@/server/domain/value-objects/GameId';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';
import { createGameRepository } from '@/server/infrastructure/repositories';

/**
 * Helper function to get session ID with consistent error handling
 */
async function getSessionIdOrError(): Promise<
  string | { success: false; errors: Record<string, string[]> }
> {
  try {
    const sessionService = SessionServiceContainer.getSessionService();
    return await sessionService.requireCurrentSession();
  } catch {
    return {
      success: false,
      errors: {
        _form: ['セッションが見つかりません。ニックネームを設定してください。'],
      },
    };
  }
}

/**
 * Server Action: Create new game
 * Validates input with Zod, creates game via CreateGame use case
 * @param formData Form data from GameForm
 * @returns Created game data or validation errors
 */
export async function createGameAction(
  formData: FormData
): Promise<
  { success: true; game: CreateGameOutput } | { success: false; errors: Record<string, string[]> }
> {
  try {
    // Extract and parse form data
    const gameName = formData.get('name');
    const rawData = {
      name: gameName === '' ? null : (gameName?.toString() ?? null),
      playerLimit: Number(formData.get('playerLimit')),
    };

    // Validate with Zod schema
    const validationResult = CreateGameSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // Get session ID (moderator/creator ID)
    const sessionIdResult = await getSessionIdOrError();
    if (typeof sessionIdResult === 'object' && !sessionIdResult.success) {
      return sessionIdResult;
    }
    const sessionId = sessionIdResult as string;

    // Execute CreateGame use case
    const repository = createGameRepository();
    const useCase = new CreateGame(repository);

    const game = await useCase.execute({
      creatorId: sessionId,
      name: validationResult.data.name,
      playerLimit: validationResult.data.playerLimit,
    });

    // Revalidate paths for cache management
    revalidatePath('/');
    revalidatePath('/games');

    return {
      success: true,
      game,
    };
  } catch (error) {
    console.error('Failed to create game:', error);
    return {
      success: false,
      errors: {
        _form: [error instanceof Error ? error.message : 'ゲームの作成に失敗しました'],
      },
    };
  }
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
  try {
    // Extract and validate form data
    const rawData = {
      gameId: formData.get('gameId'),
    };

    const validationResult = StartAcceptingSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // Get session ID (for authorization)
    const sessionIdResult = await getSessionIdOrError();
    if (typeof sessionIdResult === 'object' && !sessionIdResult.success) {
      return {
        success: false,
        errors: {
          _form: ['セッションが見つかりません。ログインし直してください。'],
        },
      };
    }
    const _sessionId = sessionIdResult as string;

    // Execute use case
    const repository = createGameRepository();
    const useCase = new StartAcceptingResponses(repository);

    await useCase.execute({
      gameId: validationResult.data.gameId,
    });

    // Revalidate paths for cache management
    revalidatePath('/games');
    revalidatePath(`/games/${validationResult.data.gameId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to start accepting responses:', error);
    return {
      success: false,
      errors: {
        _form: [error instanceof Error ? error.message : 'ステータスの変更に失敗しました'],
      },
    };
  }
}

/**
 * Server Action: Get all games for current creator
 * @returns List of games with management info or errors
 */
export async function getGamesAction(): Promise<
  | { success: true; games: GameManagementDto[] }
  | { success: false; errors: Record<string, string[]> }
> {
  try {
    // Get session ID (creator ID)
    const sessionIdResult = await getSessionIdOrError();
    if (typeof sessionIdResult === 'object' && !sessionIdResult.success) {
      return {
        success: false,
        errors: {
          _form: ['セッションが見つかりません。ログインし直してください。'],
        },
      };
    }
    const sessionId = sessionIdResult as string;

    // Execute use case
    const repository = createGameRepository();
    const useCase = new GetGamesByCreator(repository);

    const result = await useCase.execute({
      creatorId: sessionId,
    });

    return {
      success: true,
      games: result.games,
    };
  } catch (error) {
    console.error('Failed to get games:', error);
    return {
      success: false,
      errors: {
        _form: [error instanceof Error ? error.message : 'ゲーム一覧の取得に失敗しました'],
      },
    };
  }
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
  try {
    // Get session ID (for authorization)
    const sessionIdResult = await getSessionIdOrError();
    if (typeof sessionIdResult === 'object' && !sessionIdResult.success) {
      return {
        success: false,
        errors: {
          _form: ['セッションが見つかりません。ログインし直してください。'],
        },
      };
    }
    const sessionId = sessionIdResult as string;

    // Get game from repository
    const repository = createGameRepository();
    const game = await repository.findById(new GameId(gameId));

    if (!game) {
      return {
        success: false,
        errors: {
          _form: ['ゲームが見つかりません'],
        },
      };
    }

    // Check authorization - only creator can view/edit
    if (game.creatorId !== sessionId) {
      return {
        success: false,
        errors: {
          _form: ['このゲームの編集権限がありません'],
        },
      };
    }

    // Map to DTO
    const gameDetailDto: GameDetailDto = {
      id: game.id.toString(),
      name: game.name,
      status: game.status.toString(),
      maxPlayers: game.maxPlayers,
      currentPlayers: game.currentPlayers,
      availableSlots: game.availableSlots,
      creatorId: game.creatorId,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    };

    return {
      success: true,
      game: gameDetailDto,
    };
  } catch (error) {
    console.error('Failed to get game detail:', error);
    return {
      success: false,
      errors: {
        _form: [error instanceof Error ? error.message : 'ゲームの取得に失敗しました'],
      },
    };
  }
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
  try {
    // Extract and parse form data
    const rawData = {
      gameId: formData.get('gameId') as string,
      playerLimit: formData.get('playerLimit') ? Number(formData.get('playerLimit')) : undefined,
    };

    // Validate with Zod schema
    const validationResult = UpdateGameSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // Get session ID (for authorization)
    const sessionIdResult = await getSessionIdOrError();
    if (typeof sessionIdResult === 'object' && !sessionIdResult.success) {
      return {
        success: false,
        errors: {
          _form: ['セッションが見つかりません。ログインし直してください。'],
        },
      };
    }
    const sessionId = sessionIdResult as string;

    // Execute UpdateGameSettings use case
    const repository = createGameRepository();
    const useCase = new UpdateGameSettings(repository);

    const result = await useCase.execute({
      gameId: validationResult.data.gameId,
      playerLimit: validationResult.data.playerLimit,
      requesterId: sessionId,
    });

    if (!result.game) {
      return {
        success: false,
        errors: {
          _form: ['ゲームの更新に失敗しました'],
        },
      };
    }

    // Revalidate paths for cache management
    revalidatePath('/games');
    revalidatePath(`/games/${validationResult.data.gameId}`);

    return {
      success: true,
      game: result.game,
    };
  } catch (error) {
    console.error('Failed to update game:', error);
    return {
      success: false,
      errors: {
        _form: [error instanceof Error ? error.message : 'ゲームの更新に失敗しました'],
      },
    };
  }
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
  try {
    // Extract and validate form data
    const rawData = {
      gameId: formData.get('gameId') as string,
    };

    const validationResult = DeleteGameSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // Get session ID (for authorization)
    const sessionIdResult = await getSessionIdOrError();
    if (typeof sessionIdResult === 'object' && !sessionIdResult.success) {
      return {
        success: false,
        errors: {
          _form: ['セッションが見つかりません。ログインし直してください。'],
        },
      };
    }
    const sessionId = sessionIdResult as string;

    // Execute DeleteGame use case
    const repository = createGameRepository();
    const useCase = new DeleteGame(repository);

    await useCase.execute({
      gameId: validationResult.data.gameId,
      requesterId: sessionId,
    });

    // Revalidate paths for cache management
    revalidatePath('/');
    revalidatePath('/games');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete game:', error);
    return {
      success: false,
      errors: {
        _form: [error instanceof Error ? error.message : 'ゲームの削除に失敗しました'],
      },
    };
  }
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
  try {
    // Extract and validate form data
    const rawData = {
      gameId: formData.get('gameId'),
      sessionId: '', // Will be filled below
    };

    // Get session ID
    const sessionIdResult = await getSessionIdOrError();
    if (typeof sessionIdResult === 'object' && !sessionIdResult.success) {
      return sessionIdResult;
    }
    rawData.sessionId = sessionIdResult as string;

    const validationResult = StartGameSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // Validate status transition first
    const repository = createGameRepository();
    const validateUseCase = new ValidateStatusTransition(repository);

    const validationResponse = await validateUseCase.execute(
      validationResult.data.gameId,
      '出題中',
      validationResult.data.sessionId
    );

    if (!validationResponse.canTransition) {
      return {
        success: false,
        errors: {
          _form: validationResponse.errors.map((err) => err.message),
        },
      };
    }

    // Execute the status transition
    const startUseCase = new StartAcceptingResponses(repository);
    await startUseCase.execute({
      gameId: validationResult.data.gameId,
    });

    // Revalidate paths for cache management
    revalidatePath('/games');
    revalidatePath(`/games/${validationResult.data.gameId}`);
    revalidatePath(`/games/${validationResult.data.gameId}/presenters`);

    return { success: true };
  } catch (error) {
    console.error('Failed to start game:', error);
    return {
      success: false,
      errors: {
        _form: [error instanceof Error ? error.message : 'ゲームの開始に失敗しました'],
      },
    };
  }
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
  try {
    // Extract and validate form data
    const rawData = {
      gameId: formData.get('gameId'),
      sessionId: '', // Will be filled below
      confirmed: formData.get('confirmed') === 'true',
    };

    // Get session ID
    const sessionIdResult = await getSessionIdOrError();
    if (typeof sessionIdResult === 'object' && !sessionIdResult.success) {
      return sessionIdResult;
    }
    rawData.sessionId = sessionIdResult as string;

    const validationResult = CloseGameSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // Validate status transition first
    const repository = createGameRepository();
    const validateUseCase = new ValidateStatusTransition(repository);

    const validationResponse = await validateUseCase.execute(
      validationResult.data.gameId,
      '締切',
      validationResult.data.sessionId
    );

    if (!validationResponse.canTransition) {
      return {
        success: false,
        errors: {
          _form: validationResponse.errors.map((err) => err.message),
        },
      };
    }

    // Execute the status transition
    const closeUseCase = new CloseGame(repository);
    await closeUseCase.execute({
      gameId: validationResult.data.gameId,
      sessionId: validationResult.data.sessionId,
    });

    // Revalidate paths for cache management
    revalidatePath('/games');
    revalidatePath(`/games/${validationResult.data.gameId}`);
    revalidatePath(`/games/${validationResult.data.gameId}/presenters`);

    return { success: true };
  } catch (error) {
    console.error('Failed to close game:', error);
    return {
      success: false,
      errors: {
        _form: [error instanceof Error ? error.message : 'ゲームの締切に失敗しました'],
      },
    };
  }
}

/**
 * Server Action: Get active games for TOP page
 * Feature: 005-top-active-games
 *
 * Fetches games with "出題中" status for display on the TOP page
 * No authentication required - public access
 */
export async function getActiveGamesAction(params?: { cursor?: string; limit?: number }) {
  try {
    const { GetActiveGames } = await import('@/server/application/use-cases/games/GetActiveGames');
    const repository = createGameRepository();
    const useCase = new GetActiveGames(repository);

    const result = await useCase.execute(params || {});

    return {
      success: true as const,
      ...result,
    };
  } catch (error) {
    console.error('Failed to fetch active games:', error);
    return {
      success: false as const,
      error: 'FETCH_FAILED',
      message: error instanceof Error ? error.message : 'アクティブなゲームの取得に失敗しました',
    };
  }
}
