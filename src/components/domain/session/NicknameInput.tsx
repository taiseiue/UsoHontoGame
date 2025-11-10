'use client';

// NicknameInput component
// Pure presentational component for nickname input form

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNicknameForm } from './hooks/useNicknameForm';

/**
 * NicknameInput component
 * Client Component that handles user interaction for setting nickname
 * Logic is delegated to useNicknameForm hook (constitution Principle III)
 */
export function NicknameInput() {
  const { nickname, error, isSubmitting, handleChange, handleSubmit } = useNicknameForm();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">ニックネームを設定</h2>

      <p className="mb-6 text-sm text-gray-600">
        ゲームに参加するためにニックネームを設定してください
      </p>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <Input
          type="text"
          label="ニックネーム"
          placeholder="例: 田中太郎"
          value={nickname}
          onChange={(e) => handleChange(e.target.value)}
          error={error ?? undefined}
          disabled={isSubmitting}
          maxLength={50}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? '設定中...' : '設定する'}
        </Button>
      </form>
    </div>
  );
}
