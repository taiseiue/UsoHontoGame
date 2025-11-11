# Implementation Tasks: Game Preparation for Moderators

**Feature**: 002-game-preparation
**Branch**: `002-game-preparation`
**Generated**: 2025-11-10
**Last Updated**: 2025-11-10 (refined based on cross-artifact analysis)
**Total Tasks**: 89

## Overview

This document provides a complete, dependency-ordered task list for implementing the game preparation feature. Tasks are organized by user story (US1-US6) to enable independent implementation and testing.

**Tech Stack**: TypeScript 5, Next.js 16, React 19, Prisma 6, Zod 3, SQLite, Vitest, Playwright

**Analytics-Driven Improvements**: This task list has been refined based on cross-artifact analysis to address:
- Episode text validation (1-1000 chars) emphasized as CRITICAL requirement
- "Complete presenter" definition clarified (exactly 3 episodes AND exactly 1 lie)
- Presenter nickname lookup error handling explicitly included
- Test coverage enhanced for edge cases and error scenarios

## Implementation Strategy

**MVP Scope** (Recommended First Milestone):
- ✅ User Story 1 (P1): Create New Game
- Delivers immediate value: Moderators can create and persist games
- Independent test: Create game → verify in database → verify in game list

**Incremental Delivery**:
1. **Sprint 1** (MVP): US1 - Game creation foundation
2. **Sprint 2**: US2 + US3 - Content creation (presenters/episodes) + status management
3. **Sprint 3**: US4 + US5 + US6 - Game management (list, edit, delete)

## Task Legend

- `[P]` = Parallelizable (can run simultaneously with other [P] tasks in same phase)
- `[US#]` = User Story number (US1-US6)
- Task IDs are in recommended execution order (T001-T089)

---

## Phase 1: Setup & Infrastructure

**Goal**: Establish database, validation layer, and foundational architecture

### Setup Tasks

- [X] T001 Install Prisma and Zod dependencies: `npm install prisma @prisma/client zod && npm install -D prisma`
- [X] T002 Initialize Prisma with SQLite: `npx prisma init --datasource-provider sqlite`
- [X] T003 Configure database URL in `.env`: `DATABASE_URL="file:./dev.db"`
- [X] T004 Create Prisma schema in `prisma/schema.prisma` with Game, Presenter, Episode models
- [X] T005 Run initial migration: `npx prisma migrate dev --name init`
- [X] T006 Generate Prisma Client: `npx prisma generate`

### Zod Validation Schemas

- [X] T007 [P] Create directory structure: `mkdir -p src/server/domain/schemas`
- [X] T008 [P] Create GameId and GameStatus Zod schemas in `src/server/domain/schemas/gameSchemas.ts`
- [X] T009 [P] Create CreateGameSchema with playerLimit validation (1-100) in `src/server/domain/schemas/gameSchemas.ts`
- [X] T010 [P] Create AddPresenterSchema with nickname validation in `src/server/domain/schemas/gameSchemas.ts`
- [X] T011 [P] Create AddEpisodeSchema with text validation (1-1000 chars, CRITICAL requirement) and isLie boolean in `src/server/domain/schemas/gameSchemas.ts`
- [X] T012 [P] Create CompletePresenterSchema for "complete presenter" validation (exactly 3 episodes AND exactly 1 lie) in `src/server/domain/schemas/validators.ts`
- [X] T013 [P] Write unit tests for all Zod schemas (including edge cases: 0 chars, 1001 chars, multiple lies) in `tests/unit/schemas/gameSchemas.test.ts`

---

## Phase 2: Foundational Layer (Domain + Infrastructure)

**Goal**: Build reusable domain entities and repository infrastructure

### Domain Errors

- [X] T014 [P] Create ValidationError class in `src/server/domain/errors/ValidationError.ts`
- [X] T015 [P] Create InvalidStatusTransitionError class in `src/server/domain/errors/InvalidStatusTransitionError.ts`

### Value Objects

- [X] T016 [P] Create GameId value object with UUID validation in `src/server/domain/value-objects/GameId.ts`
- [X] T017 [P] Create GameStatus value object with enum validation in `src/server/domain/value-objects/GameStatus.ts`
- [X] T018 [P] Write unit tests for GameId in `tests/unit/domain/GameId.test.ts`
- [X] T019 [P] Write unit tests for GameStatus in `tests/unit/domain/GameStatus.test.ts`

### Domain Entities

- [X] T020 Create Episode entity with validation in `src/server/domain/entities/Episode.ts`
- [X] T021 Create Presenter entity with hasCompleteEpisodes() method in `src/server/domain/entities/Presenter.ts`
- [X] T022 Create Game entity with status transitions (startAccepting, close) in `src/server/domain/entities/Game.ts`
- [X] T023 [P] Write unit tests for Episode entity in `tests/unit/domain/Episode.test.ts`
- [X] T024 [P] Write unit tests for Presenter entity in `tests/unit/domain/Presenter.test.ts`
- [X] T025 [P] Write unit tests for Game entity (30 tests covering all validations) in `tests/unit/domain/Game.test.ts`

### Repository Layer

- [X] T026 Create IGameRepository interface in `src/server/domain/repositories/IGameRepository.ts`
- [X] T027 Create PrismaGameRepository implementation in `src/server/infrastructure/repositories/PrismaGameRepository.ts`
- [X] T028 Update InMemoryGameRepository to match IGameRepository interface in `src/server/infrastructure/repositories/InMemoryGameRepository.ts`
- [X] T029 Create repository factory with DI in `src/server/infrastructure/repositories/index.ts`
- [X] T030 [P] Write integration tests for PrismaGameRepository in `tests/integration/repositories/PrismaGameRepository.test.ts`
- [X] T031 [P] Write integration tests for InMemoryGameRepository in `tests/integration/repositories/InMemoryGameRepository.test.ts`

---

## Phase 3: User Story 1 - Create New Game (P1 - MVP)

**Goal**: Moderators can create and persist games with player limits

**Independent Test**: Create game with player limit → verify stored in database → verify appears in game list

**Value Delivered**: Foundation for all other features - games can exist and be persisted

### Application Layer

- [X] T032 [US1] Create GameDto type in `src/server/application/dto/GameDto.ts`
- [X] T033 [US1] Implement CreateGame use case in `src/server/application/use-cases/games/CreateGame.ts`
- [X] T034 [US1] Write unit tests for CreateGame use case in `tests/unit/use-cases/CreateGame.test.ts`

### Presentation Layer

- [X] T035 [US1] Create createGameAction Server Action with Zod validation in `src/app/actions/game.ts`
- [X] T036 [US1] Create useGameForm custom hook with Zod validation in `src/hooks/useGameForm.ts`
- [X] T037 [US1] Create GameForm component in `src/components/domain/game/GameForm.tsx`
- [X] T038 [US1] Create game creation page in `src/app/games/create/page.tsx`
- [X] T039 [US1] Write E2E test for game creation flow in `tests/e2e/game-creation.spec.ts`

**US1 Completion Criteria**:
- ✅ Game created with valid player limit (1-100)
- ✅ Game stored in SQLite database with UUID
- ✅ Validation errors shown for invalid input
- ✅ Redirect to game list after successful creation

---

## Phase 4: User Story 2 - Register Presenters and Episodes (P2)

**Goal**: Add presenters to games and allow episode registration with lie markers

**Independent Test**: Add presenter to game → register 3 episodes → mark one as lie → verify confidentiality

**Value Delivered**: Games become playable with content

**Dependencies**: Requires US1 (games must exist)

### Application Layer

- [X] T040 [US2] Create PresenterWithLieDto type in `src/server/application/dto/PresenterWithLieDto.ts`
- [X] T041 [US2] Create EpisodeWithLieDto type in `src/server/application/dto/EpisodeWithLieDto.ts`
- [X] T042 [US2] Create EpisodeDto (public, no isLie) type in `src/server/application/dto/EpisodeDto.ts`
- [X] T043 [US2] Implement AddPresenter use case with nickname lookup validation (throw NotFoundError if nickname doesn't exist in session system) in `src/server/application/use-cases/games/AddPresenter.ts`
- [X] T044 [US2] Implement RemovePresenter use case in `src/server/application/use-cases/games/RemovePresenter.ts`
- [X] T045 [US2] Implement AddEpisode use case with lie marker validation in `src/server/application/use-cases/games/AddEpisode.ts`
- [X] T046 [US2] Implement GetPresenterEpisodes use case (with access control) in `src/server/application/use-cases/games/GetPresenterEpisodes.ts`
- [X] T047 [P] [US2] Write unit tests for AddPresenter (including NotFoundError for invalid nickname) in `tests/unit/use-cases/AddPresenter.test.ts`
- [X] T048 [P] [US2] Write unit tests for AddEpisode in `tests/unit/use-cases/AddEpisode.test.ts`

### Presentation Layer

- [X] T049 [US2] Create presenter action Server Actions (addPresenter, removePresenter with Zod validation and NotFoundError handling) in `src/app/actions/presenter.ts`
- [X] T050 [US2] Create usePresenterForm hook with Zod in `src/hooks/usePresenterForm.ts`
- [X] T051 [US2] Create useEpisodeForm hook with Zod in `src/hooks/useEpisodeForm.ts`
- [X] T052 [US2] Create PresenterList component in `src/components/domain/game/PresenterList.tsx`
- [X] T053 [US2] Create PresenterForm component in `src/components/domain/game/PresenterForm.tsx`
- [X] T054 [US2] Create EpisodeList component with lie marker (confidential) in `src/components/domain/game/EpisodeList.tsx`
- [X] T055 [US2] Create EpisodeForm component in `src/components/domain/game/EpisodeForm.tsx`
- [X] T056 [US2] Create presenter management page in `src/app/games/[id]/presenters/page.tsx`
- [X] T057 [US2] Write E2E test for presenter registration flow in `tests/e2e/presenter-management.spec.ts`

**US2 Completion Criteria**:
- ✅ Presenter added to game with nickname
- ✅ 3 episodes registered per presenter
- ✅ Exactly 1 episode marked as lie
- ✅ Lie marker visible only to presenter/moderator
- ✅ Maximum 10 presenters enforced

---

## Phase 5: User Story 3 - Manage Game Status (P2)

**Goal**: Control game flow through status transitions (準備中 → 出題中 → 締切)

**Independent Test**: Transition game through all statuses → verify validation → verify TOP page visibility

**Value Delivered**: Games can progress from preparation to live to closed

**Dependencies**: Requires US1 (games) and US2 (presenters/episodes for validation)

### Application Layer

- [ ] T058 [US3] Implement StartAcceptingResponses use case with validation in `src/server/application/use-cases/games/StartAcceptingResponses.ts`
- [ ] T059 [US3] Implement CloseGame use case in `src/server/application/use-cases/games/CloseGame.ts`
- [ ] T060 [P] [US3] Write unit tests for StartAcceptingResponses in `tests/unit/use-cases/StartAcceptingResponses.test.ts`
- [ ] T061 [P] [US3] Write unit tests for CloseGame in `tests/unit/use-cases/CloseGame.test.ts`

### Presentation Layer

- [ ] T062 [US3] Create startAcceptingAction Server Action in `src/app/actions/game.ts`
- [ ] T063 [US3] Create closeGameAction Server Action in `src/app/actions/game.ts`
- [ ] T064 [US3] Add status transition buttons to GameCard component in `src/components/domain/game/GameCard.tsx`
- [ ] T065 [US3] Create Badge component for status display in `src/components/ui/Badge.tsx`
- [ ] T066 [US3] Write E2E test for status transitions in `tests/e2e/status-transitions.spec.ts`

**US3 Completion Criteria**:
- ✅ Game transitions from 準備中 to 出題中 (with validation)
- ✅ Game transitions from 出題中 to 締切
- ✅ Cannot transition without valid presenters/episodes
- ✅ Game visible on TOP page when 出題中
- ✅ Game hidden from TOP page when 締切

---

## Phase 6: User Story 4 - View and Manage Game List (P3)

**Goal**: Display all moderator's games in organized list with actions

**Independent Test**: Create multiple games → verify all appear in list → verify action buttons work

**Value Delivered**: Efficient game management interface

**Dependencies**: Requires US1 (games must exist to list)

### Application Layer

- [ ] T067 [US4] Implement GetGamesByCreator use case in `src/server/application/use-cases/games/GetGamesByCreator.ts`
- [ ] T068 [US4] Implement GetGameDetail use case in `src/server/application/use-cases/games/GetGameDetail.ts`
- [ ] T069 [P] [US4] Write unit tests for GetGamesByCreator in `tests/unit/use-cases/GetGamesByCreator.test.ts`

### Presentation Layer

- [ ] T070 [US4] Create getGamesAction Server Action in `src/app/actions/game.ts`
- [ ] T071 [US4] Create GameCard component with status badge in `src/components/domain/game/GameCard.tsx`
- [ ] T072 [US4] Create GameList component with empty state in `src/components/domain/game/GameList.tsx`
- [ ] T073 [US4] Create game list page in `src/app/games/page.tsx`
- [ ] T074 [US4] Create Card UI component in `src/components/ui/Card.tsx`
- [ ] T075 [US4] Write E2E test for game list display in `tests/e2e/game-list.spec.ts`

**US4 Completion Criteria**:
- ✅ All moderator's games displayed in list
- ✅ Each game shows status, player limit, presenter count
- ✅ Empty state shown when no games exist
- ✅ Navigate to game creation from list
- ✅ Navigate to game edit from list

---

## Phase 7: User Story 5 - Edit Existing Game (P3)

**Goal**: Modify game settings when in preparation status

**Independent Test**: Edit game player limit → verify saved → edit presenter → verify cascade

**Value Delivered**: Flexibility to correct mistakes before game goes live

**Dependencies**: Requires US1 (games), US2 (presenters), US4 (game detail view)

### Application Layer

- [ ] T076 [US5] Create GameDetailDto type in `src/server/application/dto/GameDetailDto.ts`
- [ ] T077 [US5] Implement UpdateGameSettings use case in `src/server/application/use-cases/games/UpdateGameSettings.ts`
- [ ] T078 [US5] Write unit tests for UpdateGameSettings in `tests/unit/use-cases/UpdateGameSettings.test.ts`

### Presentation Layer

- [ ] T079 [US5] Create updateGameAction Server Action with Zod in `src/app/actions/game.ts`
- [ ] T080 [US5] Create game detail/edit page in `src/app/games/[id]/page.tsx`
- [ ] T081 [US5] Add edit mode to GameForm component in `src/components/domain/game/GameForm.tsx`
- [ ] T082 [US5] Write E2E test for game editing flow in `tests/e2e/game-edit.spec.ts`

**US5 Completion Criteria**:
- ✅ Player limit editable when status is 準備中
- ✅ Presenters removable (cascade deletes episodes)
- ✅ Editing blocked when status is 出題中 or 締切
- ✅ Changes saved immediately
- ✅ Validation errors shown for invalid edits

---

## Phase 8: User Story 6 - Delete Game (P3)

**Goal**: Remove games with confirmation for active/closed games

**Independent Test**: Delete 準備中 game → verify removed → attempt delete 出題中 game → verify confirmation

**Value Delivered**: Game list organization and cleanup

**Dependencies**: Requires US1 (games), US4 (game list)

### Application Layer

- [ ] T083 [US6] Implement DeleteGame use case with cascade in `src/server/application/use-cases/games/DeleteGame.ts`
- [ ] T084 [US6] Write unit tests for DeleteGame in `tests/unit/use-cases/DeleteGame.test.ts`

### Presentation Layer

- [ ] T085 [US6] Create deleteGameAction Server Action with confirmation in `src/app/actions/game.ts`
- [ ] T086 [US6] Add delete button to GameCard with confirmation dialog in `src/components/domain/game/GameCard.tsx`
- [ ] T087 [US6] Write E2E test for game deletion in `tests/e2e/game-delete.spec.ts`

**US6 Completion Criteria**:
- ✅ Game deleted when status is 準備中
- ✅ Confirmation shown for 出題中 or 締切 games
- ✅ Cascade deletes presenters and episodes
- ✅ Game removed from list immediately
- ✅ Can cancel deletion

---

## Phase 9: Polish & Cross-Cutting Concerns

**Goal**: UI consistency, accessibility, and final integration

### UI Components

- [X] T088 [P] Create Button component with variants in `src/components/ui/Button.tsx`
- [X] T089 [P] Create Input component with validation states in `src/components/ui/Input.tsx`

---

## Dependency Graph

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3+ (User Stories)

User Story Dependencies:
- US1 (Create Game) ........................... No dependencies [MVP]
- US2 (Presenters/Episodes) ................... Requires US1
- US3 (Status Management) ..................... Requires US1, US2
- US4 (Game List) ............................. Requires US1
- US5 (Edit Game) ............................. Requires US1, US2, US4
- US6 (Delete Game) ........................... Requires US1, US4
```

## Parallel Execution Opportunities

### Phase 1 (Setup)
- T007-T012: All Zod schema creation tasks can run in parallel

### Phase 2 (Foundational)
- T014-T015: Domain errors can run in parallel
- T016-T017: Value objects can run in parallel
- T018-T019: Value object tests can run in parallel
- T023-T025: Entity tests can run in parallel after entities created
- T030-T031: Repository tests can run in parallel

### User Story Phases
- Within each user story phase, test tasks marked [P] can run in parallel with other [P] tasks
- Example US2: T047-T048 (use case tests) can run in parallel

## Testing Strategy

**Test-Driven Development** (per Constitution Principle IV):
1. Write tests first for each component (marked as [P] tasks)
2. Implement to make tests pass
3. Refactor while keeping tests green

**Test Coverage**:
- Unit tests: Domain entities, value objects, use cases, Zod schemas
- Integration tests: Repositories (Prisma + InMemory)
- E2E tests: Complete user flows for each user story

**Independent Test Criteria** (per user story):
- Each user story has defined acceptance scenarios
- Each user story delivers testable, incremental value
- Tests can run independently without blocking other stories

## Implementation Notes

1. **Zod Validation Pattern**: All Server Actions validate input with Zod before calling use cases
2. **Repository Pattern**: Use dependency injection to swap InMemory/Prisma repos
3. **Lie Marker Security**: Never expose `isLie` field in public DTOs (FR-006)
4. **Status Transitions**: Enforce business rules in Game entity methods
5. **Custom Hooks**: Extract all form logic from components (Constitution Principle III)
6. **Server Components First**: Default to Server Components, Client only for interactivity
7. **Episode Text Validation**: 1-1000 character limit is a CRITICAL requirement, not an assumption - validate in Zod schema and test edge cases
8. **Presenter Nickname Lookup**: Validate nickname exists in session system before adding presenter, throw NotFoundError for invalid nicknames
9. **Complete Presenter Definition**: Exactly 3 episodes AND exactly 1 lie marker - validate before status transition to 出題中
10. **Concurrent Edits**: Last-write-wins strategy (no optimistic locking in MVP) - document for future enhancement

## Next Steps

1. **Start with MVP**: Implement US1 (T001-T039) for first working version
2. **Add Content**: Implement US2 and US3 (T040-T066) for playable games
3. **Complete Management**: Implement US4-US6 (T067-T087) for full feature
4. **Polish**: Implement Phase 9 (T088-T089) for UI consistency

**Total Tasks**: 89 (Setup: 13, Foundational: 18, US1: 8, US2: 18, US3: 9, US4: 9, US5: 7, US6: 5, Polish: 2)
