# Component Interfaces: Results Dashboard

**Feature**: 006-results-dashboard
**Date**: 2025-11-21
**Purpose**: Define component props, hooks, and UI contracts

---

## Page Components

### ResponseStatusPage (P1)

**Location**: `src/components/pages/ResponseStatusPage/index.tsx`

**Purpose**: Display real-time response submission status for moderators

**Component Type**: Client Component (`"use client"`)

**Props**:
```typescript
interface ResponseStatusPageProps {
  gameId: string;
  gameName: string;
  initialData: ResponseStatusDto;    // SSR initial data
}
```

**Hook**: `useResponseStatus`

**Responsibilities**:
- Render participant list with submission status
- Poll for updates every 3 seconds
- Show "All submitted" indicator
- Display loading/error states

**UI Elements**:
- Page title: "回答状況"
- Participant list (sorted alphabetically)
- Status badges (submitted/pending)
- Timestamp display
- "All responses received" banner (when complete)

---

### ScoreboardPage (P2)

**Location**: `src/components/pages/ScoreboardPage/index.tsx`

**Purpose**: Display calculated scores with answer details

**Component Type**: Server Component (default)

**Props**:
```typescript
interface ScoreboardPageProps {
  gameId: string;
  gameName: string;
  scores: ScoreDto[];
}
```

**Hook**: None (Server Component, no client state)

**Responsibilities**:
- Render score cards for each participant
- Display total scores
- Show answer details (correct/incorrect)
- Sort by score descending

**UI Elements**:
- Page title: "スコアボード"
- Score cards (participant name, total score, details)
- Correct/incorrect indicators
- Episode text display

---

### ResultsPage (P3)

**Location**: `src/components/pages/ResultsPage/index.tsx`

**Purpose**: Display final rankings with winner celebration

**Component Type**: Client Component (for animations)

**Props**:
```typescript
interface ResultsPageProps {
  gameId: string;
  gameName: string;
  rankings: RankingDto;
}
```

**Hook**: `useResults` (for animation control only)

**Responsibilities**:
- Render ranking list
- Highlight winners
- Trigger celebration effects
- Display complete results

**UI Elements**:
- Page title: "結果発表"
- Ranking list (with rank numbers)
- Winner highlighting (gold background, ring)
- Confetti animation (auto-play on load)
- Congratulations message

---

## Domain Components

### ResponseStatusList

**Location**: `src/components/domain/results/ResponseStatusList.tsx`

**Purpose**: Render list of participants with submission status

**Component Type**: Client Component

**Props**:
```typescript
interface ResponseStatusListProps {
  participants: Array<{
    nickname: string;
    hasSubmitted: boolean;
    submittedAt?: Date;
  }>;
  totalCount: number;
  submittedCount: number;
}
```

**Responsibilities**:
- Map participants to list items
- Display submission badges
- Format timestamps
- Show count summary

---

### ScoreCard

**Location**: `src/components/domain/results/ScoreCard.tsx`

**Purpose**: Display individual participant score with details

**Component Type**: Server Component

**Props**:
```typescript
interface ScoreCardProps {
  nickname: string;
  totalScore: number;
  details: Array<{
    presenterNickname: string;
    selectedEpisodeText: string;
    wasCorrect: boolean;
    pointsEarned: number;
  }>;
}
```

**Responsibilities**:
- Render score summary
- Display answer breakdown
- Show correct/incorrect indicators
- Format episode text

---

### RankingDisplay

**Location**: `src/components/domain/results/RankingDisplay.tsx`

**Purpose**: Display ranking list with winner highlighting

**Component Type**: Client Component

**Props**:
```typescript
interface RankingDisplayProps {
  rankings: Array<{
    rank: number;
    nickname: string;
    totalScore: number;
    isWinner: boolean;
  }>;
  highestScore: number;
}
```

**Responsibilities**:
- Render ranking rows
- Apply winner styling
- Handle ties (same rank)
- Display scores

---

### WinnerCelebration

**Location**: `src/components/domain/results/WinnerCelebration.tsx`

**Purpose**: Display celebration effects for winners

**Component Type**: Client Component

**Props**:
```typescript
interface WinnerCelebrationProps {
  winners: Array<{ nickname: string }>;
  autoPlay?: boolean;              // Default: true
  onComplete?: () => void;
}
```

**Responsibilities**:
- Trigger confetti animation
- Display congratulations message
- Auto-play on mount
- Clean up on unmount

---

## UI Components

### Confetti

**Location**: `src/components/ui/Confetti.tsx`

**Purpose**: Reusable confetti animation component

**Component Type**: Client Component

**Props**:
```typescript
interface ConfettiProps {
  duration?: number;               // Default: 3000ms
  particleCount?: number;          // Default: 50
  colors?: string[];               // Default: ['#fbbf24', '#f59e0b', '#d97706']
  onComplete?: () => void;
}
```

**Implementation**: Pure CSS animations, no canvas

**Responsibilities**:
- Render confetti particles
- Animate falling motion
- Auto-remove after duration
- Callback on completion

---

## Custom Hooks

### useResponseStatus (P1)

**Location**: `src/components/pages/ResponseStatusPage/hooks/useResponseStatus.ts`

**Purpose**: Handle response status polling and state management

**Signature**:
```typescript
interface UseResponseStatusProps {
  gameId: string;
  initialData: ResponseStatusDto;
  pollInterval?: number;           // Default: 3000ms
}

interface UseResponseStatusReturn {
  data: ResponseStatusDto;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function useResponseStatus(props: UseResponseStatusProps): UseResponseStatusReturn
```

**Implementation**:
```typescript
- Use useEffect + setInterval for polling
- Fetch from /api/games/[id]/dashboard
- Update state on successful fetch
- Clear interval on unmount or error
- Expose manual refetch function
```

**Testing Focus**:
- Polling starts on mount
- Interval cleared on unmount
- Error state handled correctly
- Manual refetch works

---

### useResults (P3)

**Location**: `src/components/pages/ResultsPage/hooks/useResults.ts`

**Purpose**: Control celebration animation timing

**Signature**:
```typescript
interface UseResultsProps {
  autoPlay?: boolean;              // Default: true
}

interface UseResultsReturn {
  showConfetti: boolean;
  triggerConfetti: () => void;
  resetConfetti: () => void;
}

function useResults(props: UseResultsProps): UseResultsReturn
```

**Implementation**:
```typescript
- Use useState for showConfetti flag
- Auto-trigger on mount if autoPlay
- Expose manual trigger function
- Expose reset function
```

**Testing Focus**:
- Auto-plays on mount when enabled
- Manual trigger works
- Reset clears confetti

---

## Type Definitions

### Shared Types

**Location**: `src/components/pages/*/[ComponentName].types.ts`

**Pattern**: Each page component has co-located types file

**Example** (`ResponseStatusPage.types.ts`):
```typescript
import type { ResponseStatusDto } from '@/server/application/dto/ResponseStatusDto';

export interface ResponseStatusPageProps {
  gameId: string;
  gameName: string;
  initialData: ResponseStatusDto;
}

// Additional component-specific types
export interface ParticipantRowProps {
  nickname: string;
  hasSubmitted: boolean;
  submittedAt?: Date;
}
```

---

## State Management

**Pattern**: Local state only (no global store needed)

**Rationale**:
- Each page is independent
- Data fetched per-page
- No shared state between features
- Simple useEffect + useState sufficient

---

## Error Handling

**Pattern**: Error boundaries + fallback UI

**Components**:
```typescript
// Each page has error handling
<ErrorBoundary fallback={<ErrorMessage />}>
  <ResponseStatusPage {...props} />
</ErrorBoundary>
```

**Hook Error States**:
```typescript
if (error) {
  return <ErrorMessage error={error} onRetry={refetch} />;
}
```

---

## Loading States

**Pattern**: Skeleton screens + loading indicators

**Components**:
```typescript
// Initial load
if (isLoading) {
  return <ResponseStatusSkeleton />;
}

// Polling update (background)
{isPolling && <PollingIndicator />}
```

---

## Accessibility

**Requirements**:
- Semantic HTML (main, section, article)
- ARIA labels for status indicators
- Keyboard navigation support
- Screen reader announcements for status changes
- Focus management for dynamic content

**Example**:
```typescript
<div role="status" aria-live="polite" aria-atomic="true">
  {submittedCount} / {totalCount} participants submitted
</div>
```

---

## Testing Contracts

### Unit Tests (Component)

**File Pattern**: `[ComponentName].test.tsx`

**Test Cases**:
- Props rendering correctly
- Event handlers called
- Conditional rendering (loading, error, success)
- Accessibility attributes present

### Unit Tests (Hook)

**File Pattern**: `[hookName].test.ts`

**Test Cases**:
- Initial state correct
- State updates on actions
- Side effects trigger correctly
- Cleanup functions called

### Integration Tests

**Location**: `tests/integration/results/`

**Test Cases**:
- API endpoint returns correct data
- Use cases calculate scores correctly
- Database queries return expected results

---

## Summary

- **3 Page Components**: ResponseStatusPage, ScoreboardPage, ResultsPage
- **4 Domain Components**: ResponseStatusList, ScoreCard, RankingDisplay, WinnerCelebration
- **1 UI Component**: Confetti
- **2 Custom Hooks**: useResponseStatus, useResults
- **Clear contracts**: Props, return types, responsibilities defined
- **Testable**: Each component/hook independently testable
- **Accessible**: ARIA labels and semantic HTML throughout
