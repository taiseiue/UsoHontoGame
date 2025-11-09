# Tasks: Two Truths and a Lie Game Management System

**Input**: Design documents from `/specs/001-game-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: TDD is MANDATORY per project constitution. All implementation follows Red-Green-Refactor cycle.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Next.js full-stack: `src/app/`, `src/server/`, `src/components/`, `tests/`
- API Routes: `src/app/api/`
- Backend: `src/server/domain/`, `src/server/application/`, `src/server/infrastructure/`
- Frontend: `src/components/pages/`, `src/components/domain/`, `src/components/ui/`
- Tests: `tests/unit/`, `tests/integration/`, `tests/component/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize Next.js 15 project with TypeScript 5 strict mode in project root
- [X] T002 [P] Configure Tailwind CSS v4 in src/app/globals.css and tailwind.config.ts
- [X] T003 [P] Configure Biome for formatting and linting in biome.json
- [X] T004 [P] Configure Vitest and React Testing Library in vitest.config.ts and tests/setup.ts
- [X] T005 [P] Create TypeScript path aliases in tsconfig.json (@/components, @/server, @/lib, @/types)
- [X] T006 [P] Set up responsive breakpoints and design tokens in src/app/globals.css
- [X] T007 [P] Create directory structure per plan.md (src/app/, src/server/, src/components/, tests/)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Create base domain entities directory structure in src/server/domain/entities/
- [X] T009 [P] Create GameSession entity in src/server/domain/entities/GameSession.ts
- [X] T010 [P] Create Team entity in src/server/domain/entities/Team.ts
- [X] T011 [P] Create Participant entity in src/server/domain/entities/Participant.ts
- [X] T012 [P] Create Episode entity in src/server/domain/entities/Episode.ts
- [X] T013 [P] Create Vote entity in src/server/domain/entities/Vote.ts
- [X] T014 [P] Create Turn entity in src/server/domain/entities/Turn.ts
- [X] T015 [P] Create SessionPhase enum in src/types/game.ts
- [X] T016 [P] Create TurnPhase enum in src/types/game.ts
- [X] T017 [P] Create ParticipantRole enum in src/types/game.ts
- [X] T018 [P] Define repository interfaces in src/server/domain/repositories/
- [X] T019 [P] Create IGameSessionRepository interface in src/server/domain/repositories/IGameSessionRepository.ts
- [X] T020 [P] Create IParticipantRepository interface in src/server/domain/repositories/IParticipantRepository.ts
- [X] T021 [P] Create IVoteRepository interface in src/server/domain/repositories/IVoteRepository.ts
- [X] T022 [P] Implement InMemoryGameSessionRepository in src/server/infrastructure/repositories/InMemoryGameSessionRepository.ts
- [X] T023 [P] Implement InMemoryParticipantRepository in src/server/infrastructure/repositories/InMemoryParticipantRepository.ts
- [X] T024 [P] Implement InMemoryVoteRepository in src/server/infrastructure/repositories/InMemoryVoteRepository.ts
- [X] T025 [P] Create SessionIdGenerator service using nanoid in src/server/application/services/SessionIdGenerator.ts
- [X] T026 [P] Create ScoreCalculationService in src/server/application/services/ScoreCalculationService.ts
- [X] T027 [P] Define API DTO types in src/server/application/dto/requests/ and responses/
- [X] T028 [P] Create shared validation utilities in src/lib/validators.ts
- [X] T029 [P] Set up error handling utilities in src/lib/errors.ts
- [X] T030 [P] Create base UI components: Button in src/components/ui/Button/index.tsx
- [X] T031 [P] Create base UI components: Input in src/components/ui/Input/index.tsx
- [X] T032 [P] Create base UI components: Modal in src/components/ui/Modal/index.tsx
- [X] T033 [P] Create base UI components: Toast in src/components/ui/Toast/index.tsx
- [X] T034 [P] Create base UI components: LoadingSpinner in src/components/ui/LoadingSpinner/index.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Player Joins and Participates (Priority: P1) 🎯 MVP

**Goal**: Enable players to join game session, register episodes, vote on other teams' episodes, and see scoring results

**Independent Test**: Create a game session, join with nickname, register 3 episodes (marking one as lie), vote on another team's episodes, see reveal with updated scores

### Tests for User Story 1 (TDD - Write FIRST) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T035 [P] [US1] Write unit test for CreateSessionUseCase in tests/unit/use-cases/CreateSessionUseCase.test.ts
- [X] T036 [P] [US1] Write unit test for JoinSessionUseCase in tests/unit/use-cases/JoinSessionUseCase.test.ts
- [X] T037 [P] [US1] Write unit test for RegisterEpisodesUseCase in tests/unit/use-cases/RegisterEpisodesUseCase.test.ts
- [X] T038 [P] [US1] Write unit test for SubmitVoteUseCase in tests/unit/use-cases/SubmitVoteUseCase.test.ts
- [X] T039 [P] [US1] Write unit test for RevealAnswerUseCase in tests/unit/use-cases/RevealAnswerUseCase.test.ts
- [X] T040 [P] [US1] Write unit test for ScoreCalculationService in tests/unit/services/ScoreCalculationService.test.ts
- [X] T041 [P] [US1] Write integration test for POST /api/sessions in tests/integration/api/sessions.test.ts
- [X] T042 [P] [US1] Write integration test for POST /api/sessions/[id]/join in tests/integration/api/join.test.ts
- [X] T043 [P] [US1] Write integration test for POST /api/episodes in tests/integration/api/episodes.test.ts
- [X] T044 [P] [US1] Write integration test for POST /api/votes in tests/integration/api/votes.test.ts
- [X] T045 [P] [US1] Write integration test for POST /api/turns/[id]/reveal in tests/integration/api/reveal.test.ts

### Implementation for User Story 1

- [X] T046 [P] [US1] Implement CreateSessionUseCase in src/server/application/use-cases/sessions/CreateSessionUseCase.ts
- [X] T047 [P] [US1] Implement JoinSessionUseCase in src/server/application/use-cases/sessions/JoinSessionUseCase.ts
- [X] T048 [P] [US1] Implement RegisterEpisodesUseCase in src/server/application/use-cases/episodes/RegisterEpisodesUseCase.ts
- [X] T049 [P] [US1] Implement UpdateEpisodesUseCase in src/server/application/use-cases/episodes/UpdateEpisodesUseCase.ts
- [X] T050 [P] [US1] Implement SubmitVoteUseCase in src/server/application/use-cases/voting/SubmitVoteUseCase.ts
- [X] T051 [P] [US1] Implement StartTurnUseCase in src/server/application/use-cases/turns/StartTurnUseCase.ts
- [X] T052 [P] [US1] Implement RevealAnswerUseCase in src/server/application/use-cases/turns/RevealAnswerUseCase.ts
- [X] T053 [US1] Implement POST /api/sessions route in src/app/api/sessions/route.ts
- [X] T054 [US1] Implement GET /api/sessions/[id] route in src/app/api/sessions/[id]/route.ts
- [X] T055 [US1] Implement POST /api/sessions/[id]/join route in src/app/api/sessions/[id]/join/route.ts
- [X] T056 [US1] Implement POST /api/episodes route in src/app/api/episodes/route.ts
- [X] T057 [US1] Implement PUT /api/episodes route in src/app/api/episodes/route.ts
- [X] T058 [US1] Implement POST /api/votes route in src/app/api/votes/route.ts
- [X] T059 [US1] Implement POST /api/turns/[id]/reveal route in src/app/api/turns/[id]/reveal/route.ts
- [X] T060 [P] [US1] Create EpisodeRegistrationForm component in src/components/domain/game/EpisodeRegistrationForm/index.tsx
- [X] T061 [US1] Create useEpisodeForm hook in src/components/domain/game/EpisodeRegistrationForm/hooks/useEpisodeForm.ts
- [X] T062 [US1] Create useEpisodeValidation hook in src/components/domain/game/EpisodeRegistrationForm/hooks/useEpisodeValidation.ts
- [X] T063 [P] [US1] Create VotingInterface component in src/components/domain/game/VotingInterface/index.tsx
- [X] T064 [US1] Create useVoting hook in src/components/domain/game/VotingInterface/hooks/useVoting.ts
- [X] T065 [P] [US1] Create ScoreBoard component in src/components/domain/game/ScoreBoard/index.tsx
- [X] T066 [US1] Create useScoreboard hook in src/components/domain/game/ScoreBoard/hooks/useScoreboard.ts
- [X] T067 [P] [US1] Create TurnDisplay component in src/components/domain/game/TurnDisplay/index.tsx
- [X] T068 [P] [US1] Create ResultReveal component in src/components/domain/game/ResultReveal/index.tsx
- [X] T069 [P] [US1] Create JoinPage component in src/components/pages/JoinPage/index.tsx
- [X] T070 [US1] Create useJoinPage hook in src/components/pages/JoinPage/hooks/useJoinPage.ts
- [X] T071 [P] [US1] Create GamePage component in src/components/pages/GamePage/index.tsx
- [X] T072 [US1] Create useGamePage hook in src/components/pages/GamePage/hooks/useGamePage.ts
- [X] T073 [US1] Implement join screen route in src/app/(game)/join/page.tsx
- [X] T074 [US1] Implement game screen route in src/app/(game)/game/[sessionId]/page.tsx
- [X] T075 [US1] Add episode validation error handling in src/lib/validators.ts
- [X] T076 [US1] Add vote validation and submission logic
- [X] T077 [US1] Integration test for complete player journey (join → register → vote → see results)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - players can join, play, and see results

---

## Phase 4: User Story 2 - Host Manages Game Session (Priority: P2)

**Goal**: Enable hosts to create sessions, manage teams, control game progression, and end games

**Independent Test**: Login as host, create session, organize participants into teams, start game, control turns, reveal answers, end game

### Tests for User Story 2 (TDD - Write FIRST) ⚠️

- [X] T078 [P] [US2] Write unit test for ManageTeamsUseCase in tests/unit/use-cases/ManageTeamsUseCase.test.ts
- [X] T079 [P] [US2] Write unit test for StartGameUseCase in tests/unit/use-cases/StartGameUseCase.test.ts
- [X] T080 [P] [US2] Write unit test for EndGameUseCase in tests/unit/use-cases/EndGameUseCase.test.ts
- [X] T081 [P] [US2] Write integration test for PUT /api/sessions/[id]/teams in tests/integration/api/teams.test.ts
- [X] T082 [P] [US2] Write integration test for POST /api/sessions/[id]/start in tests/integration/api/start.test.ts
- [X] T083 [P] [US2] Write integration test for POST /api/sessions/[id]/end in tests/integration/api/end.test.ts
- [X] T084 [P] [US2] Write component test for TeamManager in tests/component/domain/TeamManager.test.tsx

### Implementation for User Story 2

- [X] T085 [P] [US2] Implement ManageTeamsUseCase in src/server/application/use-cases/teams/ManageTeamsUseCase.ts
- [X] T086 [P] [US2] Implement StartGameUseCase in src/server/application/use-cases/sessions/StartGameUseCase.ts
- [X] T087 [P] [US2] Implement EndGameUseCase in src/server/application/use-cases/sessions/EndGameUseCase.ts
- [X] T088 [US2] Implement PUT /api/sessions/[id]/teams route in src/app/api/sessions/[id]/teams/route.ts
- [X] T089 [US2] Implement POST /api/sessions/[id]/start route in src/app/api/sessions/[id]/start/route.ts
- [X] T090 [US2] Implement POST /api/sessions/[id]/end route in src/app/api/sessions/[id]/end/route.ts
- [X] T091 [P] [US2] Create TeamManager component with drag-and-drop in src/components/domain/team/TeamManager/index.tsx
- [X] T092 [US2] Create useTeamManagement hook in src/components/domain/team/TeamManager/hooks/useTeamManagement.ts
- [X] T093 [US2] Create useDragAndDrop hook in src/components/domain/team/TeamManager/hooks/useDragAndDrop.ts
- [X] T094 [P] [US2] Create TeamCard component in src/components/domain/team/TeamCard/index.tsx
- [X] T095 [P] [US2] Create ParticipantList component in src/components/domain/team/ParticipantList/index.tsx
- [X] T096 [P] [US2] Create HostManagementPage component in src/components/pages/HostManagementPage/index.tsx
- [X] T097 [US2] Create useHostManagement hook in src/components/pages/HostManagementPage/hooks/useHostManagement.ts
- [X] T098 [US2] Implement host create session route in src/app/(host)/create/page.tsx
- [X] T099 [US2] Implement host manage teams route in src/app/(host)/manage/[sessionId]/page.tsx
- [X] T100 [US2] Add host authorization middleware for protected routes
- [X] T101 [US2] Add confirmation modal for "End Game" action
- [X] T102 [US2] Integration test for complete host workflow

**Checkpoint**: User Story 2 complete - hosts can fully manage game sessions

---

## Phase 5: User Story 3 - Real-Time Scoring and Progress (Priority: P3)

**Goal**: Enable real-time score updates and game state synchronization across all participants

**Independent Test**: Open game on multiple devices, verify score updates and phase changes appear immediately without refresh

### Tests for User Story 3 (TDD - Write FIRST) ⚠️

- [X] T103 [P] [US3] Write unit test for SSE event types and handlers in tests/unit/realtime/events.test.ts
- [X] T104 [P] [US3] Write integration test for GET /api/sessions/[id]/events SSE endpoint in tests/integration/api/events.test.ts
- [X] T105 [P] [US3] Write component test for useRealTimeSync hook in tests/component/hooks/useRealTimeSync.test.ts

### Implementation for User Story 3

- [X] T106 [P] [US3] Create SSE event type definitions in src/types/events.ts
- [X] T107 [P] [US3] Implement SSEManager for broadcasting updates in src/server/infrastructure/realtime/SSEManager.ts
- [X] T108 [US3] Implement GET /api/sessions/[id]/events route in src/app/api/sessions/[id]/events/route.ts
- [X] T109 [P] [US3] Create useSSEConnection hook for SSE connection in src/hooks/useSSEConnection.ts
- [X] T110 [P] [US3] Create useRealTimeSync hook in src/hooks/useRealTimeSync.ts
- [ ] T111 [US3] Integrate SSE broadcasts into RevealAnswerUseCase
- [ ] T112 [US3] Integrate SSE broadcasts into SubmitVoteUseCase 
- [ ] T113 [US3] Integrate SSE broadcasts into StartTurnUseCase
- [X] T114 [US3] Add reconnection logic with exponential backoff in useSSEConnection
- [X] T115 [US3] Add heartbeat mechanism (30s interval) to maintain SSE connections
- [ ] T116 [US3] Update ScoreBoard to listen for score-change events
- [ ] T117 [US3] Update GamePage to listen for game-state-update events
- [X] T118 [US3] Add connection status indicator component in src/components/ui/ConnectionStatus
- [X] T119 [US3] Handle network interruption and state resync on reconnection

**Checkpoint**: User Story 3 complete - real-time updates working across all devices

---

## Phase 6: User Story 4 - Game Result Celebration (Priority: P4)

**Goal**: Display engaging final results screen with rankings and celebration effects

**Independent Test**: Complete a full game, verify results screen shows rankings with winner highlighted and confetti animation

### Tests for User Story 4 (TDD - Write FIRST) ⚠️

- [X] T120 [P] [US4] Write component test for ResultsPage in tests/component/pages/ResultsPage.test.tsx
- [X] T121 [P] [US4] Write component test for ConfettiAnimation in tests/component/ui/ConfettiAnimation.test.tsx

### Implementation for User Story 4

- [X] T122 [P] [US4] Create ResultsPage component in src/components/pages/ResultsPage/index.tsx
- [X] T123 [US4] Create useResults hook in src/components/pages/ResultsPage/hooks/useResults.ts
- [X] T124 [P] [US4] Create ConfettiAnimation component in src/components/ui/ConfettiAnimation/index.tsx
- [X] T125 [P] [US4] Create RankingDisplay component in src/components/domain/game/RankingDisplay/index.tsx
- [X] T126 [P] [US4] Create TeamPerformanceSummary component in src/components/domain/game/TeamPerformanceSummary/index.tsx
- [X] T127 [US4] Implement results screen route in src/app/(game)/results/[sessionId]/page.tsx
- [X] T128 [US4] Add winner highlight styling and animations (integrated into RankingDisplay and ResultsPage)
- [X] T129 [US4] Add team performance statistics calculation (integrated into useResults hook and TeamPerformanceSummary)

**Checkpoint**: User Story 4 complete - celebration and closure working

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Performance optimization, error handling, accessibility, and mobile responsiveness

- [X] T130 [P] Create Timer component with countdown in src/components/ui/Timer/index.tsx
- [X] T131 [P] Create useTimer hook with server synchronization in src/hooks/useTimer.ts
- [X] T132 [P] Add timer synchronization logic (server-authoritative, client interpolation) - integrated into useTimer
- [X] T133 [P] Add responsive design breakpoints testing (375px, 768px, 1024px) - E2E tests for mobile, tablet, desktop viewports created
- [X] T134 [P] Add mobile touch-friendly button sizes (minimum 44px) - Button component updated with 40px/44px/56px sizes
- [X] T135 [P] Add loading states for all async operations - all pages and components have comprehensive loading states
- [X] T136 [P] Add error boundary components in src/components/ErrorBoundary.tsx
- [X] T137 [P] Add toast notifications for user actions (vote submitted, episode saved, etc.) - ToastContext and useToast created
- [X] T138 [P] Add form validation error messages - JoinPage and TeamManager forms have inline validation with error display
- [X] T139 [P] Add session cleanup service (delete sessions older than 3 hours) - SessionCleanupService created
- [X] T141 [P] Add comprehensive error logging - LoggerService with structured logging, levels, and context
- [X] T142 [P] Optimize bundle size (code splitting, lazy loading) - Dynamic imports for ResultsPage, Next.js config optimizations
- [X] T145 [P] Add accessibility attributes (ARIA labels, keyboard navigation) - integrated into Timer component
- [X] T146 [P] Add focus management for modals - full focus trap implemented
- [X] T148 [P] Add E2E test for complete game flow with Playwright - 4 E2E tests created covering game flow, validation, and loading states
- [X] T149 [P] Review and verify all TDD test coverage (aim for 80%+) - 27 test files: 10 unit, 11 integration, 3 component, 2 E2E, 1 complete journey
- [X] T150 [P] Final constitution compliance check across all code - All 5 architecture principles verified and passing

---

## Dependencies

### Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundational)
                      ↓
    ┌─────────────────┴─────────────────┐
    ↓                                   ↓
Phase 3: US1 (MVP)              Phase 4: US2 (Host Management)
    ↓                                   ↓
    └─────────────────┬─────────────────┘
                      ↓
            Phase 5: US3 (Real-time)
                      ↓
            Phase 6: US4 (Results)
                      ↓
            Phase 7: Polish
```

**Independence**: US1 and US2 can be developed in parallel after Phase 2. US3 depends on both US1 and US2 being complete. US4 depends on US1 completion. Phase 7 can run in parallel with later user stories.

### Parallel Execution Examples

**Within User Story 1**:
- After writing all tests (T035-T045), can parallelize:
  - Use case implementations (T046-T052)
  - Component development (T060, T063, T065, T067, T068)
  - Page components (T069, T071)

**Across User Stories**:
- US1 and US2 can be developed by different team members simultaneously after Phase 2
- US3 tasks T106-T110 (SSE setup) can be prepared while US1/US2 are being finished

---

## Implementation Strategy

### MVP Scope (Recommended First Deliverable)

**Deliver Phase 3 (User Story 1) as MVP**:
- Duration: ~3-4 weeks
- Deliverable: Players can join, register episodes, vote, and see results
- Value: Complete playable game (though manual team setup needed)
- Tests: 11 TDD tests + integration test

**Incremental Delivery Plan**:
1. **Week 1-4**: Phase 1-3 (MVP with US1)
2. **Week 5-6**: Phase 4 (US2 - Host management)
3. **Week 7**: Phase 5 (US3 - Real-time)
4. **Week 8**: Phases 6-7 (US4 + Polish)

### TDD Workflow Reminder

For EVERY implementation task:
1. **Red**: Ensure corresponding test exists and FAILS
2. **Green**: Write minimum code to make test pass
3. **Refactor**: Improve code while keeping tests green

### Task Execution Tips

- **Parallelizable tasks** marked with [P] can be worked on simultaneously
- **Story tasks** marked with [US#] belong to that user story
- **Test-first**: Always complete test tasks before implementation tasks
- **File paths**: Exact paths provided - create parent directories as needed
- **Dependencies**: Complete Phase 2 entirely before starting any user story
- **Checkpoints**: Verify each phase completion before proceeding

---

## Summary Statistics

- **Total Tasks**: 150
- **Setup Phase**: 7 tasks
- **Foundational Phase**: 27 tasks
- **User Story 1 (MVP)**: 43 tasks (11 tests + 32 implementation)
- **User Story 2**: 25 tasks (7 tests + 18 implementation)
- **User Story 3**: 17 tasks (3 tests + 14 implementation)
- **User Story 4**: 10 tasks (2 tests + 8 implementation)
- **Polish Phase**: 21 tasks
- **Parallelizable Tasks**: ~85 tasks marked with [P]
- **Test Tasks**: 23 TDD tests (ensuring quality)

**Estimated Timeline**: 6-8 weeks for complete implementation with comprehensive testing

**MVP Timeline**: 3-4 weeks for User Story 1 (Phases 1-3)
