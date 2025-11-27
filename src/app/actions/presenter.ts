'use server';

// Presenter Server Actions
// Feature: 002-game-preparation
// Server Actions for managing presenters and episodes

import { revalidatePath } from 'next/cache';
import type { EpisodeWithLieDto } from '@/server/application/dto/EpisodeWithLieDto';
import type { PresenterWithLieDto } from '@/server/application/dto/PresenterWithLieDto';
import { AddEpisode } from '@/server/application/use-cases/games/AddEpisode';
import { AddPresenter } from '@/server/application/use-cases/games/AddPresenter';
import { AddPresenterWithEpisodes } from '@/server/application/use-cases/games/AddPresenterWithEpisodes';
import { RemovePresenter } from '@/server/application/use-cases/games/RemovePresenter';
import {
  AddEpisodeSchema,
  AddPresenterSchema,
  AddPresenterWithEpisodesSchema,
  RemovePresenterSchema,
} from '@/server/domain/schemas/gameSchemas';
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
        _form: ['セッションが見つかりません。ログインし直してください。'],
      },
    };
  }
}

/**
 * Add Presenter Server Action
 * Adds a new presenter to a game
 */
export async function addPresenterAction(
  formData: FormData
): Promise<
  | { success: true; presenter: PresenterWithLieDto }
  | { success: false; errors: Record<string, string[]> }
> {
  try {
    // Parse and validate form data
    const rawData = {
      gameId: formData.get('gameId'),
      nickname: formData.get('nickname'),
    };

    const validationResult = AddPresenterSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // Get session (for future authorization)
    const sessionIdResult = await getSessionIdOrError();
    if (typeof sessionIdResult === 'object' && !sessionIdResult.success) {
      return sessionIdResult;
    }
    const _sessionId = sessionIdResult as string;

    // Execute use case
    const repository = createGameRepository();
    const useCase = new AddPresenter(repository);

    const result = await useCase.execute({
      gameId: validationResult.data.gameId,
      nickname: validationResult.data.nickname,
    });

    // Revalidate the presenter management page
    revalidatePath(`/game/${validationResult.data.gameId}/presenters`);

    return {
      success: true,
      presenter: result.presenter,
    };
  } catch (error) {
    console.error('Failed to add presenter:', error);
    return {
      success: false,
      errors: {
        _form: [error instanceof Error ? error.message : 'プレゼンターの追加に失敗しました'],
      },
    };
  }
}

/**
 * Remove Presenter Server Action
 * Removes a presenter from a game (cascade deletes episodes)
 */
export async function removePresenterAction(
  formData: FormData
): Promise<{ success: true } | { success: false; errors: Record<string, string[]> }> {
  try {
    // Parse and validate form data
    const rawData = {
      gameId: formData.get('gameId'),
      presenterId: formData.get('presenterId'),
    };

    const validationResult = RemovePresenterSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // Get session (for future authorization)
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
    const useCase = new RemovePresenter(repository);

    await useCase.execute({
      presenterId: validationResult.data.presenterId,
    });

    // Revalidate the presenter management page
    revalidatePath(`/game/${validationResult.data.gameId}/presenters`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Failed to remove presenter:', error);
    return {
      success: false,
      errors: {
        _form: [error instanceof Error ? error.message : 'プレゼンターの削除に失敗しました'],
      },
    };
  }
}

/**
 * Add Episode Server Action
 * Adds a new episode to a presenter
 *
 * @deprecated This action is deprecated as of feature 003-presenter-episode-inline.
 * Use addPresenterWithEpisodesAction instead, which allows registering a presenter
 * with all 3 episodes in a single atomic operation.
 * This action remains for backward compatibility only.
 */
export async function addEpisodeAction(
  formData: FormData
): Promise<
  | { success: true; episode: EpisodeWithLieDto }
  | { success: false; errors: Record<string, string[]> }
> {
  try {
    // Parse and validate form data
    const rawData = {
      presenterId: formData.get('presenterId'),
      text: formData.get('text'),
      isLie: formData.get('isLie') === 'true',
    };

    const validationResult = AddEpisodeSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // Get session (for future authorization)
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

    // Get presenter to find gameId for revalidation
    const presenter = await repository.findPresenterById(validationResult.data.presenterId);

    const useCase = new AddEpisode(repository);

    const result = await useCase.execute({
      presenterId: validationResult.data.presenterId,
      text: validationResult.data.text,
      isLie: validationResult.data.isLie,
    });

    // Revalidate the presenter management page if we found the presenter
    if (presenter) {
      revalidatePath(`/game/${presenter.gameId}/presenters`);
    }

    return {
      success: true,
      episode: result.episode,
    };
  } catch (error) {
    console.error('Failed to add episode:', error);
    return {
      success: false,
      errors: {
        _form: [error instanceof Error ? error.message : 'エピソードの追加に失敗しました'],
      },
    };
  }
}

/**
 * Add Presenter With Episodes Server Action (Feature: 003-presenter-episode-inline)
 * Adds a new presenter to a game with 3 episodes in a single atomic operation
 * This replaces the 2-step process of adding presenter then episodes separately
 */
export async function addPresenterWithEpisodesAction(
  formData: FormData
): Promise<
  | { success: true; presenter: PresenterWithLieDto }
  | { success: false; errors: Record<string, string[]> }
> {
  try {
    // Parse and validate form data
    const episodesRaw = [];
    for (let i = 0; i < 3; i += 1) {
      const text = formData.get(`episodes[${i}].text`) || formData.get(`episode${i}Text`);
      const isLieStr = formData.get(`episodes[${i}].isLie`) || formData.get(`episode${i}IsLie`);
      episodesRaw.push({
        text,
        isLie: isLieStr === 'true',
      });
    }

    const rawData = {
      gameId: formData.get('gameId'),
      nickname: formData.get('nickname'),
      episodes: episodesRaw,
    };

    const validationResult = AddPresenterWithEpisodesSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    // Get session (for future authorization)
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
    const useCase = new AddPresenterWithEpisodes(repository);

    const result = await useCase.execute({
      gameId: validationResult.data.gameId,
      nickname: validationResult.data.nickname,
      episodes: validationResult.data.episodes,
    });

    // Revalidate the presenter management page
    revalidatePath(`/game/${validationResult.data.gameId}/presenters`);

    return {
      success: true,
      presenter: result.presenter,
    };
  } catch (error) {
    console.error('Failed to add presenter with episodes:', error);
    return {
      success: false,
      errors: {
        _form: [
          error instanceof Error ? error.message : 'プレゼンターとエピソードの追加に失敗しました',
        ],
      },
    };
  }
}
