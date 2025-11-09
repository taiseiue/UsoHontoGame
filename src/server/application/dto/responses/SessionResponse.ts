import type { SessionPhase } from '@/types/game';

export interface SessionResponse {
  sessionId: string;
  hostId: string;
  phase: SessionPhase;
  createdAt: Date;
}
