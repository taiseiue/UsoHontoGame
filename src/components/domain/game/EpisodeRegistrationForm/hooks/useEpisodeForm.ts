import { useState } from 'react';
import { useEpisodeValidation } from './useEpisodeValidation';

export interface Episode {
  episodeNumber: number;
  text: string;
  isLie: boolean;
}

export interface UseEpisodeFormProps {
  initialEpisodes?: Array<{ episodeNumber: number; text: string; isLie?: boolean }>;
  onSubmit: (episodes: Episode[]) => void;
  onUpdate?: (episodes: Episode[]) => void;
}

/**
 * useEpisodeForm
 * Custom hook for episode form state and logic
 */
export function useEpisodeForm({ initialEpisodes = [], onSubmit, onUpdate }: UseEpisodeFormProps) {
  const [episode1, setEpisode1] = useState(initialEpisodes[0]?.text || '');
  const [episode2, setEpisode2] = useState(initialEpisodes[1]?.text || '');
  const [episode3, setEpisode3] = useState(initialEpisodes[2]?.text || '');
  const [lieNumber, setLieNumber] = useState<number>(
    initialEpisodes.findIndex((ep) => ep.isLie) + 1 || 0
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { validateAllEpisodes } = useEpisodeValidation();

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all episodes
    const newErrors = validateAllEpisodes(episode1, episode2, episode3, lieNumber);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const episodes: Episode[] = [
      { episodeNumber: 1, text: episode1, isLie: lieNumber === 1 },
      { episodeNumber: 2, text: episode2, isLie: lieNumber === 2 },
      { episodeNumber: 3, text: episode3, isLie: lieNumber === 3 },
    ];

    if (initialEpisodes.length > 0 && onUpdate) {
      onUpdate(episodes);
    } else {
      onSubmit(episodes);
    }
  };

  /**
   * Clear all form errors
   */
  const clearErrors = () => {
    setErrors({});
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setEpisode1(initialEpisodes[0]?.text || '');
    setEpisode2(initialEpisodes[1]?.text || '');
    setEpisode3(initialEpisodes[2]?.text || '');
    setLieNumber(initialEpisodes.findIndex((ep) => ep.isLie) + 1 || 0);
    setErrors({});
  };

  return {
    // Form state
    episode1,
    episode2,
    episode3,
    lieNumber,
    errors,

    // Form setters
    setEpisode1,
    setEpisode2,
    setEpisode3,
    setLieNumber,

    // Form actions
    handleSubmit,
    clearErrors,
    resetForm,

    // Computed values
    isUpdateMode: initialEpisodes.length > 0,
  };
}
