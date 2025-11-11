"use client";

// EpisodeForm Component
// Feature: 002-game-preparation
// Form for adding episodes to presenters with lie marker

import { useEpisodeForm } from "@/hooks/useEpisodeForm";
import { useState } from "react";
import type { EpisodeWithLieDto } from "@/server/application/dto/EpisodeWithLieDto";

export interface EpisodeFormProps {
	/** Presenter ID to add episode to */
	presenterId: string;
	/** Presenter nickname for context */
	presenterNickname?: string;
	/** Whether presenter already has a lie episode */
	hasLieEpisode?: boolean;
	/** Current episode count */
	currentEpisodeCount?: number;
	/** Callback when episode is successfully added */
	onEpisodeAdded?: (episode: EpisodeWithLieDto) => void;
}

/**
 * EpisodeForm Component
 * Displays form for adding episodes with text input and lie marker checkbox
 * Handles validation, submission, and error display
 * Shows character count and lie marker constraints
 */
export function EpisodeForm({
	presenterId,
	presenterNickname,
	hasLieEpisode = false,
	currentEpisodeCount = 0,
	onEpisodeAdded,
}: EpisodeFormProps) {
	const [text, setText] = useState("");
	const [isLie, setIsLie] = useState(false);

	const { handleSubmit, isSubmitting, errors, isSuccess, reset } =
		useEpisodeForm({
			presenterId,
			onSuccess: (episode) => {
				setText("");
				setIsLie(false);
				onEpisodeAdded?.(episode);
			},
		});

	const remainingEpisodes = 3 - currentEpisodeCount;
	const canAddMore = remainingEpisodes > 0;
	const characterCount = text.length;
	const isOverLimit = characterCount > 1000;

	return (
		<div className="rounded-lg border border-gray-200 bg-white p-6">
			<h2 className="mb-4 text-lg font-semibold text-gray-900">
				エピソードを追加
				{presenterNickname && (
					<span className="ml-2 text-sm font-normal text-gray-600">
						- {presenterNickname}
					</span>
				)}
			</h2>

			{!canAddMore && (
				<div
					className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-4"
					role="alert"
				>
					<p className="text-yellow-800">
						このプレゼンターは既に3つのエピソードが登録されています。
					</p>
				</div>
			)}

			{isSuccess && (
				<div
					className="mb-4 rounded-md border border-green-200 bg-green-50 p-4"
					role="alert"
				>
					<p className="text-green-800">エピソードを追加しました！</p>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Episode Text Input */}
				<div>
					<label
						htmlFor="text"
						className="mb-2 block text-sm font-medium text-gray-700"
					>
						エピソード内容 (1-1000文字)
					</label>
					<textarea
						id="text"
						name="text"
						rows={4}
						maxLength={1000}
						required
						disabled={isSubmitting || isSuccess || !canAddMore}
						value={text}
						onChange={(e) => setText(e.target.value)}
						className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
						aria-describedby={
							errors.text ? "text-error" : "text-help"
						}
						aria-invalid={errors.text ? "true" : "false"}
						placeholder="エピソードの内容を入力してください"
					/>
					<div className="mt-1 flex items-center justify-between">
						<span
							id="text-help"
							className={`text-sm ${
								isOverLimit ? "text-red-600" : "text-gray-500"
							}`}
						>
							{characterCount}/1000文字
						</span>
					</div>
					{errors.text && (
						<p
							id="text-error"
							className="mt-1 text-sm text-red-600"
							role="alert"
						>
							{errors.text[0]}
						</p>
					)}
				</div>

				{/* Lie Marker Checkbox */}
				<div>
					<div className="flex items-center">
						<input
							type="checkbox"
							id="isLie"
							name="isLie"
							value="true"
							disabled={
								isSubmitting ||
								isSuccess ||
								!canAddMore ||
								hasLieEpisode
							}
							checked={isLie}
							onChange={(e) => setIsLie(e.target.checked)}
							className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
							aria-describedby="isLie-help"
						/>
						<label
							htmlFor="isLie"
							className="ml-2 text-sm font-medium text-gray-700"
						>
							これはウソのエピソードです
						</label>
					</div>
					<p id="isLie-help" className="mt-1 text-xs text-gray-500">
						{hasLieEpisode
							? "⚠ このプレゼンターは既にウソのエピソードが登録されています"
							: "各プレゼンターは1つだけウソのエピソードを持つ必要があります"}
					</p>
					{errors.isLie && (
						<p className="mt-1 text-sm text-red-600" role="alert">
							{errors.isLie[0]}
						</p>
					)}
				</div>

				{/* Form-level errors */}
				{errors._form && (
					<div
						className="rounded-md border border-red-200 bg-red-50 p-4"
						role="alert"
					>
						<p className="text-sm text-red-800">{errors._form[0]}</p>
					</div>
				)}

				{/* Submit Button */}
				<button
					type="submit"
					disabled={
						isSubmitting ||
						isSuccess ||
						!canAddMore ||
						isOverLimit ||
						characterCount === 0
					}
					className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
				>
					{isSubmitting ? "追加中..." : "エピソードを追加"}
				</button>
			</form>

			{/* Help Text */}
			<div className="mt-4 text-sm text-gray-600">
				<p>
					残り {remainingEpisodes} つのエピソードを追加できます。
					{!hasLieEpisode &&
						"ウソのエピソードを1つ含める必要があります。"}
				</p>
			</div>
		</div>
	);
}
