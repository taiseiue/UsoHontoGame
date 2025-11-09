# Implementation Plan: Two Truths and a Lie Game Management System

**Branch**: `001-game-management` | **Date**: 2025-06-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-game-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Building a real-time web application for managing "Two Truths and a Lie" team building games. The system enables hosts to create game sessions, manage teams, and control game flow while participants join via simple session codes, register episodes, vote on lies, and see live score updates. Core technical approach uses Next.js 15 with React Server Components for the frontend, Next.js API Routes with Clean Architecture for the backend, and WebSockets/Server-Sent Events for real-time synchronization across 50+ concurrent participants.

## Technical Context

**Language/Version**: TypeScript 5 with strict mode enabled
**Primary Dependencies**:
- Next.js 15 (App Router with React Server Components)
- React 19 (Server Components, Actions)
- Tailwind CSS v4 (utility-first styling)
- Biome (formatting and linting)
- Vitest (testing framework)
- React Testing Library (component testing)
**Storage**: In-memory session storage for MVP (persistent database like PostgreSQL for future phases)
**Testing**: Vitest for unit/integration tests, React Testing Library for component tests, TDD mandatory
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+), mobile-responsive
**Project Type**: Web application (Next.js full-stack)
**Performance Goals**:
- Score calculations and updates: <3 seconds
- Timer synchronization: <500ms latency across devices
- Support 50 concurrent participants per session
- Page load: <2 seconds on 3G connection
**Constraints**:
- 99.9% uptime during 2-hour event sessions
- Real-time synchronization required (WebSocket/SSE)
- Mobile-first responsive design (375px min width)
- No authentication system required (session-based access only)
**Scale/Scope**:
- MVP: Single game session management
- 5-50 participants per session
- 3-5 teams per game
- ~10 screens (join, host management, game dashboard, results)
- Session duration: 45-90 minutes typical

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Clean Architecture (NON-NEGOTIABLE) ✅
**Status**: PASS
**Evidence**: Design follows 4-layer Clean Architecture:
- Presentation Layer: Next.js API Routes (`src/app/api/`)
- Application Layer: Use Cases (`src/server/application/use-cases/`)
- Domain Layer: Entities and interfaces (`src/server/domain/`)
- Infrastructure Layer: Repositories and external services (`src/server/infrastructure/`)

### II. Component Architecture (NON-NEGOTIABLE) ✅
**Status**: PASS
**Evidence**: Frontend follows 3-layer hierarchy:
- Pages Layer: `src/components/pages/` (GamePage, HostPage, ResultsPage)
- Domain Layer: `src/components/domain/game/`, `src/components/domain/team/`
- UI Layer: `src/components/ui/` (Button, Input, Timer, Modal)

### III. Custom Hooks Architecture (NON-NEGOTIABLE) ✅
**Status**: PASS
**Evidence**: All component logic extracted to custom hooks:
- `useGameSession`, `useTeamManagement`, `useVoting`, `useScoreboard`
- Each component has co-located `hooks/` directory
- Components remain purely presentational

### IV. Test-Driven Development (NON-NEGOTIABLE) ✅
**Status**: PASS
**Evidence**: TDD workflow enforced:
- Tests written first for all use cases, hooks, and components
- Vitest + React Testing Library configured
- Red-Green-Refactor cycle in implementation tasks

### V. Type Safety (NON-NEGOTIABLE) ✅
**Status**: PASS
**Evidence**: TypeScript strict mode throughout:
- All API DTOs defined in `src/types/`
- Shared types for GameSession, Team, Participant, Episode, Vote, Turn
- No `any` types (documented exceptions only)

### VI. Documentation Standards ✅
**Status**: PASS
**Evidence**: Traceability maintained:
- Feature spec references `docs/requirement.md` and `docs/screen_spec/`
- User stories mapped to functional requirements
- Acceptance criteria in Given-When-Then format

### VII. Server Components First ✅
**Status**: PASS
**Evidence**: Server Components by default:
- Initial game state rendered server-side
- Client components only for interactivity (voting, timer, live updates)
- `"use client"` directive used selectively

**Overall Constitution Compliance**: ✅ ALL GATES PASS - Proceed to Phase 0

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
├── app/                           # Next.js 15 App Router
│   ├── (game)/                   # Route group for game screens
│   │   ├── join/                 # Player join screen
│   │   │   └── page.tsx
│   │   ├── game/[sessionId]/     # Main game screen (dynamic route)
│   │   │   └── page.tsx
│   │   └── results/[sessionId]/  # Results screen
│   │       └── page.tsx
│   ├── (host)/                   # Route group for host screens
│   │   ├── create/               # Create session screen
│   │   │   └── page.tsx
│   │   └── manage/[sessionId]/   # Team management screen
│   │       └── page.tsx
│   ├── api/                      # API Routes (Clean Architecture)
│   │   ├── sessions/
│   │   │   ├── route.ts          # POST /api/sessions (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts      # GET /api/sessions/:id
│   │   │       ├── join/route.ts # POST /api/sessions/:id/join
│   │   │       ├── teams/route.ts # PUT /api/sessions/:id/teams
│   │   │       ├── start/route.ts # POST /api/sessions/:id/start
│   │   │       └── end/route.ts  # POST /api/sessions/:id/end
│   │   ├── episodes/
│   │   │   └── route.ts          # POST /api/episodes, PUT /api/episodes/:id
│   │   ├── votes/
│   │   │   └── route.ts          # POST /api/votes
│   │   └── turns/
│   │       └── [id]/
│   │           └── reveal/route.ts # POST /api/turns/:id/reveal
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── pages/                    # Page-level components
│   │   ├── JoinPage/
│   │   │   ├── index.tsx
│   │   │   ├── JoinPage.types.ts
│   │   │   └── hooks/
│   │   │       └── useJoinPage.ts
│   │   ├── GamePage/
│   │   │   ├── index.tsx
│   │   │   ├── GamePage.types.ts
│   │   │   └── hooks/
│   │   │       ├── useGamePage.ts
│   │   │       └── useRealTimeSync.ts
│   │   ├── HostManagementPage/
│   │   └── ResultsPage/
│   ├── domain/                   # Domain-specific components
│   │   ├── game/
│   │   │   ├── EpisodeRegistrationForm/
│   │   │   │   ├── index.tsx
│   │   │   │   └── hooks/
│   │   │   │       ├── useEpisodeForm.ts
│   │   │   │       └── useEpisodeValidation.ts
│   │   │   ├── VotingInterface/
│   │   │   ├── ScoreBoard/
│   │   │   ├── TurnDisplay/
│   │   │   └── ResultReveal/
│   │   └── team/
│   │       ├── TeamManager/
│   │       ├── TeamCard/
│   │       └── ParticipantList/
│   └── ui/                       # Reusable UI components
│       ├── Button/
│       ├── Input/
│       ├── Timer/
│       ├── Modal/
│       ├── Toast/
│       └── LoadingSpinner/
├── server/                       # Backend (Clean Architecture)
│   ├── domain/                   # Domain Layer
│   │   ├── entities/
│   │   │   ├── GameSession.ts
│   │   │   ├── Team.ts
│   │   │   ├── Participant.ts
│   │   │   ├── Episode.ts
│   │   │   ├── Vote.ts
│   │   │   └── Turn.ts
│   │   ├── repositories/         # Repository interfaces
│   │   │   ├── IGameSessionRepository.ts
│   │   │   ├── IParticipantRepository.ts
│   │   │   └── IVoteRepository.ts
│   │   └── value-objects/
│   │       ├── SessionId.ts
│   │       └── Score.ts
│   ├── application/              # Application Layer
│   │   ├── use-cases/
│   │   │   ├── sessions/
│   │   │   │   ├── CreateSessionUseCase.ts
│   │   │   │   ├── JoinSessionUseCase.ts
│   │   │   │   └── EndSessionUseCase.ts
│   │   │   ├── teams/
│   │   │   │   └── ManageTeamsUseCase.ts
│   │   │   ├── episodes/
│   │   │   │   ├── RegisterEpisodesUseCase.ts
│   │   │   │   └── UpdateEpisodesUseCase.ts
│   │   │   ├── voting/
│   │   │   │   └── SubmitVoteUseCase.ts
│   │   │   └── turns/
│   │   │       ├── StartTurnUseCase.ts
│   │   │       └── RevealAnswerUseCase.ts
│   │   ├── dto/
│   │   │   ├── requests/
│   │   │   │   ├── CreateSessionRequest.ts
│   │   │   │   ├── JoinSessionRequest.ts
│   │   │   │   ├── RegisterEpisodesRequest.ts
│   │   │   │   └── SubmitVoteRequest.ts
│   │   │   └── responses/
│   │   │       ├── SessionResponse.ts
│   │   │       ├── GameStateResponse.ts
│   │   │       └── ScoreResponse.ts
│   │   └── services/
│   │       ├── ScoreCalculationService.ts
│   │       └── SessionIdGenerator.ts
│   └── infrastructure/           # Infrastructure Layer
│       ├── repositories/
│       │   ├── InMemoryGameSessionRepository.ts
│       │   ├── InMemoryParticipantRepository.ts
│       │   └── InMemoryVoteRepository.ts
│       └── realtime/
│           └── WebSocketManager.ts
├── hooks/                        # Shared custom hooks
│   ├── useWebSocket.ts
│   ├── useTimer.ts
│   └── useSessionStorage.ts
├── lib/
│   ├── utils.ts
│   └── validators.ts
└── types/
    ├── api.ts                    # API-related types
    ├── game.ts                   # Game domain types
    └── index.ts

tests/
├── unit/
│   ├── hooks/
│   ├── use-cases/
│   └── entities/
├── integration/
│   ├── api/
│   └── user-flows/
└── component/
    ├── pages/
    ├── domain/
    └── ui/
```

**Structure Decision**: Web application (Next.js full-stack) with co-located frontend and backend. This aligns with the project's Next.js 15 architecture where API Routes and frontend code share the same repository. The structure follows Clean Architecture principles for backend (4 layers) and component hierarchy for frontend (3 layers: pages, domain, UI). All components follow the custom hooks architecture with logic extracted to co-located `hooks/` directories.

## Complexity Tracking

**Status**: No violations - all constitution checks passed

## Phase 0 Complete: Research ✅

All technical decisions resolved. See [research.md](./research.md) for details:

- ✅ Real-time synchronization: Server-Sent Events (SSE)
- ✅ Session storage: In-memory Map with TTL cleanup
- ✅ Session ID generation: Nanoid with custom alphabet
- ✅ Timer synchronization: Server-authoritative with client interpolation
- ✅ Score calculation: Pure functional service
- ✅ Episode validation: Shared client/server rules
- ✅ Mobile responsiveness: Mobile-first Tailwind CSS
- ✅ Error handling: Layered with domain-specific types
- ✅ Testing strategy: TDD with 3-layer test pyramid

## Phase 1 Complete: Design & Contracts ✅

All design artifacts generated:

1. **Data Model** ([data-model.md](./data-model.md)):
   - 6 entities fully defined with attributes, relationships, validation rules
   - Value objects (SessionId, Score)
   - State machine diagrams
   - Future PostgreSQL schema for migration

2. **API Contracts** ([contracts/openapi.yaml](./contracts/openapi.yaml)):
   - 12 REST endpoints fully specified
   - Request/response schemas with validation rules
   - Server-Sent Events endpoint for real-time updates
   - Error responses and security schemes

3. **Quick Start Guide** ([quickstart.md](./quickstart.md)):
   - TDD workflow with concrete examples
   - Implementation order by user story priority
   - Testing guidelines and structure
   - Common pitfalls and debugging tips

4. **Agent Context** (CLAUDE.md):
   - Updated with TypeScript 5, Next.js 15, Vitest
   - In-memory storage approach documented
   - Available for AI-assisted development

## Constitution Re-Check (Post-Design) ✅

All principles still satisfied:

- ✅ Clean Architecture: 4 layers maintained in design
- ✅ Component Architecture: 3 layers (Pages/Domain/UI) in component design
- ✅ Custom Hooks: All logic extraction patterns documented
- ✅ TDD: Red-Green-Refactor workflow mandated in quickstart
- ✅ Type Safety: TypeScript strict mode, all DTOs defined
- ✅ Documentation: Full traceability from requirements to contracts
- ✅ Server Components: SSR approach documented in research

## Next Steps

**Ready for Phase 2**: Task generation with `/speckit.tasks`

The implementation plan is complete. All research resolved, all design artifacts generated, and constitution compliance verified. The feature is ready for task breakdown and TDD implementation.

**Implementation Timeline Estimate**: 
- P1 (MVP): 3-4 weeks (session management, episode registration, voting, scoring)
- P2 (Host management): 1-2 weeks (team management, game control)
- P3 (Real-time): 1 week (SSE integration, live updates)
- P4 (Results): 3-5 days (final screen, animations)

**Total**: ~6-8 weeks for full feature with comprehensive testing

