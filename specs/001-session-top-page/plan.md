# Implementation Plan: Session Management and TOP Page

**Branch**: `001-session-top-page` | **Date**: 2025-11-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-session-top-page/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements the foundational session management infrastructure and TOP page for the UsoHontoGame application. Users will be able to establish persistent sessions with nicknames stored in cookies, and browse available games filtered by "出題中" status. The TOP page serves as the main entry point with navigation to dashboard and game management areas.

## Technical Context

**Language/Version**: TypeScript 5 with strict mode enabled
**Primary Dependencies**: Next.js 16.0.1, React 19.2.0, Tailwind CSS v4, nanoid 5.1.6
**Storage**: In-memory storage for MVP (game state), Cookie storage (session management)
**Testing**: Vitest 4.0.7, React Testing Library 16.3.0, Playwright 1.56.1
**Target Platform**: Web (Next.js App Router with React Server Components)
**Project Type**: Single web application (Next.js full-stack)
**Performance Goals**:
- Session creation < 30 seconds
- TOP page load < 2 seconds
- Cookie persistence for 30 days
**Constraints**:
- Server-side rendering required (no-JS compatibility)
- HTTP-only cookies for session ID security
- 50 character nickname length limit
**Scale/Scope**:
- Support for 100+ simultaneous games
- Multiple users with duplicate nicknames allowed
- Single feature (session + TOP page)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| **0. Git commit** | ✅ PASS | Will commit after each task completion |
| **I. Clean Architecture** | ✅ PASS | Session management will follow: Domain (Session entity) → Application (session use cases) → Infrastructure (cookie repository) → Presentation (middleware/server actions) |
| **II. Component Architecture** | ✅ PASS | TOP page will use: Pages (TOP page component) → Domain (GameList component if needed) → UI (navigation links, buttons) |
| **III. Custom Hooks Architecture** | ✅ PASS | Client-side nickname input will use custom hook for form logic |
| **IV. Test-Driven Development** | ✅ PASS | Will write tests first for session creation, cookie persistence, game filtering |
| **V. Type Safety** | ✅ PASS | TypeScript strict mode already enabled, will define Session and Game types |
| **VI. Documentation Standards** | ✅ PASS | Spec references docs/requirement.md, following Given-When-Then format |
| **VII. Server Components First** | ✅ PASS | TOP page will be Server Component fetching game data, Client Component only for nickname input form |

### Technology Standards Compliance

| Standard | Status | Notes |
|----------|--------|-------|
| **Frontend Stack** | ✅ PASS | Using Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, Biome |
| **Backend Stack** | ✅ PASS | Next.js API Routes (if needed for session actions), Repository pattern for game data access |
| **Testing Stack** | ✅ PASS | Vitest + React Testing Library for unit/component, Playwright for E2E |
| **Project Structure** | ✅ PASS | Follows constitution structure: src/app/, src/components/, src/server/, src/hooks/, src/types/ |

### Gate Evaluation

**Result**: ✅ PASS - All core principles and technology standards align with constitution requirements.

No violations detected. This feature establishes the foundational patterns that future features will build upon.

## Project Structure

### Documentation (this feature)

```text
specs/001-session-top-page/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── session-api.yaml # Session management API contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (existing)
│   ├── page.tsx                 # TOP page - Server Component (to be updated)
│   ├── not-found.tsx            # 404 page (existing)
│   └── api/                     # API Routes (if needed)
│       └── session/             # Session management endpoints
│           └── route.ts         # Session creation/validation
├── components/                  # UI Components
│   ├── pages/                   # Page-level components
│   │   └── top/                 # TOP page components
│   │       ├── TopPage.tsx      # Main TOP page composition
│   │       └── hooks/           # TOP page hooks
│   ├── domain/                  # Domain-specific components
│   │   ├── session/             # Session management
│   │   │   ├── NicknameInput.tsx       # Nickname input form (Client Component)
│   │   │   └── hooks/
│   │   │       └── useNicknameForm.ts  # Form logic hook
│   │   └── game/                # Game domain
│   │       ├── GameList.tsx     # Game list display (Server Component)
│   │       └── GameCard.tsx     # Individual game card
│   └── ui/                      # Reusable UI components
│       ├── Button.tsx           # Generic button
│       ├── Input.tsx            # Generic input
│       └── Link.tsx             # Navigation link wrapper
├── server/                      # Backend (Clean Architecture)
│   ├── domain/                  # Domain Layer
│   │   ├── entities/
│   │   │   ├── Session.ts       # Session entity with validation
│   │   │   └── Game.ts          # Game entity
│   │   ├── repositories/        # Repository interfaces
│   │   │   ├── ISessionRepository.ts
│   │   │   └── IGameRepository.ts
│   │   └── value-objects/
│   │       └── SessionId.ts     # Session ID value object
│   ├── application/             # Application Layer (Use Cases)
│   │   ├── use-cases/
│   │   │   ├── session/
│   │   │   │   ├── CreateSession.ts           # Create new session use case
│   │   │   │   ├── ValidateSession.ts         # Validate existing session
│   │   │   │   └── SetNickname.ts             # Set/update nickname
│   │   │   └── games/
│   │   │       └── GetAvailableGames.ts       # Get games with 出題中 status
│   │   └── dto/
│   │       ├── SessionDto.ts    # Session data transfer object
│   │       └── GameDto.ts       # Game data transfer object
│   └── infrastructure/          # Infrastructure Layer
│       └── repositories/
│           ├── CookieSessionRepository.ts     # Cookie-based session storage
│           └── InMemoryGameRepository.ts      # In-memory game storage
├── hooks/                       # Custom React hooks (global)
├── lib/                         # Utilities and configurations
│   ├── cookies.ts               # Cookie helper functions
│   └── constants.ts             # App constants (cookie names, expiration)
└── types/                       # TypeScript type definitions
    ├── session.ts               # Session-related types
    └── game.ts                  # Game-related types

tests/
├── unit/                        # Unit tests
│   ├── domain/                  # Domain entity tests
│   │   ├── Session.test.ts
│   │   └── Game.test.ts
│   ├── use-cases/               # Use case tests
│   │   ├── CreateSession.test.ts
│   │   ├── ValidateSession.test.ts
│   │   ├── SetNickname.test.ts
│   │   └── GetAvailableGames.test.ts
│   └── hooks/                   # Hook tests
│       └── useNicknameForm.test.ts
├── integration/                 # Integration tests
│   └── api/
│       └── session.test.ts      # Session API integration tests
└── e2e/                         # End-to-end tests
    └── top-page.spec.ts         # TOP page user journey tests
```

**Structure Decision**: Single web application structure using Next.js App Router with full-stack capabilities. The project follows Clean Architecture in the `src/server/` directory with clear separation between domain, application, and infrastructure layers. Frontend components follow three-layer hierarchy (pages/domain/ui) as per constitution. This structure supports both Server Components (for data fetching) and Client Components (for interactivity) as defined in the constitution's "Server Components First" principle.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. This section is not applicable.

---

## Post-Design Constitution Re-Evaluation

*Re-check after Phase 1 design complete*

### Design Artifacts Review

The following design artifacts have been created:
- ✅ `research.md` - Technical decisions with rationale
- ✅ `data-model.md` - Domain entities, value objects, DTOs, repositories
- ✅ `contracts/session-actions.yaml` - Server Actions API contract
- ✅ `contracts/top-page-interface.yaml` - Component interface contract
- ✅ `quickstart.md` - Implementation guide

### Constitution Compliance Re-Check

| Principle | Post-Design Status | Design Evidence |
|-----------|-------------------|-----------------|
| **0. Git commit** | ✅ PASS | Quickstart.md includes commit strategy after each phase |
| **I. Clean Architecture** | ✅ PASS | data-model.md defines clear layers: Domain (entities/VOs) → Application (use cases/DTOs) → Infrastructure (repositories) → Presentation (Server Actions/components). No layer violations in design. |
| **II. Component Architecture** | ✅ PASS | top-page-interface.yaml shows proper hierarchy: TopPage (page) → GameList (domain) → GameCard (domain), NicknameInput (domain) → UI components. No business logic in UI layer. |
| **III. Custom Hooks Architecture** | ✅ PASS | research.md Decision #5 and quickstart.md show useNicknameForm hook containing all form logic. NicknameInput component is purely presentational. |
| **IV. Test-Driven Development** | ✅ PASS | quickstart.md explicitly orders: "Write tests FIRST (Red), then implement (Green), then refactor (Refactor)". Test files listed before implementation files in checklist. |
| **V. Type Safety** | ✅ PASS | data-model.md defines explicit types for all entities, VOs, DTOs. Value objects enforce validation at construction. TypeScript strict mode confirmed in research.md. |
| **VI. Documentation Standards** | ✅ PASS | All contracts reference spec.md requirements (FR-xxx). User stories linked to implementation artifacts. Given-When-Then format maintained. |
| **VII. Server Components First** | ✅ PASS | top-page-interface.yaml explicitly designates Server vs Client Components. Only NicknameInput is Client (requires interactivity). GameList, GameCard, TopPage all Server Components. |

### Design Patterns Validation

| Pattern | Compliance | Design Location |
|---------|-----------|-----------------|
| **Value Object Pattern** | ✅ PASS | data-model.md: SessionId, Nickname, GameId, GameStatus all immutable VOs with validation |
| **Repository Pattern** | ✅ PASS | data-model.md: ISessionRepository, IGameRepository interfaces. Implementations in infrastructure layer (CookieSessionRepository, InMemoryGameRepository) |
| **Use Case Pattern** | ✅ PASS | data-model.md and quickstart.md: CreateSession, ValidateSession, SetNickname, GetAvailableGames use cases. Single responsibility, testable in isolation |
| **DTO Pattern** | ✅ PASS | data-model.md: SessionDto, GameDto separate from domain entities. Prevents domain leakage to presentation |
| **Server Actions Pattern** | ✅ PASS | session-actions.yaml: 'use server' functions with clear input/output contracts. Error handling strategy defined |

### Architectural Decision Records (from research.md)

| Decision | Alignment | Notes |
|----------|-----------|-------|
| **Cookie-based session with next/headers** | ✅ Aligned | Native Next.js integration, no external dependencies, SSR-compatible |
| **nanoid for session IDs** | ✅ Aligned | Already in dependencies, cryptographically secure, URL-safe |
| **Server Components for data fetching** | ✅ Aligned | Follows constitution Principle VII. Client Components only for forms |
| **Repository pattern for data access** | ✅ Aligned | Enables testability and future database migration without business logic changes |
| **Client hook for validation** | ✅ Aligned | Follows constitution Principle III. Separates logic from presentation |
| **Separate types/ directory** | ✅ Aligned | Follows constitution Principle V. Centralized type definitions |
| **TDD with 3 test layers** | ✅ Aligned | Follows constitution Principle IV. Unit/integration/E2E coverage planned |

### Gate Re-Evaluation Result

**Status**: ✅ **PASS** - All constitution principles remain satisfied post-design.

**Summary**:
- Design artifacts fully implement Clean Architecture with proper layer separation
- Component hierarchy follows three-layer architecture (pages/domain/ui)
- Custom hooks pattern applied to all component logic
- TDD workflow explicitly defined in implementation checklist
- Type safety enforced through value objects and explicit DTOs
- Server Components used by default, Client Components only where necessary
- All functional requirements from spec.md mapped to design artifacts

**No design violations or compromises detected.**

### Changes from Initial Check

None. The design implementation maintains all commitments made during the initial constitution check. No architectural drift or compromises were introduced during the design phase.

### Ready for Phase 2

✅ All design artifacts complete
✅ Constitution compliance verified
✅ Ready to proceed to `/speckit.tasks` for task generation

---

## Planning Completion Summary

**Branch**: `001-session-top-page`
**Spec**: [spec.md](./spec.md)
**Status**: Phase 1 Complete - Ready for Task Generation

### Generated Artifacts

1. **plan.md** (this file) - Technical context, constitution check, project structure
2. **research.md** - 7 technical decisions with alternatives and rationale
3. **data-model.md** - Domain entities, value objects, DTOs, repositories, validation rules
4. **contracts/session-actions.yaml** - Server Actions API contract with error handling
5. **contracts/top-page-interface.yaml** - Component interface with data fetching and rendering
6. **quickstart.md** - Implementation guide with code snippets and 7-day checklist

### Key Design Decisions

- **Session Storage**: Next.js cookies() API with HTTP-only session ID, readable nickname cookie
- **Session IDs**: nanoid (21 chars, URL-safe, already in dependencies)
- **Architecture**: Clean Architecture with domain/application/infrastructure layers
- **Components**: Server Components default, Client only for nickname form
- **Testing**: TDD with unit/integration/E2E layers (Vitest + Playwright)
- **Types**: Centralized in types/ directory, DTOs for layer boundaries

### Constitution Compliance

**All principles verified**: Git commits planned ✅ | Clean Architecture ✅ | Component Architecture ✅ | Custom Hooks ✅ | TDD ✅ | Type Safety ✅ | Documentation ✅ | Server Components First ✅

### Next Steps

Run `/speckit.tasks` to generate the actionable task list (tasks.md) based on these design artifacts.

The feature is now ready for implementation following the TDD workflow defined in quickstart.md.
