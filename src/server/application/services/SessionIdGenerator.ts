import { customAlphabet } from 'nanoid';

/**
 * Session ID generator using nanoid with custom alphabet
 * Generates 6-character session codes excluding ambiguous characters
 */

// Exclude ambiguous characters: 0, O, 1, I, L
const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Generate a unique 6-character session ID
 */
export const generateSessionId = customAlphabet(alphabet, 6);
