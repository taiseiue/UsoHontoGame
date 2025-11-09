/**
 * Shared validation utilities
 */

/**
 * Validate session ID format
 */
export function validateSessionId(id: string): boolean {
  return /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/.test(id);
}

/**
 * Validate nickname
 */
export function validateNickname(nickname: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = nickname.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Nickname cannot be empty' };
  }
  if (trimmed.length > 30) {
    return { valid: false, error: 'Nickname must be 30 characters or less' };
  }
  return { valid: true };
}

/**
 * Validate episode text
 */
export function validateEpisodeText(text: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = text.trim();
  if (trimmed.length < 10) {
    return { valid: false, error: 'Episode must be at least 10 characters' };
  }
  if (trimmed.length > 500) {
    return { valid: false, error: 'Episode must be 500 characters or less' };
  }
  return { valid: true };
}

/**
 * Validate episode set (must be exactly 3 with exactly 1 lie)
 */
export function validateEpisodeSet(episodes: { text: string; isLie: boolean }[]): {
  valid: boolean;
  error?: string;
} {
  if (episodes.length !== 3) {
    return { valid: false, error: 'Must provide exactly 3 episodes' };
  }

  // Validate each episode text
  for (let i = 0; i < episodes.length; i++) {
    const result = validateEpisodeText(episodes[i].text);
    if (!result.valid) {
      return { valid: false, error: `Episode ${i + 1}: ${result.error}` };
    }
  }

  // Check exactly one lie
  const lieCount = episodes.filter((e) => e.isLie).length;
  if (lieCount !== 1) {
    return { valid: false, error: 'Exactly one episode must be marked as a lie' };
  }

  return { valid: true };
}

/**
 * Validate vote episode number
 */
export function validateVoteEpisodeNumber(episodeNumber: number): {
  valid: boolean;
  error?: string;
} {
  if (!Number.isInteger(episodeNumber)) {
    return { valid: false, error: 'Episode number must be an integer' };
  }
  if (episodeNumber < 1 || episodeNumber > 3) {
    return { valid: false, error: 'Episode number must be 1, 2, or 3' };
  }
  return { valid: true };
}

/**
 * Validate vote submission data
 */
export function validateVoteSubmission(data: {
  sessionId: string;
  teamId: string;
  turnId: string;
  selectedEpisodeNumber: number;
  presentingTeamId?: string;
}): {
  valid: boolean;
  error?: string;
} {
  // Validate session ID
  if (!data.sessionId || typeof data.sessionId !== 'string') {
    return { valid: false, error: 'Session ID is required' };
  }

  // Validate team ID
  if (!data.teamId || typeof data.teamId !== 'string') {
    return { valid: false, error: 'Team ID is required' };
  }

  // Validate turn ID
  if (!data.turnId || typeof data.turnId !== 'string') {
    return { valid: false, error: 'Turn ID is required' };
  }

  // Validate episode number
  const episodeResult = validateVoteEpisodeNumber(data.selectedEpisodeNumber);
  if (!episodeResult.valid) {
    return episodeResult;
  }

  // Prevent voting on own team's presentation
  if (data.presentingTeamId && data.teamId === data.presentingTeamId) {
    return { valid: false, error: "Cannot vote on your own team's episodes" };
  }

  return { valid: true };
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .substring(0, 1000); // Limit length
}
