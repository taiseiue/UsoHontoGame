# Data Model: Session Management and TOP Page

**Feature**: 001-session-top-page
**Date**: 2025-11-10
**Purpose**: Define domain entities, value objects, and data structures

## Overview

This document defines the domain model for session management and game display on the TOP page. The model follows Clean Architecture principles with domain entities independent of implementation details.

## Domain Entities

### Session Entity

Represents a user's persistent identity across browser sessions.

**Attributes**:
- `sessionId`: SessionId (value object) - Unique identifier for the session
- `nickname`: Nickname (value object) - User-chosen display name
- `createdAt`: Date - Timestamp when session was created

**Invariants** (enforced by entity):
- Session ID must be a valid nanoid (21 characters, URL-safe)
- Nickname must not be empty string (FR-014)
- Nickname must not exceed 50 characters (assumption from spec)
- Nickname can be duplicate across sessions (FR-015)
- Created timestamp must not be in the future

**State Transitions**:
```text
[No Session] --create()--> [Session without Nickname] --setNickname()--> [Complete Session]

[Complete Session] --expire()--> [No Session] (after 30 days)
```

**Validation Rules**:
```typescript
class Session {
  validate() {
    if (!this.sessionId.isValid()) {
      throw new InvalidSessionIdError();
    }
    if (this.nickname && this.nickname.isEmpty()) {
      throw new EmptyNicknameError(); // FR-014
    }
    if (this.nickname && this.nickname.length > 50) {
      throw new NicknameTooLongError();
    }
    if (this.createdAt > new Date()) {
      throw new InvalidTimestampError();
    }
  }
}
```

---

### Game Entity

Represents a game instance in the system.

**Attributes**:
- `id`: GameId (value object) - Unique identifier for the game
- `name`: string - Game display name
- `status`: GameStatus (value object) - Current state ('準備中' | '出題中' | '締切')
- `maxPlayers`: number - Maximum number of participants allowed
- `currentPlayers`: number - Number of players currently registered
- `episodes`: Episode[] - Array of episodes from presenters (not needed for TOP page)
- `createdAt`: Date - Timestamp when game was created
- `updatedAt`: Date - Timestamp of last update

**Invariants** (enforced by entity):
- Game ID must be a valid UUID
- Name must not be empty
- Status must be one of the valid GameStatus values
- Max players must be positive integer
- Current players cannot exceed max players
- Current players cannot be negative

**State Transitions**:
```text
[準備中] --startAcceptingResponses()--> [出題中] --closeGame()--> [締切]
   ↑
   └─────────────────────reopen()────────────────────────────────┘
```

**Derived Properties** (calculated, not stored):
- `availableSlots`: number = maxPlayers - currentPlayers (FR-010)
- `isAcceptingResponses`: boolean = (status === '出題中') (FR-007)

**Validation Rules**:
```typescript
class Game {
  validate() {
    if (!this.id.isValid()) {
      throw new InvalidGameIdError();
    }
    if (this.name.trim() === '') {
      throw new EmptyGameNameError();
    }
    if (this.maxPlayers <= 0) {
      throw new InvalidMaxPlayersError();
    }
    if (this.currentPlayers < 0) {
      throw new NegativePlayersError();
    }
    if (this.currentPlayers > this.maxPlayers) {
      throw new TooManyPlayersError();
    }
  }

  get availableSlots(): number {
    return this.maxPlayers - this.currentPlayers;
  }

  get isAcceptingResponses(): boolean {
    return this.status.value === '出題中';
  }
}
```

---

## Value Objects

Value objects are immutable objects defined by their attributes, with no unique identity.

### SessionId

**Purpose**: Encapsulate session identifier with validation

**Attributes**:
- `value`: string - The nanoid value (21 characters)

**Validation**:
- Must be exactly 21 characters long
- Must contain only URL-safe characters (A-Za-z0-9_-)

```typescript
class SessionId {
  private readonly _value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new InvalidSessionIdError(value);
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  private isValid(value: string): boolean {
    return /^[A-Za-z0-9_-]{21}$/.test(value);
  }

  equals(other: SessionId): boolean {
    return this._value === other._value;
  }
}
```

---

### Nickname

**Purpose**: Encapsulate user nickname with validation

**Attributes**:
- `value`: string - The nickname text

**Validation**:
- Must not be empty or only whitespace (FR-014)
- Must not exceed 50 characters
- Duplicates allowed (FR-015)

```typescript
class Nickname {
  private readonly _value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (trimmed === '') {
      throw new EmptyNicknameError();
    }
    if (trimmed.length > 50) {
      throw new NicknameTooLongError();
    }
    this._value = trimmed;
  }

  get value(): string {
    return this._value;
  }

  get length(): number {
    return this._value.length;
  }

  isEmpty(): boolean {
    return this._value.trim() === '';
  }

  equals(other: Nickname): boolean {
    return this._value === other._value;
  }
}
```

---

### GameId

**Purpose**: Encapsulate game identifier with validation

**Attributes**:
- `value`: string - UUID v4 format

**Validation**:
- Must be valid UUID v4 format

```typescript
class GameId {
  private readonly _value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new InvalidGameIdError(value);
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  private isValid(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  equals(other: GameId): boolean {
    return this._value === other._value;
  }
}
```

---

### GameStatus

**Purpose**: Encapsulate game status with type safety

**Attributes**:
- `value`: '準備中' | '出題中' | '締切'

**Valid Values**:
- `準備中` (In Preparation): Game is being set up, not visible on TOP page
- `出題中` (Accepting Responses): Game is active, visible on TOP page (FR-007)
- `締切` (Closed): Game has ended, not visible on TOP page

```typescript
type GameStatusValue = '準備中' | '出題中' | '締切';

class GameStatus {
  private readonly _value: GameStatusValue;

  constructor(value: GameStatusValue) {
    if (!this.isValid(value)) {
      throw new InvalidGameStatusError(value);
    }
    this._value = value;
  }

  get value(): GameStatusValue {
    return this._value;
  }

  private isValid(value: string): value is GameStatusValue {
    return ['準備中', '出題中', '締切'].includes(value);
  }

  isAcceptingResponses(): boolean {
    return this._value === '出題中';
  }

  equals(other: GameStatus): boolean {
    return this._value === other._value;
  }
}
```

---

## Data Transfer Objects (DTOs)

DTOs define the contract for data transfer between layers. They are plain objects without business logic.

### SessionDto

**Purpose**: Transfer session data from application layer to presentation layer

```typescript
interface SessionDto {
  sessionId: string;        // Unwrapped SessionId value
  nickname: string | null;  // null if nickname not yet set
  createdAt: string;        // ISO 8601 format
}
```

**Mapping**:
```typescript
// Entity → DTO
function toSessionDto(session: Session): SessionDto {
  return {
    sessionId: session.sessionId.value,
    nickname: session.nickname?.value ?? null,
    createdAt: session.createdAt.toISOString(),
  };
}

// DTO → Entity
function toSessionEntity(dto: SessionDto): Session {
  return new Session(
    new SessionId(dto.sessionId),
    dto.nickname ? new Nickname(dto.nickname) : null,
    new Date(dto.createdAt)
  );
}
```

---

### GameDto

**Purpose**: Transfer game summary data for TOP page display

```typescript
interface GameDto {
  id: string;              // UUID
  name: string;            // Game display name
  availableSlots: number;  // Calculated: maxPlayers - currentPlayers (FR-010)
}
```

**Note**: DTO only includes fields needed for TOP page display (FR-009, FR-010). Full game entity has additional fields not exposed to TOP page.

**Mapping**:
```typescript
// Entity → DTO (for TOP page)
function toGameDto(game: Game): GameDto {
  return {
    id: game.id.value,
    name: game.name,
    availableSlots: game.availableSlots, // Derived property
  };
}
```

---

## Repository Interfaces

Repositories abstract data access, allowing implementation details to vary.

### ISessionRepository

**Purpose**: Abstract session storage operations

```typescript
interface ISessionRepository {
  // Create new session
  create(session: Session): Promise<void>;

  // Find session by ID
  findById(sessionId: SessionId): Promise<Session | null>;

  // Update existing session (for nickname changes)
  update(session: Session): Promise<void>;

  // Delete session (for logout or expiration)
  delete(sessionId: SessionId): Promise<void>;
}
```

**Implementation Note**: CookieSessionRepository will use Next.js `cookies()` API from `next/headers`.

---

### IGameRepository

**Purpose**: Abstract game storage operations

```typescript
interface IGameRepository {
  // Find all games (for testing/admin)
  findAll(): Promise<Game[]>;

  // Find games by status (FR-007: filter by '出題中')
  findByStatus(status: GameStatus): Promise<Game[]>;

  // Find single game by ID
  findById(id: GameId): Promise<Game | null>;

  // Create new game (for game management feature)
  create(game: Game): Promise<void>;

  // Update game (for status changes)
  update(game: Game): Promise<void>;

  // Delete game
  delete(id: GameId): Promise<void>;
}
```

**Implementation Note**: InMemoryGameRepository will use a Map<string, Game> for MVP storage.

---

## Relationships

```text
┌─────────────┐
│   Session   │
│─────────────│
│ sessionId   │──┐
│ nickname    │  │
│ createdAt   │  │
└─────────────┘  │
                 │ 1:N (future: user can participate in multiple games)
                 │
                 ▼
         ┌──────────────┐
         │     Game     │
         │──────────────│
         │ id           │
         │ name         │
         │ status       │
         │ maxPlayers   │
         │ currentPlayers│
         └──────────────┘
```

**Current Scope**: This feature only deals with Session creation and Game display. The relationship between Session and Game (participation) is out of scope and will be implemented in the "Player Participation" feature.

---

## Storage Mapping

### Cookie Storage (Session)

**Cookies**:
1. `sessionId` cookie
   - Value: SessionId.value (21-char nanoid)
   - Flags: HttpOnly, Secure, SameSite=Lax
   - Max-Age: 2592000 (30 days)

2. `nickname` cookie
   - Value: Nickname.value (1-50 chars)
   - Flags: Secure, SameSite=Lax (NOT HttpOnly - client needs to read for display)
   - Max-Age: 2592000 (30 days)

**Rationale**: Session ID must be HTTP-only for security (prevents XSS), but nickname can be readable by client since it's non-sensitive display data.

### In-Memory Storage (Game)

**Structure**:
```typescript
// InMemoryGameRepository implementation
class InMemoryGameRepository implements IGameRepository {
  private games: Map<string, Game> = new Map();

  async findByStatus(status: GameStatus): Promise<Game[]> {
    return Array.from(this.games.values())
      .filter(game => game.status.equals(status));
  }
}
```

**Singleton**: Game repository will be a singleton instance to maintain state across requests in MVP.

---

## Validation Summary

| Rule | Entity/VO | Validation Point | Error Type |
|------|-----------|------------------|------------|
| Session ID format | SessionId | Constructor | InvalidSessionIdError |
| Nickname non-empty | Nickname | Constructor | EmptyNicknameError (FR-014) |
| Nickname max length | Nickname | Constructor | NicknameTooLongError |
| Game ID format | GameId | Constructor | InvalidGameIdError |
| Game status validity | GameStatus | Constructor | InvalidGameStatusError |
| Max players positive | Game | validate() method | InvalidMaxPlayersError |
| Current ≤ max players | Game | validate() method | TooManyPlayersError |

All validation happens at entity/value object construction or mutation, enforcing invariants at domain layer.

---

## Summary

This data model provides:
- **Type Safety**: Value objects enforce validation at domain layer
- **Clean Architecture**: Entities independent of infrastructure (cookies, in-memory storage)
- **Testability**: DTOs enable easy serialization for testing
- **Maintainability**: Clear contracts via repository interfaces
- **Spec Compliance**: Covers all functional requirements (FR-001 through FR-016)

Next steps: Define API contracts (contracts/) and generate tasks (tasks.md) based on this model.
