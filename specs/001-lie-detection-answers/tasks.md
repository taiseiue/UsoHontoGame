# Tasks: 嘘当て回答機能

**Feature**: Answer submission for lie detection game
**Branch**: `001-lie-detection-answers`
**Input**: Design documents from `/specs/001-lie-detection-answers/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: TDD is mandatory per constitution. Tests are written FIRST, implementation SECOND.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a full-stack Next.js application with Clean Architecture:
- Domain: `src/server/domain/`
- Application: `src/server/application/`
- Infrastructure: `src/server/infrastructure/`
- Presentation: `src/app/`, `src/components/`
- Tests: Co-located with implementation files (`.test.ts`, `.test.tsx`) and `tests/integration/`, `tests/e2e/`

---

## Phase 1: Setup (Database Schema)

**Purpose**: Add Answer and Participation models to database schema

- [x] T001 Add Answer model to prisma/schema.prisma with fields (id, sessionId, gameId, nickname, selections, createdAt, updatedAt) and unique constraint on (sessionId, gameId)
- [x] T002 Add Participation model to prisma/schema.prisma with fields (id, sessionId, gameId, nickname, joinedAt) and unique constraint on (sessionId, gameId)
- [x] T003 Add Answer and Participation relations to existing Game model in prisma/schema.prisma
- [x] T004 Create and run Prisma migration: `npx prisma migrate dev --name add_answer_and_participation_models`
- [x] T005 Generate Prisma Client: `npx prisma generate`
- [x] T006 Verify existing tests still pass: `npm run test:integration`

---

## Phase 2: Foundational (Domain & Infrastructure Layers - TDD)

**Purpose**: Core domain entities and repository implementations that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Domain Entities (TDD)

- [x] T007 [P] Write failing tests for Answer entity in src/server/domain/entities/Answer.test.ts (create, validation, toJSON)
- [x] T008 [P] Write failing tests for Participation entity in src/server/domain/entities/Participation.test.ts (create, validation, toJSON)
- [x] T009 [P] Implement Answer entity in src/server/domain/entities/Answer.ts to pass T007 tests
- [x] T010 [P] Implement Participation entity in src/server/domain/entities/Participation.ts to pass T008 tests

### Repository Interfaces

- [x] T011 [P] Create IAnswerRepository interface in src/server/domain/repositories/IAnswerRepository.ts (upsert, findBySessionAndGame, findByGameId, delete methods)
- [x] T012 [P] Create IParticipationRepository interface in src/server/domain/repositories/IParticipationRepository.ts (create, exists, countByGameId, findBySessionAndGame methods)

### Repository Implementations (TDD - Integration Tests)

- [x] T013 [P] Write failing integration tests for PrismaAnswerRepository in src/server/infrastructure/repositories/PrismaAnswerRepository.test.ts (upsert, find, delete with isolated test DB)
- [x] T014 [P] Write failing integration tests for PrismaParticipationRepository in src/server/infrastructure/repositories/PrismaParticipationRepository.test.ts (create, exists, count with isolated test DB)
- [x] T015 Implement PrismaAnswerRepository in src/server/infrastructure/repositories/PrismaAnswerRepository.ts to pass T013 tests
- [x] T016 Implement PrismaParticipationRepository in src/server/infrastructure/repositories/PrismaParticipationRepository.ts to pass T014 tests

### DTOs & Schemas

- [x] T017 [P] Create SubmitAnswerRequest DTO in src/server/application/dto/requests/SubmitAnswerRequest.ts
- [x] T018 [P] Create AnswerResponse DTO in src/server/application/dto/responses/AnswerResponse.ts
- [x] T019 [P] Write failing tests for answer schemas in src/server/domain/schemas/answerSchemas.test.ts
- [x] T020 [P] Create Zod schemas in src/server/domain/schemas/answerSchemas.ts to pass T019 tests

### Shared Hooks (TDD)

- [x] T021 Write failing tests for useParticipantSession hook in src/hooks/useParticipantSession.test.ts
- [x] T022 Implement useParticipantSession hook in src/hooks/useParticipantSession.ts to pass T021 tests

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - ゲーム参加と回答提出 (Priority: P1) 🎯 MVP

**Goal**: Participant can select a game from TOP page, navigate to answer screen, select one lie episode per presenter, and submit their answer successfully.

**Why this priority**: Core game functionality - without this, the game cannot be played. This is the essential "lie detection" experience.

**Independent Test**: With a published game (出題中 status) displaying on TOP page, participant clicks game → answer screen loads with all presenters/episodes → participant selects one episode per presenter → submit button activates → submission succeeds → redirect to TOP page. Answer is saved in database.

### Use Cases (TDD)

- [x] T023 [P] [US1] Write failing tests for GetGameForAnswers use case in src/server/application/use-cases/answers/GetGameForAnswers.test.ts (fetch game, validate status, hide isLie)
- [x] T024 [P] [US1] Write failing tests for SubmitAnswer use case in src/server/application/use-cases/answers/SubmitAnswer.test.ts (validate, create participation, upsert answer, handle overwrites)
- [x] T025 [US1] Implement GetGameForAnswers use case in src/server/application/use-cases/answers/GetGameForAnswers.ts to pass T023 tests
- [x] T026 [US1] Implement SubmitAnswer use case in src/server/application/use-cases/answers/SubmitAnswer.ts to pass T024 tests

### Server Actions (TDD)

- [ ] T027 [P] [US1] Write failing tests for getGameForAnswers server action in src/app/actions/answers.test.ts
- [ ] T028 [P] [US1] Write failing tests for submitAnswer server action in src/app/actions/answers.test.ts
- [ ] T029 [US1] Implement getGameForAnswers server action in src/app/actions/answers.ts to pass T027 tests
- [ ] T030 [US1] Implement submitAnswer server action in src/app/actions/answers.ts to pass T028 tests

### Custom Hooks (TDD)

- [ ] T031 [P] [US1] Write failing tests for useAnswerSubmission hook in src/components/pages/AnswerSubmissionPage/hooks/useAnswerSubmission.test.ts (selection state, localStorage, submission)
- [ ] T032 [P] [US1] Write failing tests for useGameValidation hook in src/components/pages/AnswerSubmissionPage/hooks/useGameValidation.test.ts (validate on mount, handle errors)
- [ ] T033 [US1] Implement useAnswerSubmission hook in src/components/pages/AnswerSubmissionPage/hooks/useAnswerSubmission.ts to pass T031 tests
- [ ] T034 [US1] Implement useGameValidation hook in src/components/pages/AnswerSubmissionPage/hooks/useGameValidation.ts to pass T032 tests

### Domain Components (TDD)

- [X] T035 [P] [US1] Write failing tests for EpisodeSelector in src/components/domain/answer/EpisodeSelector/EpisodeSelector.test.tsx (render episodes, highlight selection, onSelect callback)
- [X] T036 [P] [US1] Write failing tests for PresenterEpisodeList in src/components/domain/answer/PresenterEpisodeList/PresenterEpisodeList.test.tsx (render all presenters, integrate EpisodeSelector)
- [X] T037 [P] [US1] Write failing tests for GameAnswerForm in src/components/domain/answer/GameAnswerForm/GameAnswerForm.test.tsx (form state, validation, submission)
- [X] T038 [US1] Implement EpisodeSelector component in src/components/domain/answer/EpisodeSelector/index.tsx to pass T035 tests
- [X] T039 [US1] Implement PresenterEpisodeList component in src/components/domain/answer/PresenterEpisodeList/index.tsx to pass T036 tests
- [X] T040 [US1] Implement GameAnswerForm component in src/components/domain/answer/GameAnswerForm/index.tsx to pass T037 tests

### Page Component (TDD)

- [X] T041 [US1] Write failing tests for AnswerSubmissionPage in src/components/pages/AnswerSubmissionPage/AnswerSubmissionPage.test.tsx (loading, error, form rendering, submit)
- [X] T042 [US1] Create AnswerSubmissionPage types in src/components/pages/AnswerSubmissionPage/AnswerSubmissionPage.types.ts
- [X] T043 [US1] Implement AnswerSubmissionPage in src/components/pages/AnswerSubmissionPage/index.tsx to pass T041 tests

### Next.js Page Wrapper

- [X] T044 [US1] Create answer page route in src/app/games/[id]/answer/page.tsx (thin wrapper, validate access, delegate to AnswerSubmissionPage)

### TOP Page Integration

- [X] T045 [US1] Update TOP page game list query to filter by status='出題中' (show only published games to participants) - Already implemented via findActiveGamesWithPagination

### Integration Tests

- [X] T046 [US1] Write and run integration test for full answer submission flow in tests/integration/answer-submission.test.ts (create participation, upsert answer, verify DB state)

### E2E Tests

- [ ] T047 [US1] Write and run E2E test for participant journey in tests/e2e/answer-submission.spec.ts (TOP → game → select → submit → verify redirect)

**Checkpoint**: At this point, User Story 1 (core answer submission) should be fully functional and testable independently. This is the MVP.

---

## Phase 4: User Story 2 - 参加人数制限の適用 (Priority: P2)

**Goal**: Enforce participant limits for games. When a game reaches its maxParticipants limit, new participants cannot join. Existing participants can still modify their answers.

**Why this priority**: Important for game quality and fairness, but P1 (core functionality) must work first. Games can temporarily run without limits.

**Independent Test**: Create game with maxParticipants=5. Have 5 sessions submit answers. 6th session tries to access answer screen → blocked with "参加人数が上限に達しました" error. One of the 5 existing sessions can still access and modify their answer.

### Use Case (TDD)

- [ ] T048 [US2] Write failing tests for ValidateGameForAnswers use case in src/server/application/use-cases/answers/ValidateGameForAnswers.test.ts (check limits, allow existing participants, deny new ones at limit)
- [ ] T049 [US2] Implement ValidateGameForAnswers use case in src/server/application/use-cases/answers/ValidateGameForAnswers.ts to pass T048 tests

### Server Action (TDD)

- [ ] T050 [US2] Write failing tests for validateGameForAnswers server action in src/app/actions/answers.test.ts (access validation, participant counting)
- [ ] T051 [US2] Implement validateGameForAnswers server action in src/app/actions/answers.ts to pass T050 tests

### Integration with SubmitAnswer

- [ ] T052 [US2] Update SubmitAnswer use case tests in src/server/application/use-cases/answers/SubmitAnswer.test.ts to include participant limit scenarios
- [ ] T053 [US2] Update SubmitAnswer use case implementation in src/server/application/use-cases/answers/SubmitAnswer.ts to enforce participant limits

### Page Validation

- [ ] T054 [US2] Update answer page route in src/app/games/[id]/answer/page.tsx to call validateGameForAnswers before rendering

### Error Handling

- [ ] T055 [US2] Update AnswerSubmissionPage error handling in src/components/pages/AnswerSubmissionPage/index.tsx to show participant limit error and redirect

### Integration Tests

- [ ] T056 [US2] Write and run integration test for participant limit enforcement in tests/integration/answer-submission.test.ts (at limit scenarios, overwrite allowed)

### E2E Tests

- [ ] T057 [US2] Write and run E2E test for participant limit in tests/e2e/answer-submission.spec.ts (6th participant blocked, existing can modify)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work. Core submission works (US1), AND participant limits are enforced (US2).

---

## Phase 5: User Story 3 - ゲーム状態検証 (Priority: P3)

**Goal**: Validate game status before allowing answer submission. Block access to games in "準備中" (preparation) or "締切" (closed) status with clear error messages.

**Why this priority**: Error handling for edge cases. In normal usage, participants only see published games on TOP page, so encountering wrong-status games is rare.

**Independent Test**: Create game in "準備中" status. Try to directly access answer screen URL → blocked with "このゲームはまだ出題されていません" error. Create game in "締切" status. Try to access → blocked with "このゲームは既に締め切られました" error.

### Update Use Case Tests

- [ ] T058 [P] [US3] Update GetGameForAnswers use case tests in src/server/application/use-cases/answers/GetGameForAnswers.test.ts to include status validation scenarios (準備中, 締切)
- [ ] T059 [P] [US3] Update SubmitAnswer use case tests in src/server/application/use-cases/answers/SubmitAnswer.test.ts to reject submissions when status changes to 締切 during selection

### Update Use Case Implementations

- [ ] T060 [US3] Update GetGameForAnswers use case in src/server/application/use-cases/answers/GetGameForAnswers.ts to validate status and return appropriate errors
- [ ] T061 [US3] Update SubmitAnswer use case in src/server/application/use-cases/answers/SubmitAnswer.ts to re-validate status at submission time (FR-014)

### Presenter Count Validation

- [ ] T062 [P] [US3] Update GetGameForAnswers use case tests in src/server/application/use-cases/answers/GetGameForAnswers.test.ts to include NO_PRESENTERS scenario
- [ ] T063 [US3] Update GetGameForAnswers use case in src/server/application/use-cases/answers/GetGameForAnswers.ts to reject games with 0 presenters (FR-015)

### Error Messages

- [ ] T064 [US3] Update error handling in src/app/actions/answers.ts to return status-specific Japanese error messages
- [ ] T065 [US3] Update AnswerSubmissionPage in src/components/pages/AnswerSubmissionPage/index.tsx to display error messages and redirect for status errors

### Integration Tests

- [ ] T066 [US3] Write and run integration test for status transitions in tests/integration/answer-submission.test.ts (準備中 → blocked, 締切 → blocked, status change during submission)

### E2E Tests

- [ ] T067 [US3] Write and run E2E test for game status errors in tests/e2e/answer-submission.spec.ts (access 準備中 game, access 締切 game, verify error messages)

**Checkpoint**: All user stories should now be independently functional. Core submission (US1), participant limits (US2), AND status validation (US3) all work.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final QA

- [ ] T068 [P] Run Biome formatting on all modified files: `npx biome format --write .`
- [ ] T069 [P] Run full test suite and verify all tests pass: `npm test`
- [ ] T070 [P] Run integration tests: `npm run test:integration`
- [ ] T071 [P] Run E2E tests: `npm run test:e2e`
- [ ] T072 [P] Verify test coverage >80%: `npm run test:coverage`
- [ ] T073 [P] Run TypeScript type checking: `npx tsc --noEmit`
- [ ] T074 [P] Verify no console errors in browser (manual test)
- [ ] T075 [P] Performance testing: Verify answer submission <200ms, game fetch <100ms
- [ ] T076 [P] Security review: Confirm isLie field never exposed in any API response
- [ ] T077 [P] Manual testing: Complete participant journey multiple times with different scenarios
- [ ] T078 [P] Manual testing: Test localStorage persistence across page refresh
- [ ] T079 [P] Manual testing: Test overwrite functionality
- [ ] T080 [P] Manual testing: Test participant limit edge cases
- [ ] T081 [P] Manual testing: Test status transition edge cases
- [ ] T082 Code cleanup: Remove debug logs, unused imports, commented code
- [ ] T083 Documentation: Update CLAUDE.md if any new patterns emerged (should already be done via update-agent-context script)
- [ ] T084 Git commit all changes with descriptive message following Conventional Commits spec
- [ ] T085 Create pull request with summary of implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Phase 2 completion
  - User stories can proceed in parallel (if team capacity allows)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Phase 2 - Extends US1 but independently testable
- **User Story 3 (P3)**: Can start after Phase 2 - Extends US1 but independently testable

### Within Each User Story

- Tests FIRST (Red)
- Implementation SECOND (Green)
- Refactor while keeping tests green
- Format and commit after each logical group
- Integration tests after all unit/component tests pass
- E2E tests after integration tests pass

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks sequential due to database dependencies

**Phase 2 (Foundational)**:
- T007-T008 (entity tests) can run in parallel
- T009-T010 (entity implementations) can run in parallel after T007-T008
- T011-T012 (repository interfaces) can run in parallel
- T013-T014 (repository tests) can run in parallel
- T017-T020 (DTOs and schemas) can run in parallel

**Phase 3 (User Story 1)**:
- T023-T024 (use case tests) can run in parallel
- T027-T028 (server action tests) can run in parallel
- T031-T032 (hook tests) can run in parallel
- T035-T037 (component tests) can run in parallel

**Phase 4 (User Story 2)**:
- Mostly sequential as it builds on US1 components

**Phase 5 (User Story 3)**:
- T058-T059 (use case test updates) can run in parallel
- T062 (presenter count test) can run in parallel with T058-T059

**Phase 6 (Polish)**:
- T068-T081 (testing and validation) can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all entity tests together:
Task: "Write failing tests for Answer entity in src/server/domain/entities/Answer.test.ts"
Task: "Write failing tests for Participation entity in src/server/domain/entities/Participation.test.ts"

# Then launch all entity implementations together:
Task: "Implement Answer entity in src/server/domain/entities/Answer.ts"
Task: "Implement Participation entity in src/server/domain/entities/Participation.ts"

# Then launch all repository interfaces together:
Task: "Create IAnswerRepository interface"
Task: "Create IParticipationRepository interface"
```

## Parallel Example: User Story 1

```bash
# Launch all use case tests together:
Task: "Write failing tests for GetGameForAnswers use case"
Task: "Write failing tests for SubmitAnswer use case"

# Launch all hook tests together (after use cases pass):
Task: "Write failing tests for useAnswerSubmission hook"
Task: "Write failing tests for useGameValidation hook"

# Launch all component tests together (after hooks pass):
Task: "Write failing tests for EpisodeSelector"
Task: "Write failing tests for PresenterEpisodeList"
Task: "Write failing tests for GameAnswerForm"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (database schema)
2. Complete Phase 2: Foundational (domain + infrastructure - CRITICAL)
3. Complete Phase 3: User Story 1 (core answer submission)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Run Phase 6: Polish tasks
6. Deploy/demo MVP

**Estimated MVP Completion**: ~2-3 days of focused TDD work

### Incremental Delivery

1. Complete Setup + Foundational (Phase 1-2) → Foundation ready
2. Add User Story 1 (Phase 3) → Test independently → Deploy/Demo (MVP! 🎯)
3. Add User Story 2 (Phase 4) → Test independently → Deploy/Demo
4. Add User Story 3 (Phase 5) → Test independently → Deploy/Demo
5. Polish (Phase 6) → Final QA → Production deployment

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. **Day 1**: Team completes Phase 1-2 together (Setup + Foundational)
2. **Day 2-3**: Once Phase 2 done:
   - Developer A: User Story 1 (Phase 3) - MVP priority
   - Developer B: User Story 2 (Phase 4) - Parallel with US1
   - Developer C: User Story 3 (Phase 5) - Parallel with US1
3. **Day 4**: Integration + Polish (Phase 6)
4. Stories complete and integrate independently

---

## Task Summary

**Total Tasks**: 85 tasks
- Phase 1 (Setup): 6 tasks
- Phase 2 (Foundational): 16 tasks
- Phase 3 (User Story 1 - P1): 25 tasks ← MVP
- Phase 4 (User Story 2 - P2): 10 tasks
- Phase 5 (User Story 3 - P3): 10 tasks
- Phase 6 (Polish): 18 tasks

**Parallel Opportunities**: 41 tasks marked [P] can run in parallel

**Independent Test Criteria**:
- **US1**: Complete answer submission flow works independently
- **US2**: Participant limits enforced, overwrite allowed for existing participants
- **US3**: Status validation blocks invalid access with clear errors

**Suggested MVP Scope**: Phase 1-3 (User Story 1 only) = 47 tasks

**Format Validation**: ✅ All tasks follow checklist format with checkbox, ID, optional [P], Story label for phases 3-5, and file paths

---

## Notes

- **TDD Workflow**: Red (failing test) → Green (pass test) → Refactor → Format → Commit
- **[P] tasks**: Different files, no dependencies, can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing (Red phase is CRITICAL)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Run `npx biome format --write .` before every commit (constitution requirement)
- **Security**: NEVER expose Episode.isLie field to clients during "出題中" phase
- **Performance**: Monitor that submission <200ms, fetch <100ms

---

## Quick Reference

**Run all tests**: `npm test`
**Run unit tests**: `npm run test:unit`
**Run integration tests**: `npm run test:integration`
**Run E2E tests**: `npm run test:e2e`
**Format code**: `npx biome format --write .`
**Type check**: `npx tsc --noEmit`
**Generate Prisma types**: `npx prisma generate`
**Reset database**: `npx prisma migrate reset`
**Prisma Studio**: `npx prisma studio`

**Design Docs**: `/specs/001-lie-detection-answers/`
**Quickstart Guide**: `quickstart.md` - Detailed TDD examples and workflows
