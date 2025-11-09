# Quick Start: Two Truths and a Lie Game Management System

**Feature**: 001-game-management
**Date**: 2025-06-11
**Audience**: Developers implementing this feature

## Overview

This guide provides the essential information needed to begin implementing the game management system following TDD principles and Clean Architecture.

## Prerequisites

Before starting implementation:

- [x] Read [spec.md](./spec.md) - Feature specification with user stories and requirements
- [x] Read [plan.md](./plan.md) - Implementation plan with technical context
- [x] Read [research.md](./research.md) - Technical decisions and rationale
- [x] Read [data-model.md](./data-model.md) - Entity definitions and relationships
- [x] Review [contracts/openapi.yaml](./contracts/openapi.yaml) - API specifications

## Development Environment Setup

### 1. Install Dependencies

```bash
cd /Users/ookura.keisuke/repos/UsoHontoGame

# Install Node.js dependencies
npm install

# Verify installation
npm run dev  # Should start Next.js dev server on http://localhost:3000
```

### 2. Configure Development Tools

```bash
# Verify Biome is configured
npx biome check src/

# Verify Vitest is configured
npm run test

# TypeScript strict mode should already be enabled in tsconfig.json
```

### 3. Project Structure Review

Familiarize yourself with the directory structure defined in [plan.md](./plan.md#source-code-repository-root).

Key directories:
- `src/app/api/` - Next.js API Routes (Presentation Layer)
- `src/server/` - Backend logic (Clean Architecture layers)
- `src/components/` - Frontend components (Pages/Domain/UI layers)
- `tests/` - Test files organized by type

## Development Workflow

### Test-Driven Development (TDD) Cycle

**CRITICAL**: All implementation must follow TDD Red-Green-Refactor:

1. **Red**: Write a failing test first
2. **Green**: Write minimum code to make test pass
3. **Refactor**: Improve code while keeping tests green

### Example: Implementing CreateSessionUseCase

#### Step 1: Write the Test (Red)

```typescript
// tests/unit/use-cases/CreateSessionUseCase.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { CreateSessionUseCase } from '@/server/application/use-cases/sessions/CreateSessionUseCase';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';

describe('CreateSessionUseCase', () => {
  let repository: InMemoryGameSessionRepository;
  let useCase: CreateSessionUseCase;

  beforeEach(() => {
    repository = new InMemoryGameSessionRepository();
    useCase = new CreateSessionUseCase(repository);
  });

  it('should create a new game session with unique 6-character ID', async () => {
    // Arrange
    const request = {
      hostNickname: 'Keisuke',
      scoringRules: {
        pointsForCorrectGuess: 10,
        pointsPerDeception: 5
      }
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.sessionId).toMatch(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
    expect(result.phase).toBe('preparation');
    expect(result.hostId).toBeDefined();
  });

  it('should create host participant with HOST role', async () => {
    // Arrange
    const request = {
      hostNickname: 'Keisuke',
      scoringRules: { pointsForCorrectGuess: 10, pointsPerDeception: 5 }
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    const session = await repository.findById(result.sessionId);
    const host = session.participants.find(p => p.id === result.hostId);
    expect(host?.role).toBe('host');
    expect(host?.nickname).toBe('Keisuke');
  });
});
```

**Run test - should FAIL (Red)**:
```bash
npm run test tests/unit/use-cases/CreateSessionUseCase.test.ts
# Expected: Test fails because CreateSessionUseCase doesn't exist yet
```

#### Step 2: Implement Minimum Code (Green)

```typescript
// src/server/domain/entities/GameSession.ts
export class GameSession {
  constructor(
    public id: string,
    public hostId: string,
    public phase: SessionPhase,
    public createdAt: Date,
    public lastActivityTimestamp: Date,
    public scoringRules: ScoringRules,
    public presentationOrder: string[],
    public currentPresentingTeamIndex: number
  ) {}
}

// src/server/application/use-cases/sessions/CreateSessionUseCase.ts
import { nanoid } from 'nanoid';
import { IGameSessionRepository } from '@/server/domain/repositories/IGameSessionRepository';
import { GameSession } from '@/server/domain/entities/GameSession';
import { Participant } from '@/server/domain/entities/Participant';

export class CreateSessionUseCase {
  constructor(private sessionRepository: IGameSessionRepository) {}

  async execute(request: CreateSessionRequest): Promise<SessionResponse> {
    // Generate unique session ID
    const sessionId = this.generateSessionId();

    // Create host participant
    const host = new Participant(
      crypto.randomUUID(),
      sessionId,
      request.hostNickname,
      'host',
      null,
      'connected',
      []
    );

    // Create game session
    const session = new GameSession(
      sessionId,
      host.id,
      'preparation',
      new Date(),
      new Date(),
      request.scoringRules || { pointsForCorrectGuess: 10, pointsPerDeception: 5 },
      [],
      0
    );

    // Save to repository
    await this.sessionRepository.save(session);

    return {
      sessionId: session.id,
      hostId: session.hostId,
      phase: session.phase,
      createdAt: session.createdAt
    };
  }

  private generateSessionId(): string {
    const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    return Array.from({ length: 6 }, () =>
      alphabet[Math.floor(Math.random() * alphabet.length)]
    ).join('');
  }
}
```

**Run test - should PASS (Green)**:
```bash
npm run test tests/unit/use-cases/CreateSessionUseCase.test.ts
# Expected: All tests pass
```

#### Step 3: Refactor

Improve the session ID generation using Nanoid library as researched:

```typescript
// src/server/application/services/SessionIdGenerator.ts
import { customAlphabet } from 'nanoid';

const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const generateSessionId = customAlphabet(alphabet, 6);

// Update CreateSessionUseCase to use this service
import { generateSessionId } from '@/server/application/services/SessionIdGenerator';

// In execute method:
const sessionId = generateSessionId();
```

**Run tests again - should still PASS**:
```bash
npm run test tests/unit/use-cases/CreateSessionUseCase.test.ts
# Expected: All tests still pass after refactoring
```

## Implementation Order (by User Story Priority)

### Phase 1: User Story P1 - Player Joins and Participates (MVP)

Implement in this order to maintain testability:

1. **Domain Layer**:
   - [ ] GameSession entity
   - [ ] Participant entity
   - [ ] Episode entity
   - [ ] Vote entity
   - [ ] Team entity
   - [ ] Repository interfaces

2. **Infrastructure Layer**:
   - [ ] InMemoryGameSessionRepository
   - [ ] InMemoryParticipantRepository
   - [ ] SessionIdGenerator service

3. **Application Layer (Use Cases)** - TDD Required:
   - [ ] CreateSessionUseCase
   - [ ] JoinSessionUseCase
   - [ ] RegisterEpisodesUseCase
   - [ ] SubmitVoteUseCase
   - [ ] RevealAnswerUseCase (with ScoreCalculationService)

4. **Presentation Layer (API Routes)**:
   - [ ] POST /api/sessions
   - [ ] POST /api/sessions/[id]/join
   - [ ] POST /api/episodes
   - [ ] POST /api/votes
   - [ ] POST /api/turns/[id]/reveal
   - [ ] GET /api/sessions/[id]/events (SSE)

5. **Frontend (Components)** - TDD Required for Hooks:
   - [ ] UI components: Button, Input, Timer, Modal
   - [ ] Domain components: EpisodeRegistrationForm, VotingInterface, ScoreBoard
   - [ ] Page components: JoinPage, GamePage
   - [ ] Custom hooks: useEpisodeForm, useVoting, useRealTimeSync

### Phase 2: User Story P2 - Host Management

1. **Application Layer**:
   - [ ] ManageTeamsUseCase
   - [ ] StartGameUseCase
   - [ ] EndGameUseCase

2. **Presentation Layer**:
   - [ ] PUT /api/sessions/[id]/teams
   - [ ] POST /api/sessions/[id]/start
   - [ ] POST /api/sessions/[id]/end

3. **Frontend**:
   - [ ] TeamManager component (drag-and-drop)
   - [ ] HostManagementPage
   - [ ] useTeamManagement hook

### Phase 3: User Story P3 - Real-Time Scoring

1. **Infrastructure**:
   - [ ] SSE manager for broadcasting updates
   - [ ] Event types: game-state-update, score-change, timer-tick

2. **Frontend**:
   - [ ] useWebSocket hook for SSE connection
   - [ ] Real-time score updates in ScoreBoard
   - [ ] Timer synchronization logic

### Phase 4: User Story P4 - Result Celebration

1. **Frontend**:
   - [ ] ResultsPage with ranking display
   - [ ] Confetti animation component
   - [ ] Team performance summary

## Testing Guidelines

### Unit Test Structure

```typescript
describe('ComponentOrClass', () => {
  // Setup
  beforeEach(() => {
    // Initialize dependencies
  });

  // Test naming: should [expected behavior] when [condition]
  it('should return validation error when episode text is too short', () => {
    // Arrange: Set up test data
    const episode = { text: 'short', isLie: false };

    // Act: Execute the behavior
    const result = validateEpisode(episode);

    // Assert: Verify expectations
    expect(result.error).toBe('Minimum 10 characters');
  });
});
```

### Integration Test Structure

```typescript
describe('POST /api/sessions', () => {
  it('should create session and return 201', async () => {
    // Given: Request payload
    const payload = {
      hostNickname: 'Keisuke',
      scoringRules: { pointsForCorrectGuess: 10, pointsPerDeception: 5 }
    };

    // When: POST request
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Then: Verify response
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.sessionId).toMatch(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
  });
});
```

### Component Test Structure

```typescript
import { render, screen, fireEvent } from '@testing-library/react';

describe('EpisodeRegistrationForm', () => {
  it('should display validation error when episode is too short', () => {
    // Arrange
    render(<EpisodeRegistrationForm />);

    // Act
    const input = screen.getByLabelText('Episode 1');
    fireEvent.change(input, { target: { value: 'short' } });
    fireEvent.blur(input);

    // Assert
    expect(screen.getByText(/minimum 10 characters/i)).toBeInTheDocument();
  });
});
```

## Common Pitfalls to Avoid

1. **❌ Writing implementation before tests**
   - ✅ Always write failing test first (Red-Green-Refactor)

2. **❌ Exposing `isLie` field to clients**
   - ✅ Keep lie information server-side only until reveal

3. **❌ Client-side timer as source of truth**
   - ✅ Server maintains authoritative time, clients interpolate

4. **❌ Mixing business logic in React components**
   - ✅ Extract all logic to custom hooks

5. **❌ Direct database queries in use cases**
   - ✅ Always use repository interfaces

6. **❌ Forgetting to update `lastActivityTimestamp`**
   - ✅ Update on every session mutation for TTL cleanup

## Debugging Tips

### Check Session State
```typescript
// In repository or API route:
console.log(JSON.stringify(session, null, 2));
```

### Monitor SSE Events
```typescript
// In browser console:
const eventSource = new EventSource('/api/sessions/3KH9Q2/events');
eventSource.onmessage = (event) => console.log('SSE:', JSON.parse(event.data));
```

### Verify Test Coverage
```bash
npm run test:coverage
# Review HTML report in coverage/index.html
```

## Next Steps

1. **Start with TDD**: Begin implementing User Story P1 following the TDD cycle
2. **Commit frequently**: Small, focused commits for each passing test
3. **Review constitution**: Ensure each implementation step complies with project principles
4. **Ask for help**: Clarify requirements with team before making assumptions

## Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Vitest Documentation](https://vitest.dev)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [OpenAPI Specification](https://swagger.io/specification/)

Ready to start? Begin with creating the first test! 🚀
