// Game Preparation Zod Validation Schemas
// Feature: 002-game-preparation
// All validation schemas with error codes for i18n translation via translateZodError()

import { z } from 'zod';

// Value Object Schemas
export const GameIdSchema = z.string().min(1, {
  message: 'REQUIRED',
});

export const GameStatusSchema = z.enum(['準備中', '出題中', '締切'], {
  message: 'INVALID',
});

// Input Schemas (Server Actions & Forms)
export const CreateGameSchema = z.object({
  name: z.string().max(100, { message: 'GAME_NAME_TOO_LONG' }).nullable().optional(),
  playerLimit: z
    .number()
    .int({ message: 'GAME_PLAYER_LIMIT_NOT_INTEGER' })
    .min(1, { message: 'GAME_PLAYER_LIMIT_TOO_LOW' })
    .max(100, { message: 'GAME_PLAYER_LIMIT_TOO_HIGH' }),
});

export const UpdateGameSchema = z.object({
  gameId: GameIdSchema,
  name: z.string().max(100, { message: 'GAME_NAME_TOO_LONG' }).nullable().optional(),
  playerLimit: z.number().int().min(1).max(100).optional(),
});

export const StartAcceptingSchema = z.object({
  gameId: GameIdSchema,
});

export const DeleteGameSchema = z.object({
  gameId: GameIdSchema,
  confirmed: z.boolean().optional(),
});

// Presenter Schemas
export const AddPresenterSchema = z.object({
  gameId: GameIdSchema,
  nickname: z.string().min(1, { message: 'NICKNAME_EMPTY' }).max(50, {
    message: 'NICKNAME_TOO_LONG',
  }),
});

export const RemovePresenterSchema = z.object({
  gameId: GameIdSchema,
  presenterId: z.string().min(1, { message: 'REQUIRED' }),
});

// Episode Schemas - CRITICAL: 1-1000 characters required (not an assumption)
export const AddEpisodeSchema = z.object({
  presenterId: z.string().min(1, { message: 'REQUIRED' }),
  text: z.string().min(1, { message: 'EPISODE_EMPTY' }).max(1000, {
    message: 'EPISODE_TOO_LONG',
  }),
  isLie: z.boolean(),
});

export const UpdateEpisodeSchema = z
  .object({
    episodeId: z.string().min(1, { message: 'REQUIRED' }),
    text: z.string().min(1).max(1000).optional(),
    isLie: z.boolean().optional(),
  })
  .refine((data) => data.text !== undefined || data.isLie !== undefined, {
    message: 'REQUIRED',
  });

export const RemoveEpisodeSchema = z.object({
  episodeId: z.string().min(1, { message: 'REQUIRED' }),
});

// Inline Episode Registration Schema (Feature: 003-presenter-episode-inline)
export const AddPresenterWithEpisodesSchema = z
  .object({
    gameId: GameIdSchema,
    nickname: z.string().min(1, { message: 'NICKNAME_EMPTY' }).max(50, {
      message: 'NICKNAME_TOO_LONG',
    }),
    episodes: z
      .array(
        z.object({
          text: z
            .string()
            .min(1, { message: 'EPISODE_EMPTY' })
            .max(1000, { message: 'EPISODE_TOO_LONG' }),
          isLie: z.boolean(),
        })
      )
      .length(3, { message: 'EPISODE_COUNT' }),
  })
  .refine((data) => data.episodes.filter((e) => e.isLie).length === 1, {
    message: 'EPISODE_LIE_COUNT',
    path: ['episodes'],
  });

// Type Inference for TypeScript
export type CreateGameInput = z.infer<typeof CreateGameSchema>;
export type UpdateGameInput = z.infer<typeof UpdateGameSchema>;
export type StartAcceptingInput = z.infer<typeof StartAcceptingSchema>;
export type DeleteGameInput = z.infer<typeof DeleteGameSchema>;
export type AddPresenterInput = z.infer<typeof AddPresenterSchema>;
export type RemovePresenterInput = z.infer<typeof RemovePresenterSchema>;
export type AddEpisodeInput = z.infer<typeof AddEpisodeSchema>;
export type UpdateEpisodeInput = z.infer<typeof UpdateEpisodeSchema>;
export type RemoveEpisodeInput = z.infer<typeof RemoveEpisodeSchema>;
export type AddPresenterWithEpisodesInput = z.infer<typeof AddPresenterWithEpisodesSchema>;

// Status Transition Schemas (Feature: 004-status-transition)
export const StartGameSchema = z.object({
  gameId: GameIdSchema,
  sessionId: z.string().min(1, { message: 'REQUIRED' }),
});

export const CloseGameSchema = z.object({
  gameId: GameIdSchema,
  sessionId: z.string().min(1, { message: 'REQUIRED' }),
  confirmed: z.boolean().refine((val) => val === true, {
    message: 'REQUIRED',
  }),
});

export const ValidateTransitionSchema = z.object({
  gameId: GameIdSchema,
  targetStatus: z.enum(['出題中', '締切'], {
    message: 'INVALID',
  }),
});

// Type Inference for Status Transitions
export type StartGameInput = z.infer<typeof StartGameSchema>;
export type CloseGameInput = z.infer<typeof CloseGameSchema>;
export type ValidateTransitionInput = z.infer<typeof ValidateTransitionSchema>;
