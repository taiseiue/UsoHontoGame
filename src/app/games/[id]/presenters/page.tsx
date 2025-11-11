"use client";

// Presenter Management Page
// Feature: 002-game-preparation
// Page for managing presenters and episodes at /games/[id]/presenters

import { useEffect, useState, use } from "react";
import { PresenterList } from "@/components/domain/game/PresenterList";
import { PresenterForm } from "@/components/domain/game/PresenterForm";
import { EpisodeForm } from "@/components/domain/game/EpisodeForm";
import { getPresenterEpisodesAction } from "@/app/actions/presenter";
import type { PresenterWithLieDto } from "@/server/application/dto/PresenterWithLieDto";

interface PageProps {
	params: Promise<{ id: string }>;
}

/**
 * Presenter Management Page
 * Allows moderators to:
 * - Add presenters to a game
 * - Add episodes to presenters
 * - View all presenters and their episodes
 * - Remove presenters
 */
export default function PresenterManagementPage({ params }: PageProps) {
	const { id: gameId } = use(params);
	const [presenters, setPresenters] = useState<PresenterWithLieDto[]>([]);
	const [selectedPresenterId, setSelectedPresenterId] = useState<
		string | null
	>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadPresenters = async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Load all presenters for this game
			// Note: This is a simplified approach for MVP
			// In production, we'd have a dedicated endpoint to fetch all game presenters
			const mockPresenters: PresenterWithLieDto[] = [];
			setPresenters(mockPresenters);
		} catch (err) {
			console.error("Failed to load presenters:", err);
			setError("プレゼンターの読み込みに失敗しました");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadPresenters();
	}, [gameId]);

	const handlePresenterAdded = (presenter: PresenterWithLieDto) => {
		setPresenters((prev) => [...prev, presenter]);
	};

	const handlePresenterRemoved = () => {
		loadPresenters();
	};

	const handleEpisodeAdded = () => {
		loadPresenters();
		setSelectedPresenterId(null);
	};

	const selectedPresenter = presenters.find(
		(p) => p.id === selectedPresenterId,
	);

	if (isLoading) {
		return (
			<main className="min-h-screen bg-gray-50 py-8">
				<div className="mx-auto max-w-4xl px-4">
					<div className="text-center">
						<p className="text-gray-600">読み込み中...</p>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-gray-50 py-8">
			<div className="mx-auto max-w-4xl px-4">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">
						プレゼンター管理
					</h1>
					<p className="mt-2 text-gray-600">
						プレゼンターを追加し、それぞれに3つのエピソード（2つのホント、1つのウソ）を登録してください。
					</p>
					<a
						href="/top"
						className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700"
					>
						← TOPページに戻る
					</a>
				</div>

				{error && (
					<div
						className="mb-6 rounded-md border border-red-200 bg-red-50 p-4"
						role="alert"
					>
						<p className="text-red-800">{error}</p>
					</div>
				)}

				<div className="grid gap-6 lg:grid-cols-2">
					{/* Left Column: Presenter Form & List */}
					<div className="space-y-6">
						<PresenterForm
							gameId={gameId}
							onPresenterAdded={handlePresenterAdded}
						/>

						<div>
							<h2 className="mb-4 text-xl font-semibold text-gray-900">
								プレゼンター一覧
							</h2>
							<PresenterList
								presenters={presenters}
								gameId={gameId}
								onPresenterRemoved={handlePresenterRemoved}
								onPresenterSelected={setSelectedPresenterId}
							/>
						</div>
					</div>

					{/* Right Column: Episode Form */}
					<div>
						{selectedPresenter ? (
							<EpisodeForm
								presenterId={selectedPresenter.id}
								presenterNickname={selectedPresenter.nickname}
								hasLieEpisode={selectedPresenter.episodes.some(
									(ep) => ep.isLie,
								)}
								currentEpisodeCount={
									selectedPresenter.episodes.length
								}
								onEpisodeAdded={handleEpisodeAdded}
							/>
						) : (
							<div className="rounded-lg border border-gray-200 bg-white p-6">
								<h2 className="mb-4 text-lg font-semibold text-gray-900">
									エピソードを追加
								</h2>
								<div className="rounded-lg bg-gray-50 p-8 text-center">
									<p className="text-gray-600">
										プレゼンターを選択してエピソードを追加してください
									</p>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Summary Section */}
				<div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
					<h2 className="mb-4 text-lg font-semibold text-gray-900">
						登録状況
					</h2>
					<div className="grid gap-4 sm:grid-cols-3">
						<div>
							<p className="text-sm text-gray-600">
								登録済みプレゼンター
							</p>
							<p className="text-2xl font-bold text-gray-900">
								{presenters.length}
								<span className="text-sm font-normal text-gray-600">
									/10
								</span>
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">完了</p>
							<p className="text-2xl font-bold text-green-600">
								{
									presenters.filter(
										(p) =>
											p.episodes.length === 3 &&
											p.episodes.filter((ep) => ep.isLie)
												.length === 1,
									).length
								}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">未完了</p>
							<p className="text-2xl font-bold text-yellow-600">
								{
									presenters.filter(
										(p) =>
											p.episodes.length < 3 ||
											p.episodes.filter((ep) => ep.isLie)
												.length !== 1,
									).length
								}
							</p>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
