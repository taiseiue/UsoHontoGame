// Type definitions for ResultsPage
// Feature: 006-results-dashboard, User Story 3

import type { RankingDto } from '@/server/application/dto/RankingDto';

export interface ResultsPageProps {
  gameId: string;
  initialData?: RankingDto;
}

export interface ResultsPageData extends RankingDto {
  // Extends RankingDto with any additional UI-specific fields if needed
}
