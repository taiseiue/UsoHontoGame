// Type definitions for ScoreboardPage
// Feature: 006-results-dashboard, User Story 2

import type { ScoreDto } from '@/server/application/dto/ScoreDto';

export interface ScoreboardPageProps {
  gameId: string;
  initialData?: ScoreboardData;
}

export interface ScoreboardData {
  gameId: string;
  gameName: string;
  scores: ScoreDto[];
  calculatedAt: Date;
}

export interface ScoreCardProps {
  score: ScoreDto;
  rank: number;
}
