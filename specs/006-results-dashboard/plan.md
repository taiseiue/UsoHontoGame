# Implementation Plan: Results Dashboard

**Branch**: `006-results-dashboard` | **Date**: 2025-11-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-results-dashboard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a comprehensive dashboard system for game moderators and participants to track response status, automatically calculate scores (+10 points for correct lie identification), and display final rankings with winner celebration effects. The feature includes real-time response tracking during the answer phase, automatic score calculation when games close, and a results page with visual winner highlighting and celebratory animations.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode) + Next.js 16.0.1, React 19.2.0
**Primary Dependencies**: Next.js 16.0.1, React 19.2.0, Prisma 6.19.0, Zod 4.1.12, Tailwind CSS v4, nanoid 5.1.6
**Storage**: SQLite via Prisma (existing database at `prisma/dev.db`)
**Testing**: Vitest 4.0.7 (unit/integration), React Testing Library, Playwright 1.56.1 (E2E)
**Target Platform**: Web application (Next.js App Router with React Server Components)
**Project Type**: Web (frontend + backend combined in Next.js monolith)
**Performance Goals**: Dashboard loads < 2s, score calculation < 3s, results page < 3s for 50 participants
**Constraints**: Real-time updates via NEEDS CLARIFICATION (polling/WebSocket), 100 max participants per game
**Scale/Scope**: 3 new pages (response status, scoreboard, results), 2-3 new use cases, score calculation logic

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Architecture Compliance

✅ **Clean Architecture (Principle I)**: Feature will follow established pattern
- **Domain Layer**: No new entities needed (reuse Game, Answer)
- **Application Layer**: New use cases (GetResponseStatus, CalculateScores, GetResults)
- **Infrastructure Layer**: Use existing Prisma repositories
- **Presentation Layer**: New pages/components following App Router pattern

✅ **Component Architecture (Principle II)**: Will maintain three-layer hierarchy
- **Pages Layer**: ResponseStatusPage, ScoreboardPage, ResultsPage
- **Domain Layer**: ResponseStatusList, ScoreDisplay, RankingDisplay
- **UI Layer**: Reuse existing components (Badge, Card, Animation effects)

✅ **Custom Hooks (Principle III)**: All logic in custom hooks
- useResponseStatus, useScoreboard, useResults hooks
- Co-located in component directories
- Independently testable

✅ **TDD (Principle IV)**: Tests written first for all use cases and components
- Unit tests for score calculation logic
- Integration tests for database queries
- Component tests for UI behavior

✅ **Type Safety (Principle V)**: Full TypeScript coverage
- DTOs for response status, scores, rankings
- Strict mode enabled
- No `any` types

✅ **Server Components First (Principle VII)**: Optimize for SSR
- Results page can be Server Component (static display)
- Status tracking needs Client Component (real-time updates)
- Scoreboard can be hybrid (SSR + client updates)

### Open Questions for Research

~~1. **Real-time Updates**: Polling vs WebSocket for response status tracking (affects infrastructure)~~ **RESOLVED**: HTTP polling every 3s
~~2. **Animation Library**: CSS animations vs React animation library for celebration effects~~ **RESOLVED**: CSS + Tailwind
~~3. **Score Persistence**: Calculate on-demand vs store in database (affects data model)~~ **RESOLVED**: Calculate on-demand

**All questions resolved in research.md**

---

### Post-Design Constitution Re-check

After completing Phase 1 design, re-evaluating compliance:

✅ **Clean Architecture (Principle I)**: Design confirmed
- **Use Cases Created**: GetResponseStatus, CalculateScores, GetResults
- **No Domain Changes**: Reuses existing Game and Answer entities
- **Repository Reuse**: No new infrastructure needed
- **API Routes**: Standard Next.js pattern maintained

✅ **Component Architecture (Principle II)**: Design confirmed
- **Pages**: 3 new page components (ResponseStatusPage, ScoreboardPage, ResultsPage)
- **Domain**: 4 new domain components (ResponseStatusList, ScoreCard, RankingDisplay, WinnerCelebration)
- **UI**: 1 new UI component (Confetti)
- **Clear hierarchy maintained**

✅ **Custom Hooks (Principle III)**: Design confirmed
- **useResponseStatus**: Polling logic for response status
- **useResults**: Animation control for celebration
- **Co-located** in component directories
- **Independently testable**

✅ **TDD (Principle IV)**: Implementation approach defined
- **Quickstart guide** specifies test-first approach
- **15 sessions** with tests written before implementation
- **~50 new tests** planned across unit/integration/E2E

✅ **Type Safety (Principle V)**: Design confirmed
- **3 new DTOs** with full TypeScript interfaces
- **Strict mode** maintained throughout
- **No `any` types** in design

✅ **Server Components First (Principle VII)**: Design confirmed
- **Scoreboard**: Server Component (static data)
- **Response Status**: Client Component (polling required)
- **Results**: Client Component (animations required)
- **Appropriate usage** of each type

**Final Verdict**: ✅ **PASSES** - All constitution principles followed

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── games/
│       └── [id]/
│           ├── dashboard/              # NEW: Response status dashboard
│           │   └── page.tsx
│           ├── scoreboard/             # NEW: Scoreboard page
│           │   └── page.tsx
│           └── results/                # NEW: Results page
│               └── page.tsx
├── components/
│   ├── pages/
│   │   ├── ResponseStatusPage/         # NEW: P1 - Response tracking UI
│   │   │   ├── index.tsx
│   │   │   ├── ResponseStatusPage.test.tsx
│   │   │   ├── ResponseStatusPage.types.ts
│   │   │   └── hooks/
│   │   │       └── useResponseStatus.ts
│   │   ├── ScoreboardPage/             # NEW: P2 - Score display UI
│   │   │   ├── index.tsx
│   │   │   ├── ScoreboardPage.test.tsx
│   │   │   ├── ScoreboardPage.types.ts
│   │   │   └── hooks/
│   │   │       └── useScoreboard.ts
│   │   └── ResultsPage/                # NEW: P3 - Final results UI
│   │       ├── index.tsx
│   │       ├── ResultsPage.test.tsx
│   │       ├── ResultsPage.types.ts
│   │       └── hooks/
│   │           └── useResults.ts
│   ├── domain/
│   │   └── results/                    # NEW: Domain components
│   │       ├── ResponseStatusList.tsx
│   │       ├── ScoreCard.tsx
│   │       ├── RankingDisplay.tsx
│   │       └── WinnerCelebration.tsx
│   └── ui/                             # Reuse existing + new animations
│       └── Confetti.tsx                # NEW: Celebration effect
├── server/
│   ├── application/
│   │   ├── dto/
│   │   │   ├── ResponseStatusDto.ts    # NEW
│   │   │   ├── ScoreDto.ts             # NEW
│   │   │   └── RankingDto.ts           # NEW
│   │   └── use-cases/
│   │       └── results/                # NEW: Use case directory
│   │           ├── GetResponseStatus.ts      # P1
│   │           ├── GetResponseStatus.test.ts
│   │           ├── CalculateScores.ts        # P2
│   │           ├── CalculateScores.test.ts
│   │           ├── GetResults.ts             # P3
│   │           └── GetResults.test.ts
│   ├── domain/
│   │   └── entities/
│   │       └── (reuse existing Game, Answer entities)
│   └── infrastructure/
│       └── repositories/
│           └── (reuse existing PrismaGameRepository, PrismaAnswerRepository)
└── lib/
    └── animations.ts                   # NEW: Celebration effect helpers

tests/
├── integration/
│   └── results/                        # NEW: Integration tests
│       ├── response-status.test.ts
│       ├── score-calculation.test.ts
│       └── results-display.test.ts
└── e2e/
    └── results-dashboard.test.ts       # NEW: E2E test

prisma/
└── schema.prisma                       # May need Score model (TBD in research)
```

**Structure Decision**: Next.js monolith with combined frontend/backend. Following existing Clean Architecture pattern with new use cases in `server/application/use-cases/results/` and new page components in `components/pages/`. No database schema changes needed if calculating scores on-demand (research phase will determine).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations detected. All architectural patterns follow established project conventions.
