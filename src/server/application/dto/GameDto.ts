// Game Data Transfer Object
// Contract for transferring game data to presentation layer

/**
 * Game DTO for TOP page display
 * Contains only the information needed to show available games
 */
export interface GameDto {
  /** Game ID (UUID) */
  id: string;
  /** Game display name */
  name: string;
  /** Available player slots (calculated: maxPlayers - currentPlayers) */
  availableSlots: number;
}
