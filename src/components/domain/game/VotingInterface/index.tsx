'use client';

import { Button } from '@/components/ui/Button';
import { useVoting } from './hooks/useVoting';

export interface VotingInterfaceProps {
  episodes: Array<{ episodeNumber: number; text: string }>;
  onVoteSubmit: (selectedEpisodeNumber: number) => void;
  isLoading?: boolean;
  hasVoted?: boolean;
}

/**
 * VotingInterface
 * Interface for voting on which episode is the lie
 */
export function VotingInterface({
  episodes,
  onVoteSubmit,
  isLoading = false,
  hasVoted = false,
}: VotingInterfaceProps) {
  const { selectedEpisode, selectEpisode, handleSubmit, canSubmit } = useVoting({
    onVoteSubmit,
  });

  if (hasVoted) {
    return (
      <div className="text-center p-6 bg-green-50 rounded-lg">
        <p className="text-green-700 font-medium">投票完了</p>
        <p className="text-sm text-gray-600 mt-2">他のプレイヤーの投票を待っています...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold mb-2">どのエピソードが嘘だと思いますか?</h3>
        <p className="text-gray-600">1つ選んで投票してください</p>
      </div>

      <div className="space-y-3">
        {episodes.map((episode) => (
          <button
            key={episode.episodeNumber}
            type="button"
            onClick={() => selectEpisode(episode.episodeNumber)}
            disabled={isLoading}
            className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
              selectedEpisode === episode.episodeNumber
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedEpisode === episode.episodeNumber
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedEpisode === episode.episodeNumber && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <div className="font-medium mb-1">エピソード{episode.episodeNumber}</div>
                <div className="text-gray-700">{episode.text}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Button onClick={handleSubmit} disabled={!canSubmit || isLoading} fullWidth variant="primary">
        {isLoading ? '投票中...' : '投票する'}
      </Button>
    </div>
  );
}
