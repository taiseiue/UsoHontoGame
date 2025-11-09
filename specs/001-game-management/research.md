# Research: Two Truths and a Lie Game Management System

**Date**: 2025-06-11
**Feature**: 001-game-management
**Phase**: 0 (Outline & Research)

## Research Areas

### 1. Real-Time Synchronization Strategy

**Decision**: Server-Sent Events (SSE) for unidirectional real-time updates

**Rationale**:
- SSE provides one-way server-to-client communication, perfect for score updates, game state changes, and timer synchronization
- Built on standard HTTP, easier to deploy than WebSockets (no special server configuration needed)
- Automatic reconnection handling built into EventSource API
- Lower overhead than WebSockets for primarily server-to-client updates
- Works well with Next.js API Routes without additional infrastructure

**Alternatives Considered**:
- **WebSockets**: Rejected because bidirectional communication not needed for most updates (voting is simple HTTP POST, no need for persistent connection from client)
- **Polling**: Rejected due to higher latency (would violate <500ms timer sync requirement) and server load
- **Socket.io**: Rejected as overkill for this use case, adds dependency and complexity

**Implementation Approach**:
- SSE endpoint at `/api/sessions/[id]/events` for game state updates
- HTTP POST for user actions (vote, start turn, reveal answer)
- EventSource API on client side with automatic reconnection
- State updates broadcast to all connected clients when game state changes

**Best Practices**:
- Keep SSE connections alive with periodic heartbeat messages (every 30s)
- Implement exponential backoff for reconnection attempts
- Send full game state on reconnection to handle missed updates
- Use typed events (`game-state-update`, `score-change`, `timer-tick`)

---

### 2. In-Memory Session Storage Design

**Decision**: Singleton Map-based repository with TTL cleanup

**Rationale**:
- MVP doesn't require persistent storage across server restarts
- Game sessions are temporary (45-90 minutes typical duration)
- Simplifies deployment (no database setup required)
- Enables fast development iteration
- Sufficient for initial usage (single server instance)

**Alternatives Considered**:
- **PostgreSQL**: Rejected for MVP as over-engineering, adds setup complexity and deployment dependencies
- **Redis**: Rejected for MVP, though recommended for future multi-server scaling
- **SQLite**: Rejected because sessions don't need persistence across restarts

**Implementation Approach**:
```typescript
// InMemoryGameSessionRepository.ts
private sessions: Map<string, GameSession> = new Map();
private cleanup Interval = 2 hours;

// Automatic cleanup of expired sessions
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of this.sessions.entries()) {
    if (now - session.lastActivityTimestamp > 3 * 60 * 60 * 1000) { // 3 hours
      this.sessions.delete(id);
    }
  }
}, this.cleanupInterval);
```

**Best Practices**:
- Update `lastActivityTimestamp` on any session mutation
- Implement session TTL of 3 hours (gives 1 hour buffer beyond typical 2-hour event)
- Provide repository interfaces for easy future migration to persistent storage
- Log session creation/cleanup for monitoring

**Migration Path**: When scaling required, swap in RedisGameSessionRepository implementing same IGameSessionRepository interface

---

### 3. Session ID Generation Strategy

**Decision**: Nanoid with custom alphabet for 6-character codes

**Rationale**:
- Nanoid provides URL-safe, collision-resistant IDs
- Custom alphabet (uppercase + numbers, excluding ambiguous characters) improves usability
- 6 characters with 32-character alphabet = 1.07 billion possible IDs
- Low collision probability even with thousands of concurrent sessions
- Easy to communicate verbally and type on mobile devices

**Alternatives Considered**:
- **UUID**: Rejected as too long (36 characters) for manual entry
- **Random numbers**: Rejected due to higher collision risk and lack of readability
- **Sequential IDs**: Rejected for security reasons (session enumeration risk)

**Implementation Approach**:
```typescript
import { customAlphabet } from 'nanoid';

// Exclude ambiguous characters: 0, O, I, 1, L
const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const generateSessionId = customAlphabet(alphabet, 6);

// Usage
const sessionId = generateSessionId(); // e.g., "3KH9Q2"
```

**Best Practices**:
- Display session IDs in monospace font for clarity
- Group visually (e.g., "3KH 9Q2") for easier reading
- Implement collision checking (regenerate if ID exists, though probability is infinitesimal)
- Allow case-insensitive lookup (normalize to uppercase on input)

---

### 4. Timer Synchronization Approach

**Decision**: Server-authoritative timer with client-side interpolation

**Rationale**:
- Server maintains authoritative time to prevent cheating
- Clients interpolate between server updates for smooth countdown display
- Eliminates clock skew issues across devices
- Ensures all participants see consistent timing

**Alternatives Considered**:
- **Client-only timers**: Rejected due to clock skew and potential manipulation
- **NTP synchronization**: Rejected as over-engineering, adds complexity for minimal benefit
- **Countdown from client**: Rejected because different network latencies would cause visible drift

**Implementation Approach**:
```typescript
// Server sends timer updates via SSE every second
type TimerUpdate = {
  remainingMs: number;
  serverTimestamp: number;
};

// Client interpolates between updates
let lastServerTime = update.remainingMs;
let lastUpdateTime = Date.now();

setInterval(() => {
  const elapsed = Date.now() - lastUpdateTime;
  const displayTime = Math.max(0, lastServerTime - elapsed);
  // Update UI with displayTime
}, 100); // 10 FPS for smooth countdown

// On new server update: reset interpolation baseline
```

**Best Practices**:
- Send server time updates every 1 second via SSE
- Client interpolates at 10 Hz (every 100ms) for smooth display
- Clamp displayed time to 0 (never show negative)
- Show visual warning when timer approaches zero (<10 seconds)
- Implement grace period of 2-3 seconds before forcing submission

---

### 5. Score Calculation Service Design

**Decision**: Functional service with pure calculation methods

**Rationale**:
- Scoring logic is deterministic based on votes and correct answer
- Pure functions easier to test (no side effects)
- Can be unit tested exhaustively without mocking
- Clear separation from business logic (use cases) and data access (repositories)

**Implementation Approach**:
```typescript
// ScoreCalculationService.ts
export class ScoreCalculationService {
  calculateTurnScores(
    votes: Vote[],
    correctEpisodeNumber: number,
    pointsForCorrectGuess: number = 10,
    pointsPerDeception: number = 5
  ): TurnScores {
    const correctVotes = votes.filter(v => v.selectedEpisode === correctEpisodeNumber);
    const incorrectVotes = votes.filter(v => v.selectedEpisode !== correctEpisodeNumber);

    const guessingTeamScores = correctVotes.map(v => ({
      teamId: v.teamId,
      points: pointsForCorrectGuess
    }));

    const presentingTeamScore = incorrectVotes.length * pointsPerDeception;

    return {
      guessingTeamScores,
      presentingTeamScore
    };
  }
}
```

**Best Practices**:
- Keep methods pure (no state, no side effects)
- Accept scoring rules as parameters (supports future customization)
- Return structured score objects, not raw numbers
- Include comprehensive unit tests covering all scoring scenarios
- Document edge cases (e.g., all teams guess incorrectly, single team game)

---

### 6. Episode Validation Rules

**Decision**: Server-side validation with client-side preview

**Rationale**:
- Security: Never trust client-side validation alone
- UX: Client-side validation provides immediate feedback
- Consistency: Server enforces same rules across all entry points (web UI, future mobile apps)

**Validation Rules**:
1. Must have exactly 3 episodes
2. All episodes must be non-empty (after trimming whitespace)
3. Episode text length: 10-500 characters each
4. Exactly one episode must be marked as lie
5. Lie designation required before submission
6. Episodes can be edited until team's turn starts

**Implementation Approach**:
```typescript
// Shared validation (used by client and server)
export const EPISODE_MIN_LENGTH = 10;
export const EPISODE_MAX_LENGTH = 500;

export function validateEpisodes(episodes: Episode[]): ValidationErrors {
  const errors: ValidationErrors = {};

  if (episodes.length !== 3) {
    errors.count = 'Must provide exactly 3 episodes';
  }

  const lieCount = episodes.filter(e => e.isLie).length;
  if (lieCount !== 1) {
    errors.lie = 'Exactly one episode must be marked as lie';
  }

  episodes.forEach((ep, index) => {
    const trimmed = ep.text.trim();
    if (trimmed.length < EPISODE_MIN_LENGTH) {
      errors[`episode${index}`] = `Minimum ${EPISODE_MIN_LENGTH} characters`;
    }
    if (trimmed.length > EPISODE_MAX_LENGTH) {
      errors[`episode${index}`] = `Maximum ${EPISODE_MAX_LENGTH} characters`;
    }
  });

  return errors;
}
```

**Best Practices**:
- Share validation code between client and server (place in `/lib/validators.ts`)
- Trim whitespace before validation
- Provide clear, actionable error messages
- Validate on blur (client) and on submit (both client and server)
- Prevent submission if validation fails

---

### 7. Mobile Responsiveness Strategy

**Decision**: Mobile-first Tailwind CSS with breakpoint progression

**Rationale**:
- Most participants will use smartphones during events
- Mobile-first ensures core functionality works on smallest screens
- Tailwind's responsive utilities enable rapid iteration
- Progressive enhancement for larger screens

**Breakpoints** (Tailwind defaults):
- Default (mobile): 320px - 639px
- `sm`: 640px+ (large phones, small tablets)
- `md`: 768px+ (tablets)
- `lg`: 1024px+ (desktops)

**Key Responsive Patterns**:
```tsx
// Mobile-first example
<div className="
  flex flex-col gap-4        // Mobile: stack vertically
  md:flex-row md:gap-6       // Tablet+: horizontal layout
  lg:gap-8                   // Desktop: wider gaps
">
  <ScoreBoard />
  <GameContent />
</div>

// Touch-friendly sizing
<Button className="
  min-h-[44px]              // Mobile: 44px minimum (iOS guideline)
  px-6 py-3                 // Comfortable tap target
  text-lg                   // Readable on small screens
"/>
```

**Best Practices**:
- Use viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- Touch targets minimum 44x44px (iOS) / 48x48px (Android)
- Font sizes: base 16px, never below 14px for body text
- Adequate spacing between interactive elements (minimum 8px)
- Test on real devices, not just browser dev tools
- Consider landscape orientation for tablets

---

### 8. Error Handling Patterns

**Decision**: Layered error handling with domain-specific error types

**Rationale**:
- Different layers need different error representations
- Domain errors should be business-meaningful, not technical
- API errors need HTTP status codes and user-friendly messages
- Frontend needs actionable error messages for users

**Error Hierarchy**:
```typescript
// Domain layer errors
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class SessionNotFoundError extends DomainError {
  constructor(sessionId: string) {
    super(`Session ${sessionId} not found`);
    this.name = 'SessionNotFoundError';
  }
}

export class InvalidVoteError extends DomainError {
  constructor(reason: string) {
    super(`Invalid vote: ${reason}`);
    this.name = 'InvalidVoteError';
  }
}

// API layer error handler
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof SessionNotFoundError) {
    return NextResponse.json(
      { error: 'Game session not found' },
      { status: 404 }
    );
  }

  if (error instanceof InvalidVoteError) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  // Unexpected errors
  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}
```

**Best Practices**:
- Throw domain errors in use cases for business rule violations
- Catch and translate errors at API boundary
- Never expose stack traces or internal details to clients
- Log unexpected errors with full context for debugging
- Provide user-friendly messages in API responses
- Use toast notifications on frontend for error feedback

---

### 9. Testing Strategy

**Decision**: TDD with 3-layer test pyramid

**Rationale**:
- TDD ensures requirements drive implementation
- Test pyramid balances coverage and speed (many unit, some integration, few E2E)
- Each layer tests different concerns

**Test Layers**:
1. **Unit Tests** (70% of tests):
   - Domain entities
   - Use cases
   - Custom hooks
   - Pure utility functions
   - Score calculation

2. **Integration Tests** (25% of tests):
   - API endpoints (request → response)
   - User flows across multiple components
   - Repository operations

3. **Component Tests** (5% of tests):
   - Page-level component rendering
   - User interactions
   - State management

**Implementation Approach**:
```typescript
// Unit test example (Vitest)
describe('ScoreCalculationService', () => {
  it('awards 10 points to teams that guess correctly', () => {
    const service = new ScoreCalculationService();
    const votes = [
      { teamId: 'A', selectedEpisode: 2 },
      { teamId: 'B', selectedEpisode: 2 },
      { teamId: 'C', selectedEpisode: 1 }
    ];

    const scores = service.calculateTurnScores(votes, 2);

    expect(scores.guessingTeamScores).toEqual([
      { teamId: 'A', points: 10 },
      { teamId: 'B', points: 10 }
    ]);
    expect(scores.presentingTeamScore).toBe(5);
  });
});

// Integration test example
describe('POST /api/votes', () => {
  it('accepts valid vote and updates game state', async () => {
    // Given: a game in voting phase
    const sessionId = await createTestSession();
    await startVoting(sessionId);

    // When: team submits vote
    const response = await fetch('/api/votes', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        teamId: 'A',
        selectedEpisode: 2
      })
    });

    // Then: vote accepted and state updated
    expect(response.status).toBe(201);
    const gameState = await getSessionState(sessionId);
    expect(gameState.votes).toHaveLength(1);
  });
});
```

**Best Practices**:
- Write tests first (Red-Green-Refactor)
- One assertion per test (or closely related assertions)
- Use descriptive test names (should read like requirements)
- Avoid test interdependence (each test independent)
- Use test fixtures and factories for setup
- Mock external dependencies (SSE, time)

---

## Technology Research Summary

### Next.js 15 Best Practices
- Use App Router (not Pages Router)
- Leverage React Server Components for initial renders
- Use Server Actions for form submissions
- Dynamic routes with `[param]` convention
- Route groups with `(name)` for organization
- Co-locate API routes with related pages when logical

### React 19 Patterns
- Use `"use client"` directive only when needed
- Prefer Server Components for data fetching
- Use Suspense boundaries for loading states
- Error boundaries for error handling
- Use Context sparingly (prefer prop drilling for short paths)

### Tailwind CSS v4
- Use arbitrary values sparingly: `w-[372px]`
- Prefer design tokens: `w-96`
- Use `@apply` only for component classes
- Mobile-first responsive design
- Dark mode support with `dark:` variant (future enhancement)

### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/']
    }
  }
});
```

---

## Open Questions

None - all technical decisions resolved for MVP implementation.

## Next Steps

Proceed to **Phase 1**: Generate data models, API contracts, and quickstart documentation.
