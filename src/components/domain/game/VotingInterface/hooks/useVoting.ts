import { useState } from 'react';

export interface UseVotingProps {
  onVoteSubmit: (selectedEpisodeNumber: number) => void;
}

/**
 * useVoting
 * Custom hook for voting logic
 */
export function useVoting({ onVoteSubmit }: UseVotingProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);

  /**
   * Handle vote submission
   */
  const handleSubmit = () => {
    if (selectedEpisode !== null) {
      onVoteSubmit(selectedEpisode);
    }
  };

  /**
   * Select an episode for voting
   */
  const selectEpisode = (episodeNumber: number) => {
    setSelectedEpisode(episodeNumber);
  };

  /**
   * Clear selection
   */
  const clearSelection = () => {
    setSelectedEpisode(null);
  };

  /**
   * Check if vote can be submitted
   */
  const canSubmit = selectedEpisode !== null;

  return {
    selectedEpisode,
    selectEpisode,
    clearSelection,
    handleSubmit,
    canSubmit,
  };
}
