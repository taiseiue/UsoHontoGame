# API Contracts: Results Dashboard

**Feature**: 006-results-dashboard
**Date**: 2025-11-21
**Format**: REST API with Next.js Server Components + Actions

---

## Overview

This feature uses **Next.js App Router patterns**:
- **Server Components** for initial data fetching (SSR)
- **Client Components** for real-time polling (response status only)
- **Server Actions** if mutations needed (not required for this feature)

All endpoints follow REST conventions and return JSON responses.

---

## Endpoint 1: Response Status Dashboard (P1)

### GET `/api/games/[gameId]/dashboard`

**Purpose**: Get real-time response submission status for moderators

**Priority**: P1 (Core functionality)

**Authentication**: Session-based (requires creator session)

**Authorization**: Only game creator can access

---

#### Request

**Method**: `GET`

**Path Parameters**:
```typescript
{
  gameId: string;  // Game identifier (nanoid)
}
```

**Query Parameters**: None

**Headers**:
```
Cookie: session=<session-id>
```

**Example**:
```
GET /api/games/abc123/dashboard
Cookie: session=xyz789
```

---

#### Response: Success (200 OK)

```typescript
{
  gameId: string;
  gameName: string;
  gameStatus: "出題中";                    // Must be this status
  participants: Array<{
    nickname: string;
    hasSubmitted: boolean;
    submittedAt?: string;                 // ISO 8601, only if hasSubmitted
  }>;
  totalParticipants: number;
  submittedCount: number;
  allSubmitted: boolean;
  lastUpdated: string;                    // ISO 8601
}
```

**Example**:
```json
{
  "gameId": "abc123",
  "gameName": "Team Building Game",
  "gameStatus": "出題中",
  "participants": [
    {
      "nickname": "Alice",
      "hasSubmitted": true,
      "submittedAt": "2025-11-21T10:30:00Z"
    },
    {
      "nickname": "Bob",
      "hasSubmitted": false
    },
    {
      "nickname": "Charlie",
      "hasSubmitted": true,
      "submittedAt": "2025-11-21T10:25:00Z"
    }
  ],
  "totalParticipants": 3,
  "submittedCount": 2,
  "allSubmitted": false,
  "lastUpdated": "2025-11-21T10:32:00Z"
}
```

---

#### Response: Errors

**400 Bad Request** - Game not in correct status
```json
{
  "error": "Game not accepting responses",
  "details": "Dashboard only available when game status is '出題中'"
}
```

**401 Unauthorized** - No session
```json
{
  "error": "Unauthorized",
  "details": "Session required"
}
```

**403 Forbidden** - Not game creator
```json
{
  "error": "Forbidden",
  "details": "Only game creator can view response status"
}
```

**404 Not Found** - Game doesn't exist
```json
{
  "error": "Game not found",
  "details": "No game with ID abc123"
}
```

---

## Endpoint 2: Scoreboard (P2)

### GET `/api/games/[gameId]/scoreboard`

**Purpose**: Get calculated scores with answer details

**Priority**: P2 (Score display)

**Authentication**: Session-based

**Authorization**: Game creator OR any participant

---

#### Request

**Method**: `GET`

**Path Parameters**:
```typescript
{
  gameId: string;  // Game identifier (nanoid)
}
```

**Query Parameters**: None

**Headers**:
```
Cookie: session=<session-id>
```

**Example**:
```
GET /api/games/abc123/scoreboard
Cookie: session=xyz789
```

---

#### Response: Success (200 OK)

```typescript
{
  gameId: string;
  gameName: string;
  scores: Array<{
    nickname: string;
    totalScore: number;
    details: Array<{
      presenterId: string;
      presenterNickname: string;
      selectedEpisodeId: string;
      selectedEpisodeText: string;
      correctEpisodeId: string;
      wasCorrect: boolean;
      pointsEarned: number;               // 0 or 10
    }>;
  }>;
  calculatedAt: string;                   // ISO 8601
}
```

**Example**:
```json
{
  "gameId": "abc123",
  "gameName": "Team Building Game",
  "scores": [
    {
      "nickname": "Alice",
      "totalScore": 30,
      "details": [
        {
          "presenterId": "p1",
          "presenterNickname": "太郎",
          "selectedEpisodeId": "e1",
          "selectedEpisodeText": "I have a pet cat",
          "correctEpisodeId": "e1",
          "wasCorrect": true,
          "pointsEarned": 10
        },
        {
          "presenterId": "p2",
          "presenterNickname": "花子",
          "selectedEpisodeId": "e5",
          "selectedEpisodeText": "I like sushi",
          "correctEpisodeId": "e4",
          "wasCorrect": false,
          "pointsEarned": 0
        }
      ]
    },
    {
      "nickname": "Bob",
      "totalScore": 20,
      "details": [ /* ... */ ]
    }
  ],
  "calculatedAt": "2025-11-21T11:00:00Z"
}
```

---

#### Response: Errors

**400 Bad Request** - Game not closed
```json
{
  "error": "Game not closed",
  "details": "Scoreboard only available when game status is '締切'"
}
```

**401 Unauthorized** - No session
```json
{
  "error": "Unauthorized",
  "details": "Session required"
}
```

**404 Not Found** - Game doesn't exist
```json
{
  "error": "Game not found",
  "details": "No game with ID abc123"
}
```

---

## Endpoint 3: Final Results (P3)

### GET `/api/games/[gameId]/results`

**Purpose**: Get final rankings with winner highlighting

**Priority**: P3 (Winner celebration)

**Authentication**: Session-based

**Authorization**: Public to all participants (no restriction)

---

#### Request

**Method**: `GET`

**Path Parameters**:
```typescript
{
  gameId: string;  // Game identifier (nanoid)
}
```

**Query Parameters**: None

**Headers**:
```
Cookie: session=<session-id>
```

**Example**:
```
GET /api/games/abc123/results
Cookie: session=xyz789
```

---

#### Response: Success (200 OK)

```typescript
{
  gameId: string;
  gameName: string;
  rankings: Array<{
    rank: number;                         // 1-based, ties allowed
    nickname: string;
    totalScore: number;
    isWinner: boolean;                    // true if rank === 1
    selections: Record<string, {          // presenterId as key
      episodeId: string;
      episodeText: string;
      wasCorrect: boolean;
    }>;
  }>;
  totalParticipants: number;
  highestScore: number;
  calculatedAt: string;                   // ISO 8601
}
```

**Example** (with tie for first place):
```json
{
  "gameId": "abc123",
  "gameName": "Team Building Game",
  "rankings": [
    {
      "rank": 1,
      "nickname": "Alice",
      "totalScore": 30,
      "isWinner": true,
      "selections": {
        "p1": {
          "episodeId": "e1",
          "episodeText": "I have a pet cat",
          "wasCorrect": true
        },
        "p2": {
          "episodeId": "e5",
          "episodeText": "I like sushi",
          "wasCorrect": false
        }
      }
    },
    {
      "rank": 1,
      "nickname": "Charlie",
      "totalScore": 30,
      "isWinner": true,
      "selections": { /* ... */ }
    },
    {
      "rank": 3,
      "nickname": "Bob",
      "totalScore": 20,
      "isWinner": false,
      "selections": { /* ... */ }
    }
  ],
  "totalParticipants": 3,
  "highestScore": 30,
  "calculatedAt": "2025-11-21T11:00:00Z"
}
```

---

#### Response: Errors

**400 Bad Request** - Game not closed
```json
{
  "error": "Game not closed",
  "details": "Results only available when game status is '締切'"
}
```

**401 Unauthorized** - No session
```json
{
  "error": "Unauthorized",
  "details": "Session required"
}
```

**404 Not Found** - Game doesn't exist
```json
{
  "error": "Game not found",
  "details": "No game with ID abc123"
}
```

---

## Implementation Notes

### Next.js Route Handlers

All endpoints implemented as Route Handlers in App Router:

```typescript
// src/app/api/games/[gameId]/dashboard/route.ts
export async function GET(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  // Implementation using GetResponseStatus use case
}

// src/app/api/games/[gameId]/scoreboard/route.ts
export async function GET(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  // Implementation using CalculateScores use case
}

// src/app/api/games/[gameId]/results/route.ts
export async function GET(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  // Implementation using GetResults use case
}
```

### Error Handling Pattern

All endpoints use consistent error response format:

```typescript
return NextResponse.json(
  { error: string, details: string },
  { status: number }
);
```

### Session Validation

Session cookie checked on all requests:

```typescript
const sessionId = cookies().get('session')?.value;
if (!sessionId) {
  return NextResponse.json(
    { error: 'Unauthorized', details: 'Session required' },
    { status: 401 }
  );
}
```

### Performance Considerations

- **Caching**: None required (data changes frequently)
- **Pagination**: Not needed (max 100 participants)
- **Rate Limiting**: Consider for polling endpoint (dashboard)

---

## Status Code Summary

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid game status for operation |
| 401 | Unauthorized | Missing session |
| 403 | Forbidden | Not authorized for operation |
| 404 | Not Found | Game doesn't exist |
| 500 | Internal Server Error | Unexpected error |

---

## Testing Checklist

- [ ] Dashboard returns 400 when game status ≠ '出題中'
- [ ] Dashboard returns 403 when requester ≠ creator
- [ ] Dashboard counts submissions correctly
- [ ] Dashboard sets allSubmitted when all participants submitted
- [ ] Scoreboard returns 400 when game status ≠ '締切'
- [ ] Scoreboard calculates scores correctly (10 points per correct)
- [ ] Scoreboard includes all presenter details
- [ ] Results returns 400 when game status ≠ '締切'
- [ ] Results ranks participants correctly (with ties)
- [ ] Results marks all tied participants as winners
- [ ] All endpoints return 401 without session
- [ ] All endpoints return 404 for non-existent game
