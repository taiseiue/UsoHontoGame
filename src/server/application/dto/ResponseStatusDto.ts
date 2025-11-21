// DTO for response status tracking (User Story 1)
// Feature: 006-results-dashboard

export interface ResponseStatusDto {
  gameId: string;
  gameName: string;
  gameStatus: '準備中' | '出題中' | '締切';
  participants: ParticipantStatusDto[];
  totalParticipants: number;
  submittedCount: number;
  allSubmitted: boolean;
  lastUpdated: Date;
}

export interface ParticipantStatusDto {
  nickname: string;
  hasSubmitted: boolean;
  submittedAt?: Date; // Only present if hasSubmitted is true
}
