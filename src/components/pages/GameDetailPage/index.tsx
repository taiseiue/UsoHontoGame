// Game Detail/Edit Page Component
// Feature: 002-game-preparation, 004-status-transition
// Presentational component for viewing and editing game details

'use client';

import { CloseGameButton } from '@/components/domain/game/CloseGameButton';
import { DeleteGameButton } from '@/components/domain/game/DeleteGameButton';
import { GameForm } from '@/components/domain/game/GameForm';
import { GameStatusBadge } from '@/components/domain/game/GameStatusBadge';
import { StatusTransitionButton } from '@/components/domain/game/StatusTransitionButton';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import type { GameStatusValue } from '@/server/domain/value-objects/GameStatus';
import type { GameDetailPageErrorProps, GameDetailPageProps } from './GameDetailPage.types';
import { useGameStatus } from './hooks/useGameStatus';

/**
 * GameDetailPage - Main component for displaying game details
 * Includes status transition functionality
 *
 * @param props - Component props including game data
 */
export function GameDetailPage({ game, currentSessionId }: GameDetailPageProps) {
  const { toasts, showSuccess, showError, removeToast } = useToast();

  // Status management hook
  const { currentStatus, isLoading } = useGameStatus({
    gameId: game.id,
    initialStatus: game.status as GameStatusValue,
    onSuccess: (newStatus) => {
      const message = newStatus === '出題中' ? 'ゲームを開始しました' : 'ゲームを締切しました';
      showSuccess(message, 'ステータス更新完了');
    },
    onError: (error) => {
      showError(error, 'ステータス更新エラー');
    },
  });

  // Check if game can be edited (only 準備中 status)
  const canEdit = currentStatus === '準備中';

  // Check if current user is the game moderator/creator
  const isModerator = currentSessionId && game.creatorId === currentSessionId;

  return (
    <AccessibilityProvider>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <a
            href="/games"
            className="mb-4 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← ゲーム一覧に戻る
          </a>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ゲーム詳細</h1>
              <p className="mt-2 text-sm text-gray-600">ゲームの設定を確認・管理できます</p>
            </div>
            <div className="flex flex-col items-end space-y-3">
              <GameStatusBadge status={currentStatus} animated={true} />
              {/* Show StatusTransitionButton for 準備中 (to start game) */}
              {currentStatus === '準備中' && (
                <StatusTransitionButton
                  gameId={game.id}
                  currentStatus={currentStatus}
                  onSuccess={(newStatus) => {
                    const message =
                      newStatus === '出題中' ? 'ゲームを開始しました' : 'ゲームを締切しました';
                    showSuccess(message, 'ステータス更新完了');
                  }}
                  onError={(error) => {
                    showError(error, 'ステータス更新エラー');
                  }}
                />
              )}
              {/* Show CloseGameButton for 出題中 (to close game) - only for moderators */}
              {currentStatus === '出題中' && isModerator && (
                <CloseGameButton
                  gameId={game.id}
                  gameStatus={currentStatus as '準備中' | '出題中' | '締切'}
                  onClosed={() => {
                    showSuccess('ゲームを締め切りました', 'ゲーム締切');
                    // Trigger page refresh or state update
                    window.location.reload();
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center space-x-2">
              <svg
                className="h-4 w-4 animate-spin text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-label="読み込み中"
              >
                <title>読み込み中</title>
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-sm font-medium text-blue-800">データを更新中...</p>
            </div>
          </div>
        )}

        {/* Status Warning */}
        {!canEdit && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">ゲームの設定を変更できるのは準備中のみです。</p>
          </div>
        )}

        {/* Game Info Card */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">ゲーム名</dt>
              <dd className="mt-1 text-base text-gray-900">{game.name || game.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">ステータス</dt>
              <dd className="mt-1 flex items-center">
                <GameStatusBadge status={currentStatus} className="mr-2" animated={true} />
                {isLoading && (
                  <div className="flex items-center space-x-1">
                    <svg
                      className="h-3 w-3 animate-spin text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-label="更新中"
                    >
                      <title>更新中</title>
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="text-sm text-gray-500">(更新中...)</span>
                  </div>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">参加者</dt>
              <dd className="mt-1 text-base text-gray-900">
                {game.currentPlayers} / {game.maxPlayers} 人
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">空き枠</dt>
              <dd className="mt-1 text-base text-gray-900">{game.availableSlots} 枠</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">作成日時</dt>
              <dd className="mt-1 text-base text-gray-900">
                {new Date(game.createdAt).toLocaleString('ja-JP')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">更新日時</dt>
              <dd className="mt-1 text-base text-gray-900">
                {new Date(game.updatedAt).toLocaleString('ja-JP')}
              </dd>
            </div>
          </dl>
        </div>

        {/* Presenter Management Section */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">プレゼンター管理</h2>
          <p className="mb-4 text-sm text-gray-600">
            プレゼンターとエピソードを管理します。各プレゼンターに3つのエピソード（2つのホント、1つのウソ）を登録してください。
          </p>
          <a
            href={`/games/${game.id}/presenters`}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            プレゼンター管理ページへ →
          </a>
        </div>

        {/* Edit Form (only shown when status is 準備中) */}
        {canEdit && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">設定を変更</h2>
            <GameForm
              mode="edit"
              gameId={game.id}
              initialPlayerLimit={game.maxPlayers}
              currentPlayers={game.currentPlayers}
            />
          </div>
        )}

        {/* Delete Button Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">危険な操作</h2>
          <p className="mb-4 text-sm text-gray-600">
            ゲームを削除すると、関連するプレゼンターとエピソードもすべて削除されます。この操作は取り消せません。
          </p>
          <DeleteGameButton gameId={game.id} gameStatus={game.status} />
        </div>

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </AccessibilityProvider>
  );
}

/**
 * GameDetailPageError - Error state component
 * Displayed when game fetching fails
 *
 * @param props - Error props including error message
 */
export function GameDetailPageError({ errorMessage }: GameDetailPageErrorProps) {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <h2 className="text-lg font-semibold text-red-900">エラーが発生しました</h2>
        <p className="mt-2 text-sm text-red-800">{errorMessage}</p>
        <a href="/games" className="mt-4 inline-block text-sm font-medium text-red-900 underline">
          ゲーム一覧に戻る
        </a>
      </div>
    </div>
  );
}
