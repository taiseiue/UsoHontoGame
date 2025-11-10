// Application constants
// Centralized configuration values for session management

/**
 * Cookie names used for session management
 */
export const COOKIE_NAMES = {
  /** Session ID cookie (HTTP-only, secure) */
  SESSION_ID: 'sessionId',
  /** Nickname cookie (readable by client) */
  NICKNAME: 'nickname',
} as const;

/**
 * Cookie configuration
 */
export const COOKIE_CONFIG = {
  /** Cookie max age in seconds (30 days) */
  MAX_AGE: 30 * 24 * 60 * 60, // 2592000 seconds
  /** Cookie path */
  PATH: '/',
  /** Same-site policy */
  SAME_SITE: 'lax' as const,
} as const;

/**
 * Validation constants
 */
export const VALIDATION = {
  /** Maximum nickname length */
  NICKNAME_MAX_LENGTH: 50,
  /** Minimum nickname length */
  NICKNAME_MIN_LENGTH: 1,
  /** Session ID length (nanoid default) */
  SESSION_ID_LENGTH: 21,
} as const;
