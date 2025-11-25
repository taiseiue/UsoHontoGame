// Type definitions for TopPage
// Feature: 001-session-top-page, 005-top-active-games

import type { ActiveGameListItem } from '@/types/game';

/**
 * Props for TopPageNicknameSetup component
 * Displayed when user doesn't have a nickname set
 */
export type TopPageNicknameSetupProps = Record<string, never>;

/**
 * Props for TopPage component
 * Displayed when user has nickname set
 * Updated for 005: Now uses ActiveGameListItem for active games display
 * Updated for 006: Now includes currentSessionId for dashboard authorization
 */
export interface TopPageProps {
  /** User's nickname */
  nickname: string;
  /** List of active games (出題中 status only) */
  games: ActiveGameListItem[];
  /** Current user's session ID (for creator authorization) */
  currentSessionId: string;
}
