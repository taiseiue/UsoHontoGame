/**
 * Server-Sent Events (SSE) type definitions for real-time game updates
 */

/**
 * Base SSE event structure
 */
export interface SSEEvent<T = unknown> {
  /** Event type identifier */
  event: string;
  /** Event payload data */
  data: T;
  /** Optional event ID for tracking */
  id?: string;
  /** Optional retry interval in milliseconds */
  retry?: number;
}

/**
 * Game state update event - sent when game phase or turn changes
 */
export interface GameStateUpdateEvent {
  sessionId: string;
  phase: 'preparation' | 'presentation' | 'voting' | 'reveal' | 'completed';
  currentTurnId: string | null;
  currentPresentingTeamId: string | null;
  timestamp: string;
}

/**
 * Score change event - sent when team scores are updated
 */
export interface ScoreChangeEvent {
  sessionId: string;
  teamId: string;
  teamName: string;
  previousScore: number;
  newScore: number;
  delta: number;
  timestamp: string;
}

/**
 * Timer tick event - sent periodically during timed phases
 */
export interface TimerTickEvent {
  sessionId: string;
  turnId: string;
  remainingSeconds: number;
  totalSeconds: number;
  timestamp: string;
}

/**
 * Heartbeat event - sent periodically to keep connection alive
 */
export interface HeartbeatEvent {
  timestamp: string;
}

/**
 * Error event - sent when an error occurs on the server
 */
export interface ErrorEvent {
  message: string;
  code?: string;
  timestamp: string;
}

/**
 * Full game state sync event - sent on initial connection
 */
export interface FullStateSyncEvent {
  sessionId: string;
  session: {
    id: string;
    phase: 'preparation' | 'presentation' | 'voting' | 'reveal' | 'completed';
    currentTurnId: string | null;
  };
  teams: Array<{
    id: string;
    name: string;
    score: number;
  }>;
  participants: Array<{
    id: string;
    nickname: string;
    teamId: string | null;
    role: 'host' | 'player';
  }>;
  currentTurn?: {
    id: string;
    presentingTeamId: string;
    episodeNumber: number;
    remainingSeconds: number;
  } | null;
  timestamp: string;
}

/**
 * Union type of all event data types
 */
export type SSEEventData =
  | GameStateUpdateEvent
  | ScoreChangeEvent
  | TimerTickEvent
  | HeartbeatEvent
  | ErrorEvent
  | FullStateSyncEvent;

/**
 * Event type string literals
 */
export const SSEEventType = {
  GAME_STATE_UPDATE: 'game-state-update',
  SCORE_CHANGE: 'score-change',
  TIMER_TICK: 'timer-tick',
  HEARTBEAT: 'heartbeat',
  ERROR: 'error',
  FULL_STATE_SYNC: 'full-state-sync',
} as const;

export type SSEEventTypeValue = (typeof SSEEventType)[keyof typeof SSEEventType];

/**
 * Serialize event data to SSE format
 *
 * SSE format:
 * event: <event-type>
 * data: <json-data>
 * id: <optional-id>
 *
 * @param eventType - The event type
 * @param data - The event data payload
 * @param id - Optional event ID for tracking
 * @returns Formatted SSE string
 */
export function serializeSSEEvent<T>(eventType: string, data: T, id?: string): string {
  const lines: string[] = [];

  if (id) {
    lines.push(`id: ${id}`);
  }

  lines.push(`event: ${eventType}`);
  lines.push(`data: ${JSON.stringify(data)}`);
  lines.push(''); // Empty line to signal end of event

  return lines.join('\n');
}

/**
 * Parse SSE event from string format
 *
 * @param eventString - The SSE formatted string
 * @returns Parsed SSE event object
 */
export function parseSSEEvent(eventString: string): SSEEvent | null {
  const lines = eventString.split('\n').filter((line) => line.trim() !== '');

  const event: Partial<SSEEvent> = {};

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const field = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    switch (field) {
      case 'event':
        event.event = value;
        break;
      case 'data':
        try {
          event.data = JSON.parse(value);
        } catch {
          event.data = value;
        }
        break;
      case 'id':
        event.id = value;
        break;
      case 'retry':
        event.retry = Number.parseInt(value, 10);
        break;
    }
  }

  if (!event.event || event.data === undefined) {
    return null;
  }

  return event as SSEEvent;
}
