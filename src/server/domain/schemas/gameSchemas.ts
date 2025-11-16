// Game Preparation Zod Validation Schemas
// Feature: 002-game-preparation
// All validation schemas with Japanese error messages for runtime validation at API boundaries

import { z } from 'zod';

// Value Object Schemas
export const GameIdSchema = z.string().min(1, {
  message: 'ゲームIDは必須です',
});

export const GameStatusSchema = z.enum(['準備中', '出題中', '締切'], {
  message: 'ステータスは「準備中」「出題中」「締切」のいずれかでなければなりません',
});

// Input Schemas (Server Actions & Forms)
export const CreateGameSchema = z.object({
  name: z
    .string()
    .max(100, { message: 'ゲーム名は100文字以下でなければなりません' })
    .nullable()
    .optional(),
  playerLimit: z
    .number()
    .int({ message: 'プレイヤー数は整数でなければなりません' })
    .min(1, { message: 'プレイヤー数は1以上でなければなりません' })
    .max(100, { message: 'プレイヤー数は100以下でなければなりません' }),
});

export const UpdateGameSchema = z.object({
  gameId: GameIdSchema,
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
  nickname: z.string().min(1, { message: 'ニックネームを入力してください' }).max(50, {
    message: 'ニックネームは50文字以下でなければなりません',
  }),
});

export const RemovePresenterSchema = z.object({
  gameId: GameIdSchema,
  presenterId: z.string().min(1, { message: 'プレゼンターIDが必要です' }),
});

// Episode Schemas - CRITICAL: 1-1000 characters required (not an assumption)
export const AddEpisodeSchema = z.object({
  presenterId: z.string().min(1, { message: 'プレゼンターIDが必要です' }),
  text: z.string().min(1, { message: 'エピソードは1文字以上でなければなりません' }).max(1000, {
    message: 'エピソードは1000文字以下でなければなりません',
  }),
  isLie: z.boolean(),
});

export const UpdateEpisodeSchema = z
  .object({
    episodeId: z.string().min(1, { message: 'エピソードIDが必要です' }),
    text: z.string().min(1).max(1000).optional(),
    isLie: z.boolean().optional(),
  })
  .refine((data) => data.text !== undefined || data.isLie !== undefined, {
    message: 'テキストまたはウソマーカーのいずれかを更新する必要があります',
  });

export const RemoveEpisodeSchema = z.object({
  episodeId: z.string().min(1, { message: 'エピソードIDが必要です' }),
});

// Inline Episode Registration Schema (Feature: 003-presenter-episode-inline)
export const AddPresenterWithEpisodesSchema = z
  .object({
    gameId: GameIdSchema,
    nickname: z.string().min(1, { message: 'ニックネームを入力してください' }).max(50, {
      message: 'ニックネームは50文字以下でなければなりません',
    }),
    episodes: z
      .array(
        z.object({
          text: z
            .string()
            .min(1, { message: 'エピソードを入力してください' })
            .max(1000, { message: 'エピソードは1000文字以下でなければなりません' }),
          isLie: z.boolean(),
        })
      )
      .length(3, { message: '3つのエピソードが必要です' }),
  })
  .refine((data) => data.episodes.filter((e) => e.isLie).length === 1, {
    message: 'ウソのエピソードは1つだけ選択してください',
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
