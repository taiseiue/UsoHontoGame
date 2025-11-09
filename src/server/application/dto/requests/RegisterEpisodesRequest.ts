export interface RegisterEpisodesRequest {
  participantId: string;
  episodes: {
    episodeNumber: number;
    text: string;
    isLie: boolean;
  }[];
}
