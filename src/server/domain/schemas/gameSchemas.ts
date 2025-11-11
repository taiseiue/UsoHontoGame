// Game Preparation Zod Validation Schemas
// Feature: 002-game-preparation
// All validation schemas with Japanese error messages for runtime validation at API boundaries

import { z } from "zod";

// Value Object Schemas
export const GameIdSchema = z.string().uuid({
	message: "ゲームIDは有効なUUIDでなければなりません",
});

export const GameStatusSchema = z.enum(["準備中", "出題中", "締切"], {
	message:
		'ステータスは「準備中」「出題中」「締切」のいずれかでなければなりません',
});

// Input Schemas (Server Actions & Forms)
export const CreateGameSchema = z.object({
	playerLimit: z
		.number()
		.int({ message: "プレイヤー数は整数でなければなりません" })
		.min(1, { message: "プレイヤー数は1以上でなければなりません" })
		.max(100, { message: "プレイヤー数は100以下でなければなりません" }),
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
	nickname: z
		.string()
		.min(1, { message: "ニックネームを入力してください" })
		.max(50, {
			message: "ニックネームは50文字以下でなければなりません",
		}),
});

export const RemovePresenterSchema = z.object({
	gameId: GameIdSchema,
	presenterId: z.string().uuid(),
});

// Episode Schemas - CRITICAL: 1-1000 characters required (not an assumption)
export const AddEpisodeSchema = z.object({
	presenterId: z.string().uuid(),
	text: z
		.string()
		.min(1, { message: "エピソードは1文字以上でなければなりません" })
		.max(1000, {
			message: "エピソードは1000文字以下でなければなりません",
		}),
	isLie: z.boolean(),
});

export const UpdateEpisodeSchema = z
	.object({
		episodeId: z.string().uuid(),
		text: z.string().min(1).max(1000).optional(),
		isLie: z.boolean().optional(),
	})
	.refine(
		(data) => data.text !== undefined || data.isLie !== undefined,
		{
			message:
				"テキストまたはウソマーカーのいずれかを更新する必要があります",
		},
	);

export const RemoveEpisodeSchema = z.object({
	episodeId: z.string().uuid(),
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
