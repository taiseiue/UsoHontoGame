# Research: Results Dashboard

**Feature**: 006-results-dashboard
**Date**: 2025-11-21
**Purpose**: Resolve technical unknowns and establish implementation patterns

## Research Questions

Three key technical decisions need resolution before design phase:

1. **Real-time Updates**: How to implement response status tracking
2. **Animation Library**: How to implement celebration effects
3. **Score Persistence**: How to store and retrieve scores

---

## 1. Real-time Updates: Polling vs WebSocket

### Decision: Client-side Polling with React Query pattern

### Rationale

**Context**: Need to show moderators real-time response submission status without infrastructure overhead.

**Chosen Approach**: HTTP polling every 3-5 seconds using `useEffect` + `setInterval`

**Why Polling Over WebSocket**:
- **Simplicity**: No additional server infrastructure (no WebSocket server, no connection management)
- **Existing Pattern**: Project already uses HTTP-only communication (no WebSocket setup exists)
- **Scale Appropriate**: 100 max participants with 3-5 second intervals = low server load
- **Reliability**: HTTP is stateless, no connection drops to handle
- **Development Speed**: Faster to implement with existing Next.js patterns

**Implementation Pattern**:
```typescript
// In useResponseStatus hook
useEffect(() => {
  const interval = setInterval(async () => {
    const status = await fetchResponseStatus(gameId);
    setResponseStatus(status);
  }, 3000); // Poll every 3 seconds

  return () => clearInterval(interval);
}, [gameId]);
```

### Alternatives Considered

**WebSocket**:
- ❌ Requires server infrastructure (ws package, connection handling)
- ❌ More complex to test
- ❌ Overkill for this scale
- ✅ Would provide instant updates (not needed - 3s delay acceptable)

**Server-Sent Events (SSE)**:
- ❌ Requires streaming API route implementation
- ❌ Not well supported in all deployment environments
- ✅ One-way updates (matches our need)

### Performance Impact

- **Network**: 1 request every 3s per moderator = ~20 requests/minute per game
- **Server**: Simple SELECT query, returns JSON (~1-5KB)
- **Client**: Minimal re-render, only updates when data changes
- **Acceptable**: Performance goals met (2s initial load, real-time updates within 3s)

---

## 2. Animation Library: CSS vs React Library

### Decision: CSS Animations with Tailwind CSS

### Rationale

**Context**: Need celebratory effects (confetti, highlighting) for winner announcement.

**Chosen Approach**: Pure CSS animations using Tailwind CSS v4 utilities

**Why CSS Over Library**:
- **Project Standard**: Tailwind CSS v4 already in use
- **Bundle Size**: Zero additional dependencies
- **Performance**: GPU-accelerated, 60fps capable
- **Maintainability**: No library version updates needed
- **Sufficient**: Confetti and highlighting achievable with CSS

**Implementation Pattern**:
```typescript
// Confetti using CSS animations
<div className="confetti animate-fall-1" />
<div className="confetti animate-fall-2" />

// Winner highlighting with Tailwind
<div className="bg-yellow-100 ring-4 ring-yellow-400 animate-pulse">
  Winner: {winner.name}
</div>
```

**CSS Animation Definition** (`src/lib/animations.ts`):
```typescript
export const confettiStyles = `
  @keyframes fall {
    to { transform: translateY(100vh) rotate(360deg); }
  }
  .animate-fall-1 { animation: fall 3s linear; }
  .animate-fall-2 { animation: fall 3.5s linear 0.2s; }
`;
```

### Alternatives Considered

**react-confetti library**:
- ❌ Adds 50KB to bundle
- ❌ Canvas-based (requires browser compatibility testing)
- ✅ More realistic physics
- ✅ Easier to implement

**framer-motion**:
- ❌ Large library (100KB+)
- ❌ Overkill for simple animations
- ✅ More animation options
- ✅ Better gesture support

**lottie-react**:
- ❌ Requires JSON animation files
- ❌ Additional asset management
- ✅ Professional-looking animations

### Performance Impact

- **Bundle**: 0KB additional (uses existing Tailwind)
- **Rendering**: CSS animations run on GPU, 60fps
- **Compatibility**: Works in all modern browsers (Next.js target)

---

## 3. Score Persistence: Calculate vs Store

### Decision: Hybrid - Calculate on-demand, cache in memory

### Rationale

**Context**: Need to show scores after game closes, with potential for many participants (up to 100).

**Chosen Approach**: Calculate scores from Answer entities when requested, no database storage

**Why Calculate Over Store**:
- **Simplicity**: No additional database schema changes
- **Correctness**: Single source of truth (Answer entities)
- **Flexibility**: Easy to change scoring rules without migrations
- **Auditability**: Can recalculate scores from raw answers anytime
- **Performance**: Calculation is fast (10 points per correct answer × 100 participants = simple arithmetic)

**Implementation Pattern**:
```typescript
// CalculateScores use case
export class CalculateScores {
  async execute(gameId: string): Promise<ScoreDto[]> {
    // 1. Get game with presenters and lie episodes
    const game = await gameRepository.findById(gameId);

    // 2. Get all answers for game
    const answers = await answerRepository.findByGameId(gameId);

    // 3. Calculate scores
    return answers.map(answer => {
      let totalScore = 0;

      for (const [presenterId, selectedEpisodeId] of answer.selections) {
        const presenter = game.presenters.find(p => p.id === presenterId);
        const lieEpisode = presenter.episodes.find(e => e.isLie);

        if (selectedEpisodeId === lieEpisode.id) {
          totalScore += 10; // Correct answer
        }
      }

      return {
        nickname: answer.nickname,
        totalScore,
        selections: answer.selections,
      };
    });
  }
}
```

**No Caching Needed**:
- Results page is typically viewed once after game closes
- Server Component can calculate on initial render
- No need for Redis or in-memory cache at this scale

### Alternatives Considered

**Store in Database (Score table)**:
- ❌ Requires schema migration (Score model, foreign keys)
- ❌ Synchronization complexity (when to calculate? triggers?)
- ❌ Data duplication (scores derivable from answers)
- ✅ Faster reads (pre-calculated)
- ✅ Historical tracking (but not in requirements)

**Store in JSON field on Game**:
- ❌ Denormalization anti-pattern
- ❌ Difficult to query individual scores
- ✅ Simple schema change
- ✅ Atomic with game state

**Cache in Redis**:
- ❌ Additional infrastructure dependency
- ❌ Overkill for this scale
- ✅ Very fast reads
- ✅ Automatic expiration

### Performance Impact

**Calculation Complexity**:
- 100 participants × 5 presenters = 500 comparisons
- Each comparison: 1 map lookup + 1 boolean check
- Total time: < 10ms on modern hardware

**Database Queries**:
- 1 query for game with presenters/episodes
- 1 query for all answers
- Existing indexes support efficient queries

**Meets Requirements**: SC-002 specifies "scores displayed within 3 seconds" - calculation time < 10ms leaves ample margin.

---

## 4. Additional Best Practices Research

### Error Handling Pattern

Follow existing use case pattern with Result type:

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]> };
```

### DTO Design Pattern

Follow existing DTO conventions:

```typescript
// ResponseStatusDto.ts
export interface ResponseStatusDto {
  gameId: string;
  participants: Array<{
    nickname: string;
    hasSubmitted: boolean;
    submittedAt?: Date;
  }>;
  totalParticipants: number;
  submittedCount: number;
  allSubmitted: boolean;
}

// ScoreDto.ts
export interface ScoreDto {
  nickname: string;
  totalScore: number;
  selections: Record<string, string>; // presenterId -> episodeId
  details: Array<{
    presenterNickname: string;
    selectedEpisode: string;
    wasCorrect: boolean;
    pointsEarned: number;
  }>;
}

// RankingDto.ts
export interface RankingDto {
  rank: number;
  nickname: string;
  totalScore: number;
  isWinner: boolean;
  isTied: boolean;
}
```

### Testing Strategy

Follow TDD approach per constitution:

1. **Unit Tests** (co-located):
   - CalculateScores.test.ts: Test score calculation logic
   - useResponseStatus.test.ts: Test polling behavior
   - ResponseStatusPage.test.ts: Test UI rendering

2. **Integration Tests** (`tests/integration/results/`):
   - Test use cases with real Prisma repositories
   - Use isolated SQLite databases per test file

3. **E2E Tests** (`tests/e2e/`):
   - Full user journey: moderator views status → game closes → views results

---

## Summary

All technical unknowns resolved. Ready for Phase 1 design:

| Question | Decision | Rationale |
|----------|----------|-----------|
| Real-time updates | HTTP Polling (3s) | Simple, reliable, sufficient for scale |
| Animation library | CSS + Tailwind | Zero dependencies, project standard |
| Score persistence | Calculate on-demand | Simple, correct, fast enough |

**Next Steps**: Proceed to data model design and API contracts.
