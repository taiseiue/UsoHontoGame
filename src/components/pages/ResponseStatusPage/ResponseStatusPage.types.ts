// Type definitions for ResponseStatusPage
// Feature: 006-results-dashboard, User Story 1

import type {
  ParticipantStatusDto,
  ResponseStatusDto,
} from '@/server/application/dto/ResponseStatusDto';

/**
 * Props for ResponseStatusPage component
 */
export interface ResponseStatusPageProps {
  /** Game ID to display response status for */
  gameId: string;
  /** Initial response status data (from SSR) */
  initialData?: ResponseStatusDto;
}

/**
 * Props for ResponseStatusList domain component
 */
export interface ResponseStatusListProps {
  /** List of participants and their submission status */
  participants: ParticipantStatusDto[];
  /** Total number of expected participants */
  totalParticipants: number;
  /** Number of participants who have submitted */
  submittedCount: number;
  /** Whether all participants have submitted */
  allSubmitted: boolean;
}

/**
 * Response status error
 */
export interface ResponseStatusError {
  /** Error message to display */
  message: string;
  /** HTTP status code */
  statusCode?: number;
}
