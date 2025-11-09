import type { ScoringRules } from '@/types/game';

export interface CreateSessionRequest {
  hostNickname: string;
  scoringRules?: ScoringRules;
}
