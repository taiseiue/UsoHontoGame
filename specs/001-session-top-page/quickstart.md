# Quickstart Guide: Session Management and TOP Page

**Feature**: 001-session-top-page
**Branch**: `001-session-top-page`
**Date**: 2025-11-10

## Overview

This guide provides a quick reference for implementing the session management and TOP page feature. It assumes you've read the specification, research, and data model documents.

## Prerequisites

- Node.js 20+ installed
- Repository cloned and on branch `001-session-top-page`
- Dependencies installed: `npm install`
- TypeScript, Next.js 16, React 19, Vitest configured (already in package.json)

## Development Workflow

This feature follows Test-Driven Development (TDD) as mandated by the project constitution. The implementation order is:

1. **Domain Layer** (entities, value objects) with unit tests
2. **Application Layer** (use cases, DTOs) with unit tests
3. **Infrastructure Layer** (repositories) with unit tests
4. **Presentation Layer** (components, actions) with integration tests
5. **E2E Tests** (full user journeys)

**Remember**: Write tests FIRST (Red), then implement (Green), then refactor (Refactor).

## File Structure Quick Reference

```text
src/
├── types/
│   ├── session.ts          # SessionData, SessionId, Nickname types
│   └── game.ts             # GameSummary, GameStatus types
├── server/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Session.ts           # START HERE (Day 1)
│   │   │   └── Game.ts
│   │   ├── value-objects/
│   │   │   ├── SessionId.ts
│   │   │   ├── Nickname.ts
│   │   │   ├── GameId.ts
│   │   │   └── GameStatus.ts
│   │   └── repositories/
│   │       ├── ISessionRepository.ts
│   │       └── IGameRepository.ts
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── session/
│   │   │   │   ├── CreateSession.ts     # Day 2
│   │   │   │   ├── ValidateSession.ts
│   │   │   │   └── SetNickname.ts
│   │   │   └── games/
│   │   │       └── GetAvailableGames.ts
│   │   └── dto/
│   │       ├── SessionDto.ts
│   │       └── GameDto.ts
│   └── infrastructure/
│       └── repositories/
│           ├── CookieSessionRepository.ts  # Day 3
│           └── InMemoryGameRepository.ts
├── lib/
│   ├── cookies.ts          # Cookie helper functions
│   └── constants.ts        # Cookie names, expiration
├── app/
│   ├── actions/
│   │   └── session.ts      # Server Actions (Day 4)
│   └── page.tsx            # TOP page (Day 5)
├── components/
│   ├── domain/
│   │   ├── session/
│   │   │   ├── NicknameInput.tsx          # Day 5
│   │   │   └── hooks/
│   │   │       └── useNicknameForm.ts
│   │   └── game/
│   │       ├── GameList.tsx
│   │       └── GameCard.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Link.tsx

tests/
├── unit/
│   ├── domain/
│   │   ├── Session.test.ts              # WRITE FIRST (Day 1)
│   │   ├── Game.test.ts
│   │   ├── SessionId.test.ts
│   │   ├── Nickname.test.ts
│   │   ├── GameId.test.ts
│   │   └── GameStatus.test.ts
│   ├── use-cases/
│   │   ├── CreateSession.test.ts        # Day 2
│   │   ├── ValidateSession.test.ts
│   │   ├── SetNickname.test.ts
│   │   └── GetAvailableGames.test.ts
│   └── hooks/
│       └── useNicknameForm.test.ts
├── integration/
│   ├── repositories/
│   │   ├── CookieSessionRepository.test.ts   # Day 3
│   │   └── InMemoryGameRepository.test.ts
│   └── actions/
│       └── session.test.ts                   # Day 4
└── e2e/
    └── top-page.spec.ts                      # Day 6
```

## Implementation Checklist

### Phase 1: Domain Layer (Day 1) - P1

- [ ] Write `SessionId.test.ts` - Test 21-char nanoid validation
- [ ] Implement `SessionId` value object
- [ ] Write `Nickname.test.ts` - Test empty/length validation
- [ ] Implement `Nickname` value object
- [ ] Write `GameId.test.ts` - Test UUID validation
- [ ] Implement `GameId` value object
- [ ] Write `GameStatus.test.ts` - Test valid status values
- [ ] Implement `GameStatus` value object
- [ ] Write `Session.test.ts` - Test entity invariants
- [ ] Implement `Session` entity
- [ ] Write `Game.test.ts` - Test entity invariants
- [ ] Implement `Game` entity
- [ ] Define repository interfaces (`ISessionRepository`, `IGameRepository`)

**Commit**: "feat: add domain entities and value objects for session management"

### Phase 2: Application Layer (Day 2) - P1

- [ ] Define DTOs (`SessionDto`, `GameDto`)
- [ ] Write `CreateSession.test.ts` - Test session creation logic
- [ ] Implement `CreateSession` use case
- [ ] Write `ValidateSession.test.ts` - Test session validation
- [ ] Implement `ValidateSession` use case
- [ ] Write `SetNickname.test.ts` - Test nickname setting
- [ ] Implement `SetNickname` use case
- [ ] Write `GetAvailableGames.test.ts` - Test game filtering
- [ ] Implement `GetAvailableGames` use case

**Commit**: "feat: add use cases for session and game management"

### Phase 3: Infrastructure Layer (Day 3) - P1

- [ ] Define constants (`lib/constants.ts`: cookie names, max age)
- [ ] Implement cookie helpers (`lib/cookies.ts`)
- [ ] Write `CookieSessionRepository.test.ts` - Mock next/headers
- [ ] Implement `CookieSessionRepository`
- [ ] Write `InMemoryGameRepository.test.ts` - Test filtering
- [ ] Implement `InMemoryGameRepository` with singleton pattern

**Commit**: "feat: add repository implementations for session and game storage"

### Phase 4: Server Actions (Day 4) - P1

- [ ] Write `session.test.ts` (integration) - Test action behavior
- [ ] Implement `createSessionAction` in `app/actions/session.ts`
- [ ] Implement `setNicknameAction` in `app/actions/session.ts`
- [ ] Implement `validateSessionAction` in `app/actions/session.ts`

**Commit**: "feat: add server actions for session management"

### Phase 5: UI Components (Day 5) - P2

- [ ] Implement UI components (`Button`, `Input`, `Link`)
- [ ] Write `useNicknameForm.test.ts` - Test form logic
- [ ] Implement `useNicknameForm` hook
- [ ] Implement `NicknameInput` component (Client Component)
- [ ] Implement `GameCard` component (Server Component)
- [ ] Implement `GameList` component (Server Component)
- [ ] Update `app/page.tsx` - TOP page with conditional rendering
- [ ] Add basic Tailwind styling

**Commit**: "feat: add TOP page with session and game display"

### Phase 6: E2E Tests (Day 6) - P2

- [ ] Write `top-page.spec.ts` - User Story 1 (session creation)
- [ ] Write `top-page.spec.ts` - User Story 2 (browse games)
- [ ] Write `top-page.spec.ts` - User Story 3 (navigate to dashboard)
- [ ] Write `top-page.spec.ts` - User Story 4 (navigate to game management)
- [ ] Verify all acceptance scenarios pass

**Commit**: "test: add e2e tests for TOP page user journeys"

### Phase 7: Polish (Day 7) - P3

- [ ] Add navigation links to dashboard and game management (P3)
- [ ] Improve styling and responsive design
- [ ] Add empty state for no games
- [ ] Verify no-JavaScript functionality (FR-016)
- [ ] Run full test suite and verify coverage
- [ ] Update CLAUDE.md if new patterns introduced

**Commit**: "feat: add navigation and polish TOP page UI"

## Running Tests

```bash
# Unit tests (watch mode during development)
npm test

# Unit tests (single run)
npm run test:run

# Integration tests (requires test server)
npm run test:integration

# E2E tests (Playwright)
npm run test:e2e

# All tests with coverage
npm run test:coverage
```

## Key Code Snippets

### 1. Value Object Pattern

```typescript
// src/server/domain/value-objects/SessionId.ts
export class SessionId {
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

### 2. Use Case Pattern

```typescript
// src/server/application/use-cases/session/CreateSession.ts
export class CreateSession {
  constructor(private sessionRepo: ISessionRepository) {}

  async execute(): Promise<SessionDto> {
    const sessionId = new SessionId(nanoid());
    const session = new Session(sessionId, null, new Date());

    await this.sessionRepo.create(session);

    return {
      sessionId: sessionId.value,
      nickname: null,
      createdAt: session.createdAt.toISOString(),
    };
  }
}
```

### 3. Server Action Pattern

```typescript
// src/app/actions/session.ts
'use server';

import { cookies } from 'next/headers';
import { CreateSession } from '@/server/application/use-cases/session/CreateSession';

export async function createSessionAction() {
  try {
    const useCase = new CreateSession(sessionRepository);
    const result = await useCase.execute();

    const cookieStore = cookies();
    cookieStore.set('sessionId', result.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return { success: true, sessionId: result.sessionId };
  } catch (error) {
    return { success: false, error: 'SESSION_CREATION_FAILED' };
  }
}
```

### 4. Custom Hook Pattern

```typescript
// src/components/domain/session/hooks/useNicknameForm.ts
'use client';

import { useState } from 'react';
import { setNicknameAction } from '@/app/actions/session';

export function useNicknameForm() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (value: string) => {
    setNickname(value);
    if (value.trim() === '') {
      setError('ニックネームを入力してください');
    } else if (value.length > 50) {
      setError('ニックネームは50文字以内で入力してください');
    } else {
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (nickname.trim() === '' || error) return;

    setIsSubmitting(true);
    const result = await setNicknameAction(nickname);
    if (result.success) {
      window.location.reload(); // Refresh to show game list
    } else {
      setError(result.error || 'エラーが発生しました');
      setIsSubmitting(false);
    }
  };

  return { nickname, error, isSubmitting, handleChange, handleSubmit };
}
```

### 5. Server Component Data Fetching

```typescript
// src/app/page.tsx
import { cookies } from 'next/headers';
import { NicknameInput } from '@/components/domain/session/NicknameInput';
import { GameList } from '@/components/domain/game/GameList';
import { GetAvailableGames } from '@/server/application/use-cases/games/GetAvailableGames';

export default async function TopPage() {
  // Server-side session check
  const cookieStore = cookies();
  const nickname = cookieStore.get('nickname')?.value;

  // No nickname? Show input form
  if (!nickname) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">ようこそ</h1>
        <NicknameInput />
      </main>
    );
  }

  // Has nickname? Fetch and show games
  const useCase = new GetAvailableGames(gameRepository);
  const games = await useCase.execute();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">参加可能なゲーム</h1>
      <nav className="mb-6">
        <a href="/dashboard" className="mr-4">ダッシュボード</a>
        <a href="/games">ゲーム管理</a>
      </nav>
      <GameList games={games} />
    </main>
  );
}
```

## Common Patterns

### Testing Pattern

```typescript
// tests/unit/domain/SessionId.test.ts
import { describe, it, expect } from 'vitest';
import { SessionId, InvalidSessionIdError } from '@/server/domain/value-objects/SessionId';

describe('SessionId', () => {
  describe('constructor', () => {
    it('should create SessionId with valid 21-char nanoid', () => {
      const validId = 'V1StGXR8_Z5jdHi6B-myT';
      const sessionId = new SessionId(validId);
      expect(sessionId.value).toBe(validId);
    });

    it('should throw error for invalid format', () => {
      expect(() => new SessionId('invalid')).toThrow(InvalidSessionIdError);
    });

    it('should throw error for wrong length', () => {
      expect(() => new SessionId('V1StGXR8_Z5jdHi6B-myT123')).toThrow();
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      const id1 = new SessionId('V1StGXR8_Z5jdHi6B-myT');
      const id2 = new SessionId('V1StGXR8_Z5jdHi6B-myT');
      expect(id1.equals(id2)).toBe(true);
    });
  });
});
```

### Mocking next/headers

```typescript
// tests/integration/repositories/CookieSessionRepository.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: () => mockCookieStore,
}));

describe('CookieSessionRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should store session ID in httpOnly cookie', async () => {
    const repo = new CookieSessionRepository();
    const session = new Session(new SessionId('V1StGXR8_Z5jdHi6B-myT'), null, new Date());

    await repo.create(session);

    expect(mockCookieStore.set).toHaveBeenCalledWith(
      'sessionId',
      'V1StGXR8_Z5jdHi6B-myT',
      expect.objectContaining({ httpOnly: true })
    );
  });
});
```

## Troubleshooting

### Issue: "cookies() can only be used in Server Components"

**Solution**: Ensure Server Actions have `'use server'` directive at the top of the file.

### Issue: Tests fail with "Cannot find module 'next/headers'"

**Solution**: Mock next/headers in test setup:
```typescript
vi.mock('next/headers', () => ({
  cookies: () => mockCookieStore,
}));
```

### Issue: Session cookie not persisting

**Check**:
1. `maxAge` is set (not `expires` which doesn't work in all browsers)
2. `path: '/'` is set
3. `secure: true` only in production (use `process.env.NODE_ENV === 'production'`)

### Issue: Client Component using Server Component code

**Solution**: Ensure proper boundaries:
- Server Actions: `'use server'` at top of file
- Client Components: `'use client'` at top of file
- Import Server Actions into Client Components (allowed)
- Don't import Client hooks into Server Components

## Next Steps After Implementation

1. Run full test suite: `npm run test:coverage`
2. Run E2E tests: `npm run test:e2e`
3. Verify no-JS functionality: Disable JavaScript in browser DevTools
4. Test on mobile device (responsive design)
5. Create pull request referencing spec and test results
6. Update CLAUDE.md with any new patterns or decisions

## Related Documentation

- [spec.md](./spec.md) - Feature specification with user stories
- [research.md](./research.md) - Technical decisions and rationale
- [data-model.md](./data-model.md) - Domain entities and value objects
- [contracts/session-actions.yaml](./contracts/session-actions.yaml) - Server Actions contract
- [contracts/top-page-interface.yaml](./contracts/top-page-interface.yaml) - Component interface
- [tasks.md](./tasks.md) - Detailed task breakdown (generated by `/speckit.tasks`)

## Success Criteria Checklist

Before considering this feature complete, verify:

- [ ] SC-001: New users can establish session and set nickname in < 30 seconds
- [ ] SC-002: Session cookies persist for 30+ days (test with browser restart)
- [ ] FR-001: Session ID in HTTP-only cookie
- [ ] FR-002: Nickname prompt shown to new users
- [ ] FR-007: Only games with status '出題中' displayed
- [ ] FR-014: Empty nickname validation works
- [ ] FR-016: TOP page works without JavaScript (disable JS and test)

All tests pass, all functional requirements met, all success criteria achieved → Feature complete! 🎉
