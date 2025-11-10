# Research: Session Management and TOP Page

**Feature**: 001-session-top-page
**Date**: 2025-11-10
**Purpose**: Research technical approaches for session management and TOP page implementation

## Research Questions

This document addresses the technical decisions and best practices needed to implement session management and the TOP page following the project's Clean Architecture and component architecture principles.

## 1. Cookie-Based Session Management in Next.js 16

### Decision
Use Next.js Server Actions with the `cookies()` API from `next/headers` for session management, storing both session ID and nickname in separate cookies.

### Rationale
- **Native Integration**: Next.js 16 provides built-in cookie management through `next/headers` with type-safe APIs
- **Security**: Supports HTTP-only, Secure, and SameSite flags natively
- **Server Components Compatible**: Works seamlessly with React Server Components for SSR requirements
- **No External Dependencies**: Avoids adding session libraries like `next-auth` or `iron-session` which are over-engineered for this simple use case
- **Aligned with Spec**: Meets FR-001 (secure, HTTP-only cookies) and FR-004 (persistent cookies)

### Alternatives Considered

**Alternative 1: next-auth/NextAuth.js**
- **Rejected Because**: Designed for OAuth/authentication flows, not simple session management. Adds unnecessary complexity and dependencies for storing just session ID + nickname.

**Alternative 2: iron-session**
- **Rejected Because**: While lightweight, it encrypts cookies which adds overhead we don't need. Session ID is already a UUID (not sensitive), and nickname is user-chosen (public). HTTP-only flag provides sufficient security.

**Alternative 3: JWT tokens in localStorage**
- **Rejected Because**: Violates FR-001 requirement for HTTP-only cookies (security concern: XSS attacks). Also breaks SSR/no-JS requirement (FR-016).

### Implementation Approach

```typescript
// Server-side cookie operations using next/headers
import { cookies } from 'next/headers';

// Set cookies with proper flags
const cookieStore = cookies();
cookieStore.set('sessionId', id, {
  httpOnly: true,        // FR-001: Secure, HTTP-only cookie
  secure: true,          // HTTPS only in production
  sameSite: 'lax',       // CSRF protection
  maxAge: 30 * 24 * 60 * 60,  // FR-005: 30 days
  path: '/',
});
```

**Key Points**:
- Session ID: HTTP-only (prevents XSS access)
- Nickname: Regular cookie (accessible to client for display)
- Both: 30-day expiration, SameSite=Lax, Secure in production

## 2. Session ID Generation Strategy

### Decision
Use the `nanoid` library (already in dependencies) to generate cryptographically secure, URL-safe session IDs.

### Rationale
- **Already Available**: `nanoid` 5.1.6 is already listed in package.json dependencies
- **Cryptographically Secure**: Uses crypto.getRandomValues() for high-quality randomness
- **Collision Resistant**: 21-character default provides ~149 years needed to have 1% probability of at least one collision at 1000 IDs/hour
- **URL-Safe**: No special characters that need escaping in cookies or URLs
- **Performance**: 2x faster than UUID v4 and 40% smaller

### Alternatives Considered

**Alternative 1: crypto.randomUUID() (native Node.js)**
- **Rejected Because**: While UUID v4 is standard and secure, it's longer (36 characters vs 21) and includes dashes that don't add value. Nanoid is already a dependency and more efficient.

**Alternative 2: Custom ID generation with crypto.getRandomValues()**
- **Rejected Because**: Reinventing the wheel. Nanoid is well-tested, audited, and handles edge cases (different environments, fallbacks).

### Implementation Approach

```typescript
import { nanoid } from 'nanoid';

// Generate session ID
const sessionId = nanoid(); // 21-character URL-safe ID
// Example: "V1StGXR8_Z5jdHi6B-myT"
```

## 3. Server Component vs Client Component Strategy

### Decision
- **TOP Page (page.tsx)**: Server Component that fetches game data and renders game list server-side
- **Nickname Input**: Client Component with "use client" directive for form interactivity
- **Game List/Cards**: Server Components (read-only display)
- **Navigation Links**: Server Components (Next.js Link is RSC-compatible)

### Rationale
- **Follows Constitution Principle VII**: "Server Components First" - use Server Components for data fetching and static content
- **Meets FR-016**: Server-side rendering ensures TOP page works without JavaScript
- **Performance**: Reduces client bundle size by keeping game data fetching on server
- **SEO-Friendly**: Game list is rendered server-side, visible to crawlers

### Alternatives Considered

**Alternative 1: Full Client Component approach**
- **Rejected Because**: Violates constitution's "Server Components First" principle. Increases bundle size unnecessarily when most of the page is static (game list display).

**Alternative 2: Full Server Component with form action**
- **Rejected Because**: While Server Actions could handle nickname submission, the form needs real-time validation (FR-014: empty string validation) which is better suited for client-side hooks with immediate feedback.

### Implementation Approach

```typescript
// app/page.tsx - Server Component (default)
import { cookies } from 'next/headers';
import { NicknameInput } from '@/components/domain/session/NicknameInput';
import { GameList } from '@/components/domain/game/GameList';

export default async function TopPage() {
  const cookieStore = cookies();
  const nickname = cookieStore.get('nickname')?.value;

  if (!nickname) {
    return <NicknameInput />; // Client Component for form
  }

  const games = await getAvailableGames(); // Server-side data fetch
  return <GameList games={games} />; // Server Component for display
}

// components/domain/session/NicknameInput.tsx - Client Component
'use client';
import { useNicknameForm } from './hooks/useNicknameForm';

export function NicknameInput() {
  const { nickname, error, handleChange, handleSubmit } = useNicknameForm();
  // Client-side form logic with immediate validation
}
```

## 4. Game Filtering and Data Access Pattern

### Decision
Implement Repository pattern with an in-memory game repository that filters by status at the data access layer.

### Rationale
- **Clean Architecture Compliance**: Follows constitution's Clean Architecture principle (I) - repository implements IGameRepository interface
- **Testability**: Repository can be easily mocked for testing use cases
- **Single Responsibility**: Filtering logic lives in repository layer, not in UI components
- **Meets FR-007/FR-008**: Filtering for "出題中" status is encapsulated in GetAvailableGames use case

### Alternatives Considered

**Alternative 1: Filter in UI component**
- **Rejected Because**: Violates Clean Architecture. Business logic (what games are "available") should be in application/domain layer, not presentation layer.

**Alternative 2: Database query with WHERE clause**
- **Rejected Because**: Spec mandates in-memory storage for MVP. However, repository pattern makes future migration to database seamless - just swap implementation.

### Implementation Approach

```typescript
// server/domain/repositories/IGameRepository.ts
export interface IGameRepository {
  findByStatus(status: GameStatus): Promise<Game[]>;
  findAll(): Promise<Game[]>;
  findById(id: string): Promise<Game | null>;
}

// server/infrastructure/repositories/InMemoryGameRepository.ts
export class InMemoryGameRepository implements IGameRepository {
  async findByStatus(status: GameStatus): Promise<Game[]> {
    return this.games.filter(game => game.status === status);
  }
}

// server/application/use-cases/games/GetAvailableGames.ts
export class GetAvailableGames {
  constructor(private gameRepo: IGameRepository) {}

  async execute(): Promise<GameDto[]> {
    const games = await this.gameRepo.findByStatus('出題中');
    return games.map(game => this.toDto(game));
  }
}
```

## 5. Form Validation Strategy

### Decision
Implement client-side validation in custom hook (useNicknameForm) with immediate feedback, backed by server-side validation in Server Action.

### Rationale
- **Follows Constitution Principle III**: All component logic in custom hooks (useNicknameForm)
- **User Experience**: Immediate feedback on empty nickname (FR-014) without server round-trip
- **Security**: Server-side validation prevents bypass of client-side checks
- **Meets SC-001**: 30-second setup time requires fast feedback (client-side) without page refreshes

### Alternatives Considered

**Alternative 1: Server-only validation**
- **Rejected Because**: Slow user experience - requires form submission and page reload to show validation errors. Doesn't meet 30-second setup time (SC-001).

**Alternative 2: React Hook Form + Zod**
- **Rejected Because**: Over-engineered for a single text input with one validation rule (non-empty). Adds unnecessary dependencies when a simple custom hook suffices.

### Implementation Approach

```typescript
// components/domain/session/hooks/useNicknameForm.ts
export function useNicknameForm() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleChange = (value: string) => {
    setNickname(value);
    // FR-014: Validate non-empty
    if (value.trim() === '') {
      setError('ニックネームを入力してください');
    } else if (value.length > 50) {
      setError('ニックネームは50文字以内で入力してください');
    } else {
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (nickname.trim() === '') return;
    await setNicknameAction(nickname); // Server Action
  };

  return { nickname, error, handleChange, handleSubmit };
}
```

## 6. Type Definitions and Shared Types

### Decision
Define shared types in `src/types/` directory, with separate files for session and game domains. Use DTOs for data transfer between layers.

### Rationale
- **Follows Constitution Principle V**: Type Safety - explicit types for all data structures
- **Clean Architecture**: DTOs prevent domain entities from leaking to presentation layer
- **Maintainability**: Centralized type definitions serve as documentation
- **TypeScript Best Practice**: Separation of concerns - types directory is standard in TS projects

### Alternatives Considered

**Alternative 1: Inline types in components/use cases**
- **Rejected Because**: Causes duplication and inconsistency. Violates DRY principle. Makes refactoring difficult.

**Alternative 2: Use domain entities directly in UI**
- **Rejected Because**: Violates Clean Architecture. Domain entities may have methods and validation logic not needed in UI. DTOs provide clean data contracts.

### Implementation Approach

```typescript
// types/session.ts
export type SessionId = string; // UUID from nanoid
export type Nickname = string;

export interface SessionData {
  sessionId: SessionId;
  nickname: Nickname;
  createdAt: Date;
}

// types/game.ts
export type GameStatus = '準備中' | '出題中' | '締切';

export interface GameSummary {
  id: string;
  name: string;
  status: GameStatus;
  maxPlayers: number;
  currentPlayers: number;
}

// server/application/dto/SessionDto.ts
export interface SessionDto {
  sessionId: string;
  nickname: string;
}

// server/application/dto/GameDto.ts
export interface GameDto {
  id: string;
  name: string;
  availableSlots: number;
}
```

## 7. Testing Strategy

### Decision
Follow TDD with three test layers:
1. **Unit Tests**: Domain entities, use cases, hooks (Vitest)
2. **Integration Tests**: API routes, repository integration (Vitest with test server)
3. **E2E Tests**: Full user journeys (Playwright)

### Rationale
- **Follows Constitution Principle IV**: TDD is mandatory - write tests first (Red-Green-Refactor)
- **Comprehensive Coverage**: Unit tests verify business logic, integration tests verify layer interaction, E2E tests verify user experience
- **Fast Feedback**: Unit tests run in milliseconds, integration tests in seconds, E2E as needed

### Test Coverage Plan

| Component | Test Type | Framework | Priority |
|-----------|-----------|-----------|----------|
| Session entity validation | Unit | Vitest | P1 |
| Game entity filtering | Unit | Vitest | P1 |
| CreateSession use case | Unit | Vitest | P1 |
| GetAvailableGames use case | Unit | Vitest | P1 |
| useNicknameForm hook | Unit | Vitest + RTL | P1 |
| Session cookie operations | Integration | Vitest | P1 |
| TOP page rendering | Integration | Vitest + RTL | P2 |
| Full session creation flow | E2E | Playwright | P2 |
| Game list display | E2E | Playwright | P2 |

### Implementation Approach

```typescript
// tests/unit/use-cases/CreateSession.test.ts - Write FIRST (Red)
describe('CreateSession', () => {
  it('should create session with unique ID', async () => {
    const useCase = new CreateSession(mockRepo);
    const result = await useCase.execute();
    expect(result.sessionId).toBeDefined();
    expect(result.sessionId).toHaveLength(21); // nanoid default
  });
});

// Then implement use case (Green)
// Then refactor while keeping tests green (Refactor)
```

## Summary of Technical Decisions

| Area | Decision | Key Benefit |
|------|----------|-------------|
| **Session Storage** | Next.js cookies() API with HTTP-only flags | Native, secure, SSR-compatible |
| **Session ID** | nanoid library (21 chars) | Already available, secure, URL-safe |
| **Component Strategy** | Server Components for data, Client for forms | Performance, SEO, follows constitution |
| **Data Access** | Repository pattern with in-memory storage | Clean Architecture, testable, future-proof |
| **Validation** | Client hook + Server Action | Fast feedback, security, follows constitution |
| **Types** | Separate types/ directory with DTOs | Type safety, clean contracts, maintainability |
| **Testing** | TDD with unit/integration/E2E layers | Constitution compliance, comprehensive coverage |

All decisions align with the project constitution's core principles (Clean Architecture, Component Architecture, Custom Hooks, TDD, Type Safety, Server Components First) and meet the functional requirements defined in the specification.
