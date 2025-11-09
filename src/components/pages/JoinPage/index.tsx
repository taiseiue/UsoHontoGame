'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useJoinPage } from './hooks/useJoinPage';

export interface JoinPageProps {
  sessionId?: string;
}

/**
 * JoinPage
 * Page for creating a new session or joining an existing one
 */
export function JoinPage({ sessionId }: JoinPageProps) {
  const {
    nickname,
    setNickname,
    joinSessionId,
    setJoinSessionId,
    isLoading,
    error,
    mode,
    setMode,
    handleCreateSession,
    handleJoinSession,
    clearError,
  } = useJoinPage({ sessionId });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2">ウソホントゲーム</h1>
        <p className="text-center text-gray-600 mb-8">2つの本当と1つの嘘を見抜こう!</p>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              mode === 'create'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            新規作成
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              mode === 'join'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            参加
          </button>
        </div>

        {/* Forms */}
        <div className="space-y-4">
          {mode === 'join' && (
            <div>
              <label htmlFor="sessionId" className="block text-sm font-medium mb-2">
                セッションID
              </label>
              <Input
                id="sessionId"
                value={joinSessionId}
                onChange={(e) => {
                  setJoinSessionId(e.target.value.toUpperCase());
                  if (error) clearError();
                }}
                placeholder="ABC123"
                disabled={isLoading}
                maxLength={6}
                error={
                  error && mode === 'join' && !joinSessionId.trim()
                    ? 'セッションIDを入力してください'
                    : undefined
                }
              />
            </div>
          )}

          <div>
            <label htmlFor="nickname" className="block text-sm font-medium mb-2">
              ニックネーム
            </label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                if (error) clearError();
              }}
              placeholder="あなたの名前"
              disabled={isLoading}
              error={error && !nickname.trim() ? 'ニックネームを入力してください' : undefined}
            />
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

          <Button
            onClick={mode === 'create' ? handleCreateSession : handleJoinSession}
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? '処理中...' : mode === 'create' ? 'ゲームを作成' : 'ゲームに参加'}
          </Button>
        </div>

        {mode === 'create' && (
          <p className="text-xs text-gray-500 text-center mt-4">
            ゲームを作成すると、あなたがホストになります
          </p>
        )}
      </div>
    </div>
  );
}
