// TOP Page Components
// Feature: 001-session-top-page, 005-top-active-games, 008-i18n-support
// Presentational components for the home/landing page

'use client';

import { useState } from 'react';
import { ActiveGamesList } from '@/components/domain/game/ActiveGamesList';
import { NicknameInput } from '@/components/domain/session/NicknameInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { Header } from '@/components/ui/Header';
import { useLanguage } from '@/hooks/useLanguage';
import type { TopPageProps } from './TopPage.types';

/**
 * TopPageNicknameSetup - Component for nickname setup state
 * Displayed when user doesn't have a nickname set
 * Pure presentational component with no business logic
 *
 * Feature 008: Added Header with language switcher, i18n support
 */
export function TopPageNicknameSetup() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center p-4">
        <NicknameInput />
      </div>
    </div>
  );
}

/**
 * TopPage - Main component for logged-in users
 * Displayed when user has nickname set
 * Pure presentational component with no business logic
 *
 * Feature 005: Now displays only active games (出題中 status)
 * Feature 006: Passes currentSessionId for dashboard authorization
 * Feature 008: Added Header with language switcher, full i18n support
 * Shows empty state when no active games available
 *
 * @param props - Component props including nickname, games, and currentSessionId
 */
export function TopPage({ nickname, games, currentSessionId }: TopPageProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = searchQuery.trim()
    ? games.filter((game) => {
        const tokens = searchQuery.trim().split(/\s+/).filter(Boolean);
        const title = (game.title ?? '').toLowerCase();
        return tokens.some((token) => title.includes(token.toLowerCase()));
      })
    : games;

  const hasGames = games && games.length > 0;
  const hasResults = filteredGames.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('session.welcome')}, {nickname}!
            </h1>
          </div>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">{t('game.activeGames')}</h2>
            {hasGames && (
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('game.searchPlaceholder')}
                aria-label={t('game.searchLabel')}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-72"
              />
            )}
          </div>

          {!hasGames ? (
            <EmptyState
              message={t('emptyState.noActiveGames')}
              subMessage={t('emptyState.waitForGames')}
            />
          ) : hasResults ? (
            <ActiveGamesList games={filteredGames} currentSessionId={currentSessionId} />
          ) : (
            <EmptyState
              message={t('emptyState.noSearchResults').replace('{query}', searchQuery)}
              subMessage=""
            />
          )}
        </div>
      </div>
    </div>
  );
}
