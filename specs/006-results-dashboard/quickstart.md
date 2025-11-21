# Quickstart: Results Dashboard Implementation

**Feature**: 006-results-dashboard
**Branch**: `006-results-dashboard`
**Prerequisites**: Spec approved, plan reviewed, ready to implement

---

## Implementation Overview

This quickstart provides the optimal order for implementing the Results Dashboard feature following TDD principles and priority order (P1 → P2 → P3).

**Total Effort**: ~8-12 development sessions
**Testing**: ~515+ tests (existing) + ~50 new tests

---

## Phase 1: Foundation (P1 - Response Status Tracking)

### Session 1: DTOs and Use Case Structure

**Goal**: Set up data structures and use case skeleton

**Files to Create**:
```
src/server/application/dto/
├── ResponseStatusDto.ts
├── ScoreDto.ts
└── RankingDto.ts

src/server/application/use-cases/results/
├── GetResponseStatus.ts
└── GetResponseStatus.test.ts
```

**Steps**:
1. Create DTO interfaces (TypeScript types only)
2. Create GetResponseStatus use case skeleton
3. Write failing tests for use case
4. Implement use case (reuse existing repositories)
5. Run tests until green
6. Format with Biome: `npx biome format --write .`
7. Commit: `git add . && git commit -m "feat: add response status use case and DTOs"`

**Test Focus**:
- Use case returns correct DTO structure
- Counts submissions accurately
- Sets allSubmitted flag correctly
- Handles missing game (error case)
- Validates game status (must be '出題中')

**Success Criteria**: GetResponseStatus.test.ts passes (5-8 tests)

---

### Session 2: API Endpoint (Response Status)

**Goal**: Expose response status via REST API

**Files to Create**:
```
src/app/api/games/[gameId]/dashboard/
└── route.ts
```

**Steps**:
1. Write failing integration test in `tests/integration/results/response-status.test.ts`
2. Implement route handler
3. Add session validation
4. Add authorization check (creator only)
5. Add game status validation
6. Run tests until green
7. Format with Biome: `npx biome format --write .`
8. Commit: `git add . && git commit -m "feat: add response status API endpoint"`

**Test Focus**:
- Returns 200 with correct data structure
- Returns 401 without session
- Returns 403 for non-creator
- Returns 400 for wrong game status
- Returns 404 for non-existent game

**Success Criteria**: Integration test passes (5+ tests)

---

### Session 3: Response Status Page Component

**Goal**: Build UI for response status tracking

**Files to Create**:
```
src/components/pages/ResponseStatusPage/
├── index.tsx
├── ResponseStatusPage.test.tsx
├── ResponseStatusPage.types.ts
└── hooks/
    ├── useResponseStatus.ts
    └── useResponseStatus.test.ts

src/components/domain/results/
└── ResponseStatusList.tsx
```

**Steps**:
1. Write failing component tests
2. Implement ResponseStatusPage (presentational)
3. Write failing hook tests
4. Implement useResponseStatus hook (polling logic)
5. Implement ResponseStatusList domain component
6. Run tests until green
7. Format with Biome: `npx biome format --write .`
8. Commit: `git add . && git commit -m "feat: add response status page with polling"`

**Test Focus**:
- Component renders participant list
- Hook polls every 3 seconds
- Hook cleans up interval on unmount
- Status badges show correctly
- "All submitted" banner appears when complete

**Success Criteria**: Component + hook tests pass (10-15 tests)

---

### Session 4: App Router Integration (Response Status)

**Goal**: Wire up page in Next.js App Router

**Files to Create**:
```
src/app/games/[id]/dashboard/
└── page.tsx
```

**Steps**:
1. Create page wrapper (Server Component)
2. Fetch initial data server-side
3. Pass data to ResponseStatusPage
4. Add error handling
5. Manual test in browser
6. Format with Biome: `npx biome format --write .`
7. Commit: `git add . && git commit -m "feat: integrate response status page in App Router"`

**Manual Testing**:
- Navigate to `/games/[id]/dashboard`
- Verify initial data loads
- Verify polling updates (submit answer in another tab)
- Verify status badges update

**Success Criteria**: P1 feature complete and manually verified

---

## Phase 2: Score Calculation (P2 - Scoreboard)

### Session 5: Score Calculation Use Case

**Goal**: Implement score calculation logic

**Files to Create**:
```
src/server/application/use-cases/results/
├── CalculateScores.ts
└── CalculateScores.test.ts
```

**Steps**:
1. Write failing tests for score calculation
2. Implement CalculateScores use case
3. Test edge cases (all correct, all incorrect, mixed)
4. Verify 10 points per correct answer
5. Run tests until green
6. Format with Biome: `npx biome format --write .`
7. Commit: `git add . && git commit -m "feat: implement score calculation use case"`

**Test Focus**:
- Calculates total score correctly
- Awards 10 points for correct answers
- Awards 0 points for incorrect answers
- Includes all presenter details
- Handles games with no answers

**Success Criteria**: CalculateScores.test.ts passes (8-12 tests)

---

### Session 6: Scoreboard API Endpoint

**Goal**: Expose scores via REST API

**Files to Create**:
```
src/app/api/games/[gameId]/scoreboard/
└── route.ts
```

**Steps**:
1. Write failing integration test in `tests/integration/results/score-calculation.test.ts`
2. Implement route handler using CalculateScores
3. Add game status validation (must be '締切')
4. Run tests until green
5. Format with Biome: `npx biome format --write .`
6. Commit: `git add . && git commit -m "feat: add scoreboard API endpoint"`

**Test Focus**:
- Returns 200 with scores
- Returns 400 for wrong game status
- Scores match expected calculations
- Details include all presenters

**Success Criteria**: Integration test passes (5+ tests)

---

### Session 7: Scoreboard Page Component

**Goal**: Build UI for score display

**Files to Create**:
```
src/components/pages/ScoreboardPage/
├── index.tsx
├── ScoreboardPage.test.tsx
└── ScoreboardPage.types.ts

src/components/domain/results/
└── ScoreCard.tsx
```

**Steps**:
1. Write failing component tests
2. Implement ScoreboardPage (Server Component)
3. Implement ScoreCard domain component
4. Add correct/incorrect indicators
5. Run tests until green
6. Format with Biome: `npx biome format --write .`
7. Commit: `git add . && git commit -m "feat: add scoreboard page with score cards"`

**Test Focus**:
- Renders all participants
- Shows total scores
- Displays answer details
- Correct/incorrect indicators work

**Success Criteria**: Component tests pass (8-12 tests)

---

### Session 8: App Router Integration (Scoreboard)

**Goal**: Wire up scoreboard page

**Files to Create**:
```
src/app/games/[id]/scoreboard/
└── page.tsx
```

**Steps**:
1. Create page wrapper (Server Component)
2. Fetch scores server-side
3. Pass data to ScoreboardPage
4. Manual test in browser
5. Format with Biome: `npx biome format --write .`
6. Commit: `git add . && git commit -m "feat: integrate scoreboard page in App Router"`

**Manual Testing**:
- Navigate to `/games/[id]/scoreboard`
- Verify scores display correctly
- Verify answer details show
- Compare calculated scores with expected

**Success Criteria**: P2 feature complete and manually verified

---

## Phase 3: Final Results (P3 - Winner Celebration)

### Session 9: Results Use Case with Rankings

**Goal**: Implement ranking logic with tie handling

**Files to Create**:
```
src/server/application/use-cases/results/
├── GetResults.ts
└── GetResults.test.ts
```

**Steps**:
1. Write failing tests for ranking logic
2. Implement GetResults use case (reuses CalculateScores)
3. Implement tie handling (same rank for same score)
4. Mark winners (rank === 1)
5. Run tests until green
6. Format with Biome: `npx biome format --write .`
7. Commit: `git add . && git commit -m "feat: implement results use case with ranking"`

**Test Focus**:
- Rankings sorted correctly (score DESC, name ASC)
- Ties handled correctly (same rank)
- Winners marked correctly (including ties)
- Rank numbers skip after ties

**Success Criteria**: GetResults.test.ts passes (8-12 tests)

---

### Session 10: Results API Endpoint

**Goal**: Expose rankings via REST API

**Files to Create**:
```
src/app/api/games/[gameId]/results/
└── route.ts
```

**Steps**:
1. Write failing integration test in `tests/integration/results/results-display.test.ts`
2. Implement route handler using GetResults
3. Add game status validation (must be '締切')
4. Run tests until green
5. Format with Biome: `npx biome format --write .`
6. Commit: `git add . && git commit -m "feat: add results API endpoint"`

**Test Focus**:
- Returns 200 with rankings
- Returns 400 for wrong game status
- Rankings match expected order
- Winners identified correctly

**Success Criteria**: Integration test passes (5+ tests)

---

### Session 11: Celebration Components

**Goal**: Build confetti and winner highlighting

**Files to Create**:
```
src/components/ui/
├── Confetti.tsx
└── Confetti.test.tsx

src/components/domain/results/
├── WinnerCelebration.tsx
└── WinnerCelebration.test.tsx

src/lib/
└── animations.ts
```

**Steps**:
1. Write failing tests for Confetti component
2. Implement Confetti with CSS animations
3. Write failing tests for WinnerCelebration
4. Implement WinnerCelebration wrapper
5. Create animation helper functions
6. Run tests until green
7. Format with Biome: `npx biome format --write .`
8. Commit: `git add . && git commit -m "feat: add winner celebration with confetti"`

**Test Focus**:
- Confetti renders particles
- Animation triggers on mount
- Auto-cleanup after duration
- Congratulations message displays

**Success Criteria**: Component tests pass (6-10 tests)

---

### Session 12: Results Page Component

**Goal**: Build final results page with celebration

**Files to Create**:
```
src/components/pages/ResultsPage/
├── index.tsx
├── ResultsPage.test.tsx
├── ResultsPage.types.ts
└── hooks/
    ├── useResults.ts
    └── useResults.test.ts

src/components/domain/results/
└── RankingDisplay.tsx
```

**Steps**:
1. Write failing component tests
2. Implement ResultsPage (Client Component)
3. Write failing hook tests
4. Implement useResults hook (animation control)
5. Implement RankingDisplay domain component
6. Run tests until green
7. Format with Biome: `npx biome format --write .`
8. Commit: `git add . && git commit -m "feat: add results page with winner celebration"`

**Test Focus**:
- Renders ranking list
- Winners highlighted correctly
- Confetti auto-plays
- Hook controls animation
- Handles multiple winners (ties)

**Success Criteria**: Component + hook tests pass (10-15 tests)

---

### Session 13: App Router Integration (Results)

**Goal**: Wire up results page

**Files to Create**:
```
src/app/games/[id]/results/
└── page.tsx
```

**Steps**:
1. Create page wrapper (Client Component wrapper for animation)
2. Fetch rankings server-side (pass as prop)
3. Pass data to ResultsPage
4. Manual test in browser
5. Format with Biome: `npx biome format --write .`
6. Commit: `git add . && git commit -m "feat: integrate results page in App Router"`

**Manual Testing**:
- Navigate to `/games/[id]/results`
- Verify rankings display correctly
- Verify confetti plays automatically
- Verify winners highlighted
- Test with ties (multiple winners)

**Success Criteria**: P3 feature complete and manually verified

---

## Phase 4: Polish & E2E Testing

### Session 14: E2E Tests

**Goal**: Test complete user journey

**Files to Create**:
```
tests/e2e/
└── results-dashboard.test.ts
```

**Steps**:
1. Write E2E test for moderator flow:
   - Create game → Add presenters → Start game
   - Check response status dashboard
   - Submit answers → Close game
   - View scoreboard → View results
2. Write E2E test for participant flow:
   - Join game → Submit answer
   - View scoreboard after close
   - View results with celebration
3. Run Playwright tests
4. Fix any issues discovered
5. Format with Biome: `npx biome format --write .`
6. Commit: `git add . && git commit -m "test: add E2E tests for results dashboard"`

**Success Criteria**: E2E tests pass (3-5 tests)

---

### Session 15: Documentation & Review

**Goal**: Finalize documentation and update CLAUDE.md

**Tasks**:
1. Run `.specify/scripts/bash/update-agent-context.sh claude`
2. Verify all tests pass: `npm test` (should show 565+ tests passing)
3. Run build: `npm run build` (verify no errors)
4. Manual smoke test of all three pages
5. Update any inline documentation
6. Format with Biome: `npx biome format --write .`
7. Final commit: `git add . && git commit -m "docs: update context and finalize results dashboard"`

**Success Criteria**:
- All tests green
- Build succeeds
- CLAUDE.md updated
- Feature complete

---

## Testing Commands

**During Development**:
```bash
# Run specific test file
npm test -- --run src/server/application/use-cases/results/GetResponseStatus.test.ts

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

**After Each Session**:
```bash
# Format code
npx biome format --write .

# Run all tests
npm test

# Verify build
npm run build
```

---

## Common Pitfalls

### 1. Forgetting to Format Before Commit
**Solution**: Always run `npx biome format --write .` before `git commit`

### 2. Polling Not Cleaning Up
**Solution**: Ensure `useEffect` returns cleanup function that calls `clearInterval`

### 3. Server/Client Component Mismatch
**Solution**:
- Response status page: Client (polling)
- Scoreboard page: Server (static data)
- Results page: Client (animations)

### 4. Tie Handling in Rankings
**Solution**: Same score = same rank, next rank skips (1, 1, 3 not 1, 1, 2)

### 5. Score Calculation Edge Cases
**Solution**: Test with:
- All correct answers
- All incorrect answers
- No answers (empty game)
- Single presenter
- Multiple presenters

---

## Success Metrics

**Code Quality**:
- [ ] All tests pass (565+ tests)
- [ ] Build succeeds with no errors
- [ ] Biome formatting applied
- [ ] TypeScript strict mode passes

**Feature Completeness**:
- [ ] P1: Response status tracking works
- [ ] P2: Scores calculated correctly
- [ ] P3: Winner celebration displays

**Performance**:
- [ ] Dashboard loads < 2s
- [ ] Score calculation < 3s
- [ ] Results page < 3s (50 participants)
- [ ] Polling interval 3s (stable)

**Manual Verification**:
- [ ] Moderator can view response status
- [ ] All users can view scoreboard
- [ ] All users can view results
- [ ] Confetti plays on results page
- [ ] Winners highlighted correctly
- [ ] Ties handled correctly

---

## Next Steps After Implementation

1. Create pull request: `/cpr`
2. Review with team
3. Merge to main
4. Deploy to production
5. Monitor performance metrics

---

## Quick Reference

**Branch**: `006-results-dashboard`
**Spec**: `specs/006-results-dashboard/spec.md`
**Plan**: `specs/006-results-dashboard/plan.md`
**Data Model**: `specs/006-results-dashboard/data-model.md`
**API Contracts**: `specs/006-results-dashboard/contracts/api-endpoints.md`
**Component Contracts**: `specs/006-results-dashboard/contracts/component-interfaces.md`

**Total Files to Create**: ~30 files
**Total Tests to Write**: ~50 new tests
**Estimated Time**: 8-12 sessions × 1-2 hours = 8-24 hours
