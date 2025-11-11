"use client";

// PresenterList component
// Feature: 002-game-preparation
// Client Component that displays list of presenters with their episodes

import type { PresenterWithLieDto } from "@/server/application/dto/PresenterWithLieDto";
import { removePresenterAction } from "@/app/actions/presenter";
import { useState } from "react";

export interface PresenterListProps {
	/** List of presenters to display */
	presenters: PresenterWithLieDto[];
	/** Game ID for removing presenters */
	gameId: string;
	/** Callback when presenter is removed */
	onPresenterRemoved?: () => void;
	/** Callback when presenter is selected for adding episodes */
	onPresenterSelected?: (presenterId: string) => void;
}

/**
 * PresenterList component
 * Displays list of presenters with their episodes
 * Shows lie marker (confidential - moderator view only)
 */
export function PresenterList({
	presenters,
	gameId,
	onPresenterRemoved,
	onPresenterSelected,
}: PresenterListProps) {
	const [removingId, setRemovingId] = useState<string | null>(null);

	const handleRemove = async (presenterId: string) => {
		if (!confirm("このプレゼンターを削除しますか？")) {
			return;
		}

		setRemovingId(presenterId);

		const formData = new FormData();
		formData.set("gameId", gameId);
		formData.set("presenterId", presenterId);

		try {
			const result = await removePresenterAction(formData);

			if (result.success) {
				onPresenterRemoved?.();
			} else {
				alert(
					result.errors._form?.[0] || "プレゼンターの削除に失敗しました",
				);
			}
		} catch (error) {
			console.error("Failed to remove presenter:", error);
			alert("プレゼンターの削除に失敗しました");
		} finally {
			setRemovingId(null);
		}
	};

	if (presenters.length === 0) {
		return (
			<div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
				<p className="text-gray-600">
					プレゼンターが登録されていません
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{presenters.map((presenter) => {
				const isComplete = presenter.episodes.length === 3;
				const hasLie = presenter.episodes.some((ep) => ep.isLie);

				return (
					<div
						key={presenter.id}
						className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
					>
						<div className="mb-4 flex items-center justify-between">
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									{presenter.nickname}
								</h3>
								<p className="text-sm text-gray-600">
									エピソード: {presenter.episodes.length}/3
									{isComplete && hasLie ? (
										<span className="ml-2 text-green-600">
											✓ 完了
										</span>
									) : (
										<span className="ml-2 text-yellow-600">
											未完了
										</span>
									)}
								</p>
							</div>

							<div className="flex space-x-2">
								{!isComplete && (
									<button
										type="button"
										onClick={() =>
											onPresenterSelected?.(presenter.id)
										}
										className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
									>
										エピソード追加
									</button>
								)}
								<button
									type="button"
									onClick={() => handleRemove(presenter.id)}
									disabled={removingId === presenter.id}
									className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
								>
									{removingId === presenter.id
										? "削除中..."
										: "削除"}
								</button>
							</div>
						</div>

						{presenter.episodes.length > 0 && (
							<div className="space-y-2">
								{presenter.episodes.map((episode, index) => (
									<div
										key={episode.id}
										className={`rounded-lg border p-3 ${
											episode.isLie
												? "border-red-300 bg-red-50"
												: "border-gray-200 bg-gray-50"
										}`}
									>
										<div className="mb-1 flex items-center justify-between">
											<span className="text-sm font-medium text-gray-700">
												エピソード {index + 1}
											</span>
											{episode.isLie && (
												<span className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
													ウソ
												</span>
											)}
										</div>
										<p className="text-sm text-gray-900">
											{episode.text}
										</p>
									</div>
								))}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
