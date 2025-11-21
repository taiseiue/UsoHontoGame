# Data Model: Results Dashboard

**Feature**: 006-results-dashboard
**Date**: 2025-11-21
**Purpose**: Define data structures, relationships, and validation rules

## Overview

The Results Dashboard feature **reuses existing entities** and introduces **DTOs only** - no new database models required. Score calculation is performed on-demand from existing Answer and Game entities.

---

## Existing Entities (Reused)

### Game Entity

**Source**: `src/server/domain/entities/Game.ts`

**Purpose**: Core game data with status and presenters

**Fields**:
```typescript
{
  id: string;                    // Game identifier (nanoid)
  name: string;                  // Game name
  status: GameStatus;            // '準備中' | '出題中' | '締切'
  maxPlayers: number;            // Maximum participants (1-100)
  currentPlayers: number;        // Current participant count
  creatorSessionId: string;      // Creator's session ID
  presenters: Presenter[];       // Array of presenters with episodes
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
}
```

**Relevant for Dashboard**:
- `status`: Determines which dashboard is accessible
- `presenters[].episodes[].isLie`: Used for score calculation
- `currentPlayers`: Total participants for status tracking

### Answer Entity

**Source**: `src/server/domain/entities/Answer.ts`

**Purpose**: Participant's episode selections

**Fields**:
```typescript
{
  id: string;                              // Answer identifier (nanoid)
  sessionId: string;                       // Participant's session ID
  gameId: string;                          // Game reference
  nickname: string;                        // Participant nickname
  selections: Map<string, string>;         // presenterId -> episodeId
  createdAt: Date;                         // Submission timestamp
  updatedAt: Date;                         // Last update timestamp
}
```

**Relevant for Dashboard**:
- `selections`: Used to calculate scores (compare with lie episodes)
- `createdAt`: Shows when participant submitted
- `nickname`: Display name in results

---

## New DTOs (Application Layer)

### ResponseStatusDto

**Purpose**: Response status tracking for moderators (P1)

**Location**: `src/server/application/dto/ResponseStatusDto.ts`

**Structure**:
```typescript
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
  submittedAt?: Date;           // Only if hasSubmitted is true
}
```

**Validation Rules**:
- `gameId`: Must be valid nanoid
- `gameStatus`: Must be one of allowed statuses
- `totalParticipants`: Must equal `participants.length`
- `submittedCount`: Must equal count of participants with `hasSubmitted === true`
- `allSubmitted`: Must be `true` only if `submittedCount === totalParticipants`

**Business Rules**:
- Only accessible when game status is '出題中'
- Only moderator (creator) can view response status
- Participants sorted alphabetically by nickname

---

### ScoreDto

**Purpose**: Calculated score display for moderators and participants (P2)

**Location**: `src/server/application/dto/ScoreDto.ts`

**Structure**:
```typescript
export interface ScoreDto {
  nickname: string;
  totalScore: number;
  details: ScoreDetailDto[];
}

export interface ScoreDetailDto {
  presenterId: string;
  presenterNickname: string;
  selectedEpisodeId: string;
  selectedEpisodeText: string;
  correctEpisodeId: string;      // The lie episode
  wasCorrect: boolean;
  pointsEarned: number;          // 10 if correct, 0 if incorrect
}
```

**Validation Rules**:
- `totalScore`: Must equal sum of all `pointsEarned` in `details`
- `pointsEarned`: Must be 0 or 10
- `wasCorrect`: Must be `true` when `selectedEpisodeId === correctEpisodeId`
- `details.length`: Must equal number of presenters in game

**Business Rules**:
- Only calculated when game status is '締切'
- Score is sum of correct answers × 10 points each
- All presenters must have a selection (enforced at answer submission)

**Calculation Logic**:
```typescript
for each presenter in game:
  find participant's selected episode for presenter
  find presenter's lie episode (isLie === true)
  if selected episode === lie episode:
    pointsEarned = 10
  else:
    pointsEarned = 0
  totalScore += pointsEarned
```

---

### RankingDto

**Purpose**: Final results with winner highlighting (P3)

**Location**: `src/server/application/dto/RankingDto.ts`

**Structure**:
```typescript
export interface RankingDto {
  gameId: string;
  gameName: string;
  rankings: ParticipantRankingDto[];
  totalParticipants: number;
  highestScore: number;
  calculatedAt: Date;
}

export interface ParticipantRankingDto {
  rank: number;                  // 1-based ranking
  nickname: string;
  totalScore: number;
  isWinner: boolean;             // true if tied for highest score
  selections: Record<string, {   // presenterId as key
    episodeId: string;
    episodeText: string;
    wasCorrect: boolean;
  }>;
}
```

**Validation Rules**:
- `rank`: Must start at 1 and increment (with ties allowed)
- `isWinner`: Must be `true` for all participants with `totalScore === highestScore`
- `rankings`: Must be sorted by `totalScore` DESC, then by `nickname` ASC (for ties)
- `totalParticipants`: Must equal `rankings.length`

**Business Rules**:
- Only accessible when game status is '締切'
- Multiple participants can be winners (ties)
- Rankings sorted by score descending, then alphabetically for ties
- All participants visible to all users (no authorization filter)

**Ranking Algorithm**:
```typescript
1. Calculate all scores using ScoreDto logic
2. Sort by totalScore DESC, then nickname ASC
3. Assign ranks:
   - Same score = same rank
   - Next rank skips tied positions (e.g., 1, 1, 3, not 1, 1, 2)
4. Mark winners (rank === 1)
```

---

## Data Flow Diagrams

### P1: Response Status Flow

```
Moderator Request
    ↓
GET /api/games/[id]/dashboard
    ↓
GetResponseStatus Use Case
    ↓
Query: Game + Answers (count by gameId)
    ↓
Map to ResponseStatusDto
    ↓
Return: { participants: [...], submittedCount, allSubmitted }
```

### P2: Score Calculation Flow

```
User Request (Moderator or Participant)
    ↓
GET /api/games/[id]/scoreboard
    ↓
CalculateScores Use Case
    ↓
Query: Game (with presenters/episodes) + Answers (all for game)
    ↓
For each Answer:
  - For each presenter in selections
  - Compare selected episode with lie episode
  - Award 10 points if correct, 0 if incorrect
  - Sum total score
    ↓
Map to ScoreDto[]
    ↓
Return: [{ nickname, totalScore, details: [...] }]
```

### P3: Results Ranking Flow

```
User Request (Anyone)
    ↓
GET /api/games/[id]/results
    ↓
GetResults Use Case
    ↓
Call CalculateScores Use Case
    ↓
Sort by totalScore DESC, nickname ASC
    ↓
Assign ranks (handle ties)
    ↓
Mark winners (rank === 1)
    ↓
Map to RankingDto
    ↓
Return: { rankings: [...], highestScore, ... }
```

---

## Database Schema Impact

**No schema changes required**. All data derived from existing tables:

- `Game` table: Provides game metadata, presenters, episodes
- `Answer` table: Provides participant selections and timestamps

**Query Patterns**:

```sql
-- P1: Response Status
SELECT nickname, createdAt
FROM Answer
WHERE gameId = ?
ORDER BY nickname;

-- P2 & P3: Score Calculation
SELECT * FROM Game WHERE id = ?;  -- Includes presenters/episodes via Prisma relations
SELECT * FROM Answer WHERE gameId = ?;
```

**Indexes** (already exist):
- `Answer.gameId`: For filtering answers by game
- `Answer.sessionId + gameId`: For finding participant's answer

---

## State Transitions

### Game Status and Dashboard Access

| Game Status | Dashboard Available | Scoreboard Available | Results Available |
|-------------|---------------------|----------------------|-------------------|
| 準備中      | ❌ No responses yet | ❌ Game not started  | ❌ Not closed     |
| 出題中      | ✅ Track submissions| ❌ Game not closed   | ❌ Not closed     |
| 締切        | ❌ Phase ended      | ✅ Scores ready      | ✅ Rankings ready |

**Validation Errors**:
- Access dashboard when status ≠ '出題中' → `400 Game not accepting responses`
- Access scoreboard when status ≠ '締切' → `400 Game not closed`
- Access results when status ≠ '締切' → `400 Game not closed`

---

## Summary

- **No new entities**: Reuse Game and Answer
- **3 new DTOs**: ResponseStatusDto, ScoreDto, RankingDto
- **No schema changes**: All data calculated from existing tables
- **Clear boundaries**: Each DTO maps to one user story priority
- **Efficient queries**: 1-2 queries per use case
- **Simple validation**: Derived fields match business rules

Ready for contract design in Phase 1.
