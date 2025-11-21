# Tasks: Results Dashboard

**Feature**: 006-results-dashboard
**Branch**: `006-results-dashboard`
**Input**: Design documents from `/specs/006-results-dashboard/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Following TDD principles per constitution (Principle IV). All tests written FIRST, ensure they FAIL before implementation.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

---

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **Checkbox**: `- [ ]` (required for all tasks)
- **[ID]**: Sequential task number (T001, T002...)
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3) - only for user story phases
- Include exact file paths in descriptions

---

## Phase 1: Setup & Foundation

**Purpose**: Project structure and DTOs (no blocking infrastructure needed - reuses existing)

- [X] T001 [P] Create ResponseStatusDto interface in src/server/application/dto/ResponseStatusDto.ts
- [X] T002 [P] Create ScoreDto interface in src/server/application/dto/ScoreDto.ts
- [X] T003 [P] Create RankingDto interface in src/server/application/dto/RankingDto.ts
- [X] T004 Create results use case directory structure: src/server/application/use-cases/results/
- [X] T005 Create results domain components directory: src/components/domain/results/
- [X] T006 Create results integration tests directory: tests/integration/results/

**Checkpoint**: ✅ Foundation ready - user stories can begin

---

## Phase 2: User Story 1 - Response Status Tracking (Priority: P1) 🎯 MVP

**Goal**: Enable moderators to monitor which participants have submitted their answers in real-time

**Independent Test**:
1. Create game with 3 participants
2. Moderator navigates to `/games/[id]/dashboard`
3. See list showing 0/3 submitted
4. Submit answer as one participant
5. Dashboard updates to 1/3 submitted
6. Verify "All responses received" appears when all submit

### Tests for User Story 1 (Write FIRST, ensure they FAIL)

- [ ] T007 [P] [US1] Write unit tests for GetResponseStatus use case in src/server/application/use-cases/results/GetResponseStatus.test.ts
- [ ] T008 [P] [US1] Write integration tests for response status API in tests/integration/results/response-status.test.ts
- [ ] T009 [P] [US1] Write component tests for ResponseStatusPage in src/components/pages/ResponseStatusPage/ResponseStatusPage.test.tsx
- [ ] T010 [P] [US1] Write hook tests for useResponseStatus in src/components/pages/ResponseStatusPage/hooks/useResponseStatus.test.ts

### Implementation for User Story 1

- [ ] T011 [US1] Implement GetResponseStatus use case in src/server/application/use-cases/results/GetResponseStatus.ts (makes T007 pass)
- [ ] T012 [US1] Implement API route handler in src/app/api/games/[gameId]/dashboard/route.ts (makes T008 pass)
- [ ] T013 [P] [US1] Create ResponseStatusPage types in src/components/pages/ResponseStatusPage/ResponseStatusPage.types.ts
- [ ] T014 [P] [US1] Create ResponseStatusList domain component in src/components/domain/results/ResponseStatusList.tsx
- [ ] T015 [US1] Implement useResponseStatus hook with polling logic in src/components/pages/ResponseStatusPage/hooks/useResponseStatus.ts (makes T010 pass)
- [ ] T016 [US1] Implement ResponseStatusPage component in src/components/pages/ResponseStatusPage/index.tsx (makes T009 pass)
- [ ] T017 [US1] Create App Router page wrapper in src/app/games/[id]/dashboard/page.tsx
- [ ] T018 [US1] Format code with Biome: npx biome format --write .
- [ ] T019 [US1] Run all tests to verify User Story 1: npm test
- [ ] T020 [US1] Manual testing: Create game, navigate to dashboard, verify polling works
- [ ] T021 [US1] Commit User Story 1: git add . && git commit -m "feat(US1): implement response status tracking dashboard"

**Checkpoint**: User Story 1 complete and independently testable. Moderators can track response submissions in real-time.

---

## Phase 3: User Story 2 - Score Calculation and Display (Priority: P2)

**Goal**: Enable automatic score calculation and display after game closes

**Independent Test**:
1. Create closed game with known answers (3 participants, 2 presenters)
2. Set up: Participant A gets 2 correct (20 points), B gets 1 correct (10 points), C gets 0 correct (0 points)
3. Navigate to `/games/[id]/scoreboard`
4. Verify scores calculated correctly
5. Verify answer details show which episodes were selected
6. Verify correct/incorrect indicators display

### Tests for User Story 2 (Write FIRST, ensure they FAIL)

- [ ] T022 [P] [US2] Write unit tests for CalculateScores use case in src/server/application/use-cases/results/CalculateScores.test.ts
- [ ] T023 [P] [US2] Write integration tests for scoreboard API in tests/integration/results/score-calculation.test.ts
- [ ] T024 [P] [US2] Write component tests for ScoreboardPage in src/components/pages/ScoreboardPage/ScoreboardPage.test.tsx
- [ ] T025 [P] [US2] Write component tests for ScoreCard in src/components/domain/results/ScoreCard.test.tsx

### Implementation for User Story 2

- [ ] T026 [US2] Implement CalculateScores use case in src/server/application/use-cases/results/CalculateScores.ts (makes T022 pass)
- [ ] T027 [US2] Implement API route handler in src/app/api/games/[gameId]/scoreboard/route.ts (makes T023 pass)
- [ ] T028 [P] [US2] Create ScoreboardPage types in src/components/pages/ScoreboardPage/ScoreboardPage.types.ts
- [ ] T029 [P] [US2] Create ScoreCard domain component in src/components/domain/results/ScoreCard.tsx (makes T025 pass)
- [ ] T030 [US2] Implement ScoreboardPage component in src/components/pages/ScoreboardPage/index.tsx (makes T024 pass)
- [ ] T031 [US2] Create App Router page wrapper in src/app/games/[id]/scoreboard/page.tsx
- [ ] T032 [US2] Format code with Biome: npx biome format --write .
- [ ] T033 [US2] Run all tests to verify User Story 2: npm test
- [ ] T034 [US2] Manual testing: Close game, navigate to scoreboard, verify scores match expected calculations
- [ ] T035 [US2] Commit User Story 2: git add . && git commit -m "feat(US2): implement score calculation and scoreboard display"

**Checkpoint**: User Stories 1 AND 2 both work independently. Scores calculated and displayed correctly.

---

## Phase 4: User Story 3 - Final Results and Winner Celebration (Priority: P3)

**Goal**: Display final rankings with winner highlighting and celebration effects

**Independent Test**:
1. Create closed game with known scores: A=30, B=30, C=20 (tie for first)
2. Navigate to `/games/[id]/results`
3. Verify rankings displayed: Rank 1 (A and B both marked as winners), Rank 3 (C)
4. Verify confetti animation plays automatically
5. Verify winners highlighted with gold styling
6. Verify congratulations message displays

### Tests for User Story 3 (Write FIRST, ensure they FAIL)

- [ ] T036 [P] [US3] Write unit tests for GetResults use case in src/server/application/use-cases/results/GetResults.test.ts
- [ ] T037 [P] [US3] Write integration tests for results API in tests/integration/results/results-display.test.ts
- [ ] T038 [P] [US3] Write component tests for Confetti in src/components/ui/Confetti.test.tsx
- [ ] T039 [P] [US3] Write component tests for WinnerCelebration in src/components/domain/results/WinnerCelebration.test.tsx
- [ ] T040 [P] [US3] Write component tests for RankingDisplay in src/components/domain/results/RankingDisplay.test.tsx
- [ ] T041 [P] [US3] Write component tests for ResultsPage in src/components/pages/ResultsPage/ResultsPage.test.tsx
- [ ] T042 [P] [US3] Write hook tests for useResults in src/components/pages/ResultsPage/hooks/useResults.test.ts

### Implementation for User Story 3

- [ ] T043 [US3] Implement GetResults use case with ranking logic in src/server/application/use-cases/results/GetResults.ts (makes T036 pass)
- [ ] T044 [US3] Implement API route handler in src/app/api/games/[gameId]/results/route.ts (makes T037 pass)
- [ ] T045 [P] [US3] Create animation helpers in src/lib/animations.ts
- [ ] T046 [P] [US3] Create Confetti UI component in src/components/ui/Confetti.tsx (makes T038 pass)
- [ ] T047 [US3] Create WinnerCelebration domain component in src/components/domain/results/WinnerCelebration.tsx (makes T039 pass, depends on T046)
- [ ] T048 [P] [US3] Create RankingDisplay domain component in src/components/domain/results/RankingDisplay.tsx (makes T040 pass)
- [ ] T049 [P] [US3] Create ResultsPage types in src/components/pages/ResultsPage/ResultsPage.types.ts
- [ ] T050 [US3] Implement useResults hook in src/components/pages/ResultsPage/hooks/useResults.ts (makes T042 pass)
- [ ] T051 [US3] Implement ResultsPage component in src/components/pages/ResultsPage/index.tsx (makes T041 pass, depends on T047-T050)
- [ ] T052 [US3] Create App Router page wrapper in src/app/games/[id]/results/page.tsx
- [ ] T053 [US3] Format code with Biome: npx biome format --write .
- [ ] T054 [US3] Run all tests to verify User Story 3: npm test
- [ ] T055 [US3] Manual testing: View results page, verify confetti plays, winners highlighted, ties handled correctly
- [ ] T056 [US3] Commit User Story 3: git add . && git commit -m "feat(US3): implement final results with winner celebration"

**Checkpoint**: All three user stories complete and independently functional. Full dashboard feature implemented.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: E2E testing, documentation, and final validation

- [ ] T057 [P] Write E2E test for moderator flow in tests/e2e/results-dashboard.test.ts
- [ ] T058 [P] Write E2E test for participant flow in tests/e2e/results-dashboard.test.ts
- [ ] T059 Run E2E tests: npm run test:e2e
- [ ] T060 Update CLAUDE.md context: .specify/scripts/bash/update-agent-context.sh claude
- [ ] T061 Run full test suite: npm test (should show 565+ tests passing)
- [ ] T062 Run build verification: npm run build
- [ ] T063 [P] Add accessibility improvements (ARIA labels, keyboard navigation)
- [ ] T064 [P] Performance optimization (lazy loading, memoization if needed)
- [ ] T065 Manual smoke test: Test all three pages end-to-end
- [ ] T066 Format final code: npx biome format --write .
- [ ] T067 Final commit: git add . && git commit -m "docs: finalize results dashboard with E2E tests and documentation"

**Checkpoint**: Feature complete, all tests passing, ready for PR

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (US1)**: Depends on Phase 1 completion
- **Phase 3 (US2)**: Depends on Phase 1 completion (independent of US1)
- **Phase 4 (US3)**: Depends on Phase 1 completion (independent of US1, US2)
- **Phase 5 (Polish)**: Depends on completion of all desired user stories

### User Story Dependencies

**US1 (Response Status)**: Independent - only needs Phase 1 setup
**US2 (Scoreboard)**: Independent - only needs Phase 1 setup, reuses CalculateScores logic
**US3 (Results)**: Independent - only needs Phase 1 setup, reuses CalculateScores via GetResults

**Critical**: Each user story is independently testable and deliverable!

### Within Each User Story (TDD Workflow)

1. **Tests FIRST**: Write all tests, verify they FAIL
2. **Implementation**: Write code to make tests pass
3. **Format**: Run Biome formatting
4. **Verify**: Run all tests
5. **Manual Test**: Verify in browser
6. **Commit**: Commit the complete user story

### Parallel Opportunities

**Phase 1 Setup** (All can run in parallel):
- T001, T002, T003 (DTO creation - different files)

**Within US1 Tests** (Can run in parallel):
- T007, T008, T009, T010 (different test files)

**Within US1 Implementation** (Some parallel):
- T013, T014 (different files, no dependencies)

**Within US2 Tests** (Can run in parallel):
- T022, T023, T024, T025 (different test files)

**Within US2 Implementation** (Some parallel):
- T028, T029 (different files, no dependencies)

**Within US3 Tests** (Can run in parallel):
- T036, T037, T038, T039, T040, T041, T042 (different test files)

**Within US3 Implementation** (Some parallel):
- T045, T046, T048, T049 (different files, no dependencies)
- T046 must complete before T047 (WinnerCelebration depends on Confetti)

**User Stories** (Can work in parallel after Phase 1):
- Developer A: User Story 1 (T007-T021)
- Developer B: User Story 2 (T022-T035)
- Developer C: User Story 3 (T036-T056)

**Polish Phase** (Some parallel):
- T057, T058 (E2E tests - different scenarios)
- T063, T064 (accessibility and performance - independent concerns)

---

## Parallel Example: User Story 1

```bash
# Launch all test writing for US1 together:
Task: "Write unit tests for GetResponseStatus use case"
Task: "Write integration tests for response status API"
Task: "Write component tests for ResponseStatusPage"
Task: "Write hook tests for useResponseStatus"

# Launch parallel implementation tasks for US1:
Task: "Create ResponseStatusPage types"
Task: "Create ResponseStatusList domain component"
# (Then hook and page implementation which depend on types)
```

---

## Parallel Example: User Story 3

```bash
# Launch all test writing for US3 together:
Task: "Write unit tests for GetResults use case"
Task: "Write integration tests for results API"
Task: "Write component tests for Confetti"
Task: "Write component tests for WinnerCelebration"
Task: "Write component tests for RankingDisplay"
Task: "Write component tests for ResultsPage"
Task: "Write hook tests for useResults"

# Launch parallel implementation tasks for US3:
Task: "Create animation helpers"
Task: "Create Confetti UI component"
Task: "Create RankingDisplay domain component"
Task: "Create ResultsPage types"
# (Then WinnerCelebration depends on Confetti)
# (Then useResults and ResultsPage depend on previous components)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: User Story 1 (T007-T021)
3. **STOP and VALIDATE**: Test User Story 1 independently
   - Moderators can track response submissions
   - Polling works correctly
   - Status updates in real-time
4. Deploy/demo if ready (MVP = response tracking only)

### Incremental Delivery

1. Setup complete (T001-T006) → Foundation ready
2. Add User Story 1 (T007-T021) → Test independently → **Deploy MVP**
3. Add User Story 2 (T022-T035) → Test independently → **Deploy v2** (adds score calculation)
4. Add User Story 3 (T036-T056) → Test independently → **Deploy v3** (adds winner celebration)
5. Polish (T057-T067) → Final touches → **Deploy final version**

Each increment adds value without breaking previous functionality!

### Parallel Team Strategy

With multiple developers after Phase 1 setup:

**Scenario 1: Sequential (Single Developer)**
- Week 1: Setup + US1 (MVP)
- Week 2: US2 (Scoreboard)
- Week 3: US3 (Results)
- Week 4: Polish

**Scenario 2: Parallel (3 Developers)**
- Day 1: All complete Phase 1 together (T001-T006)
- Days 2-5:
  - Developer A: User Story 1 (T007-T021)
  - Developer B: User Story 2 (T022-T035)
  - Developer C: User Story 3 (T036-T056)
- Day 6: All work on Polish together (T057-T067)

**Result**: 6 days vs 4 weeks with parallel execution!

---

## Task Summary

**Total Tasks**: 67 tasks across 5 phases

**By Phase**:
- Phase 1 (Setup): 6 tasks
- Phase 2 (US1 - Response Status): 15 tasks
- Phase 3 (US2 - Scoreboard): 14 tasks
- Phase 4 (US3 - Results): 21 tasks
- Phase 5 (Polish): 11 tasks

**By Type**:
- Test tasks: 21 tasks (31% - TDD approach)
- Implementation tasks: 35 tasks (52%)
- Tooling/validation: 11 tasks (17%)

**Parallelizable Tasks**: 31 tasks marked [P] (46% parallelizable)

**MVP Scope**: Phase 1 + Phase 2 (21 tasks) = Response Status Tracking only

**Independent Test Criteria**:
- US1: Can track response submissions independently
- US2: Can view scores independently (doesn't require US1)
- US3: Can view results independently (doesn't require US1 or US2)

---

## Notes

- All tasks follow TDD: Tests written FIRST, must FAIL before implementation
- Each user story independently completable and testable
- [P] tasks = different files, can run in parallel
- [Story] label = traceability to specific user story
- Biome formatting required after each user story (per constitution)
- Commit after each user story completion
- Stop at any checkpoint to validate story works independently
- Constitution compliance: Clean Architecture, Custom Hooks, Type Safety, Server Components First

---

## Validation Checklist

Before marking feature complete:

- [ ] All 67 tasks completed and checked off
- [ ] All tests passing (565+ total, including ~50 new tests)
- [ ] Build succeeds: `npm run build`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] User Story 1 works independently (response tracking)
- [ ] User Story 2 works independently (score calculation)
- [ ] User Story 3 works independently (winner celebration)
- [ ] Manual testing complete for all three pages
- [ ] Code formatted with Biome
- [ ] CLAUDE.md context updated
- [ ] Constitution principles followed throughout
