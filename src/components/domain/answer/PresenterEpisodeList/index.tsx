/**
 * PresenterEpisodeList Component
 * Feature: 001-lie-detection-answers
 * Renders all presenters with their episode selectors
 */

'use client';

import type { FC } from 'react';
import type { Episode } from '../EpisodeSelector';
import { EpisodeSelector } from '../EpisodeSelector';

export interface Presenter {
  id: string;
  name: string;
  episodes: Episode[];
}

export interface PresenterEpisodeListProps {
  presenters: Presenter[];
  selections: Record<string, string>;
  onSelectEpisode: (presenterId: string, episodeId: string) => void;
  disabled?: boolean;
}

export const PresenterEpisodeList: FC<PresenterEpisodeListProps> = ({
  presenters,
  selections,
  onSelectEpisode,
  disabled = false,
}) => {
  if (presenters.length === 0) {
    return <div className="text-center py-8 text-gray-500">出題者がいません</div>;
  }

  return (
    <ul aria-label="出題者一覧" className="space-y-6">
      {presenters.map((presenter) => (
        <li key={presenter.id}>
          <section aria-label={`${presenter.name}のエピソード`} className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{presenter.name}</h3>
            <EpisodeSelector
              episodes={presenter.episodes}
              selectedEpisodeId={selections[presenter.id] || null}
              onSelect={(episodeId) => onSelectEpisode(presenter.id, episodeId)}
              disabled={disabled}
            />
          </section>
        </li>
      ))}
    </ul>
  );
};
