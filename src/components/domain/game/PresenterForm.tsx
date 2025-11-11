"use client";

// PresenterForm Component
// Feature: 002-game-preparation
// Form for adding new presenters to games

import { usePresenterForm } from "@/hooks/usePresenterForm";
import type { PresenterWithLieDto } from "@/server/application/dto/PresenterWithLieDto";

export interface PresenterFormProps {
	/** Game ID to add presenter to */
	gameId: string;
	/** Callback when presenter is successfully added */
	onPresenterAdded?: (presenter: PresenterWithLieDto) => void;
}

/**
 * PresenterForm Component
 * Displays form for adding new presenters with nickname input
 * Handles validation, submission, and error display
 */
export function PresenterForm({
	gameId,
	onPresenterAdded,
}: PresenterFormProps) {
	const { handleSubmit, isSubmitting, errors, isSuccess } = usePresenterForm({
		gameId,
		onSuccess: onPresenterAdded,
	});

	return (
		<div className="rounded-lg border border-gray-200 bg-white p-6">
			<h2 className="mb-4 text-lg font-semibold text-gray-900">
				プレゼンターを追加
			</h2>

			{isSuccess && (
				<div
					className="mb-4 rounded-md border border-green-200 bg-green-50 p-4"
					role="alert"
				>
					<p className="text-green-800">
						プレゼンターを追加しました！
					</p>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Nickname Input */}
				<div>
					<label
						htmlFor="nickname"
						className="mb-2 block text-sm font-medium text-gray-700"
					>
						ニックネーム (1-50文字)
					</label>
					<input
						type="text"
						id="nickname"
						name="nickname"
						maxLength={50}
						required
						disabled={isSubmitting || isSuccess}
						className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
						aria-describedby={
							errors.nickname ? "nickname-error" : undefined
						}
						aria-invalid={errors.nickname ? "true" : "false"}
						placeholder="プレゼンターのニックネームを入力"
					/>
					{errors.nickname && (
						<p
							id="nickname-error"
							className="mt-1 text-sm text-red-600"
							role="alert"
						>
							{errors.nickname[0]}
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
					disabled={isSubmitting || isSuccess}
					className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
				>
					{isSubmitting ? "追加中..." : "プレゼンターを追加"}
				</button>
			</form>

			{/* Help Text */}
			<div className="mt-4 text-sm text-gray-600">
				<p>
					プレゼンターを追加後、3つのエピソード（2つのホント、1つのウソ）を登録してください。
				</p>
			</div>
		</div>
	);
}
