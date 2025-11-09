/**
 * Core game type definitions
 */

export enum SessionPhase {
  PREPARATION = 'preparation',
  PRESENTATION = 'presentation',
  VOTING = 'voting',
  REVEAL = 'reveal',
  COMPLETED = 'completed',
}

export enum TurnPhase {
  PRESENTING = 'presenting',
  VOTING = 'voting',
  REVEALING = 'revealing',
}

export enum ParticipantRole {
  HOST = 'host',
  PLAYER = 'player',
}

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}

export interface ScoringRules {
  pointsForCorrectGuess: number; // Default: 10
  pointsPerDeception: number; // Default: 5
}

export interface TurnPoints {
  presentingTeamPoints: number;
  correctGuessingTeams: {
    teamId: string;
    points: number;
  }[];
}
