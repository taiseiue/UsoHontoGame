// GameDetailDto
// Feature: 002-game-preparation
// Detailed game information for editing/viewing

/**
 * Game Detail DTO
 * Complete game information for detail/edit views
 * Includes all fields needed for updating game settings
 */
export interface GameDetailDto {
  /** Game ID (UUID) */
  id: string;
  /** Game display name (nullable, defaults to UUID display) */
  name: string | null;
  /** Game status (準備中 | 出題中 | 締切) */
  status: string;
  /** Maximum number of players */
  maxPlayers: number;
  /** Current number of players */
  currentPlayers: number;
  /** Available slots (calculated) */
  availableSlots: number;
  /** Creator/moderator session ID */
  creatorId: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * UpdateGameSettings Input DTO
 * Data for updating game settings
 */
export interface UpdateGameSettingsInput {
  /** Game ID to update */
  gameId: string;
  /** New game name (optional, max 100 chars, nullable) */
  name?: string | null;
  /** New player limit (1-100) */
  playerLimit?: number;
  /** Session ID of the requester (for authorization) */
  requesterId: string;
}

/**
 * UpdateGameSettings Output DTO
 * Result of updating game settings
 */
export interface UpdateGameSettingsOutput {
  /** Success status */
  success: boolean;
  /** Updated game details */
  game?: GameDetailDto;
}
