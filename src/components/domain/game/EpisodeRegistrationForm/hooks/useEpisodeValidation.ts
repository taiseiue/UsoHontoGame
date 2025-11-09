/**
 * useEpisodeValidation
 * Custom hook for episode validation logic
 */
export function useEpisodeValidation() {
  /**
   * Validate a single episode text
   */
  const validateEpisode = (text: string, episodeNumber: number): string | null => {
    if (!text.trim()) {
      return `エピソード${episodeNumber}を入力してください`;
    }
    if (text.length < 10) {
      return `エピソード${episodeNumber}は10文字以上である必要があります`;
    }
    if (text.length > 500) {
      return `エピソード${episodeNumber}は500文字以下である必要があります`;
    }
    return null;
  };

  /**
   * Validate all episodes and lie selection
   */
  const validateAllEpisodes = (
    episode1: string,
    episode2: string,
    episode3: string,
    lieNumber: number
  ): { [key: string]: string } => {
    const newErrors: { [key: string]: string } = {};

    const error1 = validateEpisode(episode1, 1);
    const error2 = validateEpisode(episode2, 2);
    const error3 = validateEpisode(episode3, 3);

    if (error1) newErrors.episode1 = error1;
    if (error2) newErrors.episode2 = error2;
    if (error3) newErrors.episode3 = error3;

    // Validate lie selection
    if (lieNumber === 0) {
      newErrors.lie = 'どのエピソードが嘘かを選択してください';
    }

    return newErrors;
  };

  return {
    validateEpisode,
    validateAllEpisodes,
  };
}
