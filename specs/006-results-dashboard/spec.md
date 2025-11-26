# Feature Specification: Results Dashboard

**Feature Branch**: `006-results-dashboard`
**Created**: 2025-11-21
**Status**: Draft
**Input**: User description: "ダッシュボード機能

* **回答状況表示機能 (司会者):**
  * 各Playerが投票済みか否かを確認できる。
* **ポイント自動計算機能 (システム):**
    * 提示されたルールに基づき、ポイントを即座に自動計算する。
        * 正解した場合、当該チームに +10ポイント。
* **最終結果表示機能 (システム/全参加者):**
    * 最終的なチームランキング（順位）と合計ポイントを表示する。
    * 優勝チームをハイライトし、祝賀メッセージや簡易的なエフェクト（紙吹雪など）を表示する。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Response Status Tracking (Priority: P1)

As a game moderator, I need to monitor which participants have submitted their answers so that I can track game progress and know when all responses are in before closing the answer phase.

**Why this priority**: This is the foundation of game management - moderators need real-time visibility into participation status to make decisions about advancing the game. Without this, moderators have no way to know if they should wait for more responses or proceed.

**Independent Test**: Can be fully tested by creating a game with multiple participants, having some submit answers while others don't, and verifying that the moderator sees accurate status for each participant. Delivers immediate value by solving the "are we ready to proceed?" question.

**Acceptance Scenarios**:

1. **Given** a game is in "出題中" status with 5 participants, **When** moderator views the response status dashboard, **Then** system displays a list of all 5 participants with their submission status (submitted/not submitted)
2. **Given** participant submits their answer, **When** moderator refreshes the dashboard, **Then** participant's status updates to "submitted" in real-time
3. **Given** all participants have submitted answers, **When** moderator views dashboard, **Then** system shows "All responses received" indicator
4. **Given** game is in "準備中" status, **When** moderator tries to view response status, **Then** system displays message indicating no active answer phase

---

### User Story 2 - Final Results and Winner Celebration (Priority: P2)

As a participant or moderator, I want to see the final rankings with the winning team highlighted and celebrated so that the game concludes with a satisfying conclusion and clear winner announcement.

**Why this priority**: After confirming all responses are in, the next critical need is to see results with winner celebration. This enhances game experience and provides a satisfying conclusion.

**Independent Test**: Can be tested by completing a game and verifying the results page shows rankings in order, highlights the winner distinctly, and displays celebratory effects. Delivers value through improved user experience and game conclusion satisfaction.

**Acceptance Scenarios**:

1. **Given** game results are finalized, **When** results page is displayed, **Then** system shows participants ranked from highest to lowest score
2. **Given** one participant has the highest score, **When** results are shown, **Then** that participant is highlighted as the winner with distinct visual treatment
3. **Given** multiple participants tie for first place, **When** results are shown, **Then** all tied participants are displayed as co-winners with equal highlighting
4. **Given** winner is displayed, **When** results page loads, **Then** system displays congratulations message and celebratory visual effect
5. **Given** results page is accessed by any participant, **When** page loads, **Then** all participants can view the same rankings and winner information

---

### Edge Cases

- What happens when a participant submits an answer but then the game is deleted before closing?
- How does the system handle incomplete data if a participant's answer is missing for some presenters?
- What happens if no one gets any correct answers (all participants score 0)?
- How should the system handle very large participant counts (50+ participants) on the dashboard display?
- What happens if a moderator tries to view results before the game is closed?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST track and display real-time response submission status for each participant in an active game
- **FR-002**: System MUST display participant names and submission status (submitted/not submitted) to game moderators
- **FR-003**: System MUST calculate participant scores automatically when game transitions to "締切" status
- **FR-004**: System MUST award 10 points to participants for each correct lie identification
- **FR-005**: System MUST award 0 points to participants for incorrect episode selections
- **FR-006**: System MUST sum scores across all presenters to calculate each participant's total score
- **FR-009**: System MUST rank participants by total score from highest to lowest on results page
- **FR-010**: System MUST visually highlight the winning participant(s) on results page
- **FR-011**: System MUST display congratulations message for the winner
- **FR-012**: System MUST show celebratory visual effect (confetti or equivalent) when winner is displayed
- **FR-013**: System MUST make results page accessible to all participants after game closes
- **FR-014**: System MUST persist calculated scores and rankings in the database
- **FR-015**: System MUST prevent access to response status dashboard when game is not in "出題中" status
- **FR-016**: System MUST display all participants with the highest score as co-winners when multiple participants tie for first place

### Key Entities

- **Response Status**: Tracks which participants have submitted answers (participant ID, submission timestamp, completion status)
- **Ranking**: Final standings showing participant positions (rank position, participant ID, total score, tie status)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Moderators can view response status and know when all participants have submitted within 2 seconds of page load
- **SC-003**: Results page loads and displays complete rankings for games with up to 50 participants in under 3 seconds
- **SC-004**: 95% of users can understand their ranking and score without additional explanation
- **SC-005**: Winner celebration effects display immediately when results page loads (within 1 second)
- **SC-006**: Zero score calculation errors occur (all scores match manual calculation)

## Scope

### In Scope

- Real-time response status tracking for moderators
- Automatic score calculation based on correct/incorrect answers
- Final rankings display with winner highlighting
- Celebratory effects for winner announcement
- Results page accessible to all participants

### Out of Scope

- Historical game results archive
- Score adjustment or override by moderators
- Detailed analytics or statistics
- Export of results to external formats
- Custom scoring rules or point values
- Multiple game types with different scoring systems
- Leaderboards across multiple games
- Achievement or badge systems

## Assumptions

1. Game must be in "締切" status for scores to be calculated
2. Points are awarded only for correct lie identification (no partial credit)
3. All participants must have submitted complete answers (selected episode for each presenter)
4. Celebratory effects use standard web animations (CSS/JavaScript)
5. Results page uses same authentication/session as main game
6. Moderator role is determined by game creator (same as existing game management)
7. Real-time updates use existing polling or WebSocket infrastructure
8. Maximum 100 participants per game for performance considerations

## Dependencies

- Existing game state management (status: 準備中, 出題中, 締切)
- Answer submission system (feature 001-lie-detection-answers)
- Presenter and episode data structure
- User session/authentication system
- Game participant tracking system

## Open Questions

None - all clarifications resolved.
