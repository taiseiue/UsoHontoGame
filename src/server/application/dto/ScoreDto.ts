// DTO for score calculation and display (User Story 2)
// Feature: 006-results-dashboard

export interface ScoreDto {
  nickname: string;
  totalScore: number;
  details: ScoreDetailDto[];
}

export interface ScoreDetailDto {
  presenterId: string;
  presenterNickname: string;
  selectedEpisodeId: string;
  selectedEpisodeText: string;
  correctEpisodeId: string; // The lie episode
  wasCorrect: boolean;
  pointsEarned: number; // 10 if correct, 0 if incorrect
}
