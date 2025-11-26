// DTO for final results and rankings (User Story 3)
// Feature: 006-results-dashboard

export interface RankingDto {
  gameId: string;
  gameName: string;
  rankings: ParticipantRankingDto[];
  totalParticipants: number;
  highestScore: number;
  averageScore: number;
  medianScore: number;
  calculatedAt: Date;
}

export interface ParticipantRankingDto {
  rank: number; // 1-based ranking, ties allowed
  nickname: string;
  totalScore: number;
  isWinner: boolean; // true if rank === 1
  selections: Record<
    string, // presenterId as key
    {
      episodeId: string;
      episodeText: string;
      wasCorrect: boolean;
    }
  >;
}
