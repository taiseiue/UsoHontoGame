'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useEpisodeForm } from './hooks/useEpisodeForm';

export interface EpisodeRegistrationFormProps {
  participantId: string;
  onSubmit: (episodes: Array<{ episodeNumber: number; text: string; isLie: boolean }>) => void;
  onUpdate?: (episodes: Array<{ episodeNumber: number; text: string; isLie: boolean }>) => void;
  initialEpisodes?: Array<{ episodeNumber: number; text: string; isLie?: boolean }>;
  isLoading?: boolean;
}

/**
 * EpisodeRegistrationForm
 * Form for participants to register 3 episodes (2 truths and 1 lie)
 */
export function EpisodeRegistrationForm({
  participantId: _participantId,
  onSubmit,
  onUpdate,
  initialEpisodes = [],
  isLoading = false,
}: EpisodeRegistrationFormProps) {
  const {
    episode1,
    episode2,
    episode3,
    lieNumber,
    errors,
    setEpisode1,
    setEpisode2,
    setEpisode3,
    setLieNumber,
    handleSubmit,
    isUpdateMode,
  } = useEpisodeForm({
    initialEpisodes,
    onSubmit,
    onUpdate,
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="episode1" className="block text-sm font-medium mb-2">
            エピソード1
          </label>
          <Input
            id="episode1"
            value={episode1}
            onChange={(e) => setEpisode1(e.target.value)}
            placeholder="あなたの体験を入力してください（10文字以上）"
            disabled={isLoading}
            error={errors.episode1}
          />
          {errors.episode1 && <p className="text-red-500 text-sm mt-1">{errors.episode1}</p>}
          <div className="flex items-center mt-2">
            <input
              type="radio"
              id="lie1"
              name="lie"
              checked={lieNumber === 1}
              onChange={() => setLieNumber(1)}
              disabled={isLoading}
              className="mr-2"
            />
            <label htmlFor="lie1" className="text-sm">
              これは嘘です
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="episode2" className="block text-sm font-medium mb-2">
            エピソード2
          </label>
          <Input
            id="episode2"
            value={episode2}
            onChange={(e) => setEpisode2(e.target.value)}
            placeholder="あなたの体験を入力してください（10文字以上）"
            disabled={isLoading}
            error={errors.episode2}
          />
          {errors.episode2 && <p className="text-red-500 text-sm mt-1">{errors.episode2}</p>}
          <div className="flex items-center mt-2">
            <input
              type="radio"
              id="lie2"
              name="lie"
              checked={lieNumber === 2}
              onChange={() => setLieNumber(2)}
              disabled={isLoading}
              className="mr-2"
            />
            <label htmlFor="lie2" className="text-sm">
              これは嘘です
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="episode3" className="block text-sm font-medium mb-2">
            エピソード3
          </label>
          <Input
            id="episode3"
            value={episode3}
            onChange={(e) => setEpisode3(e.target.value)}
            placeholder="あなたの体験を入力してください（10文字以上）"
            disabled={isLoading}
            error={errors.episode3}
          />
          {errors.episode3 && <p className="text-red-500 text-sm mt-1">{errors.episode3}</p>}
          <div className="flex items-center mt-2">
            <input
              type="radio"
              id="lie3"
              name="lie"
              checked={lieNumber === 3}
              onChange={() => setLieNumber(3)}
              disabled={isLoading}
              className="mr-2"
            />
            <label htmlFor="lie3" className="text-sm">
              これは嘘です
            </label>
          </div>
        </div>

        {errors.lie && <p className="text-red-500 text-sm">{errors.lie}</p>}
      </div>

      <Button type="submit" disabled={isLoading} fullWidth>
        {isLoading ? '送信中...' : isUpdateMode ? '更新' : '登録'}
      </Button>
    </form>
  );
}
