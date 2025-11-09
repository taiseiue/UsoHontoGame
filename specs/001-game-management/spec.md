# Feature Specification: Two Truths and a Lie Game Management System

**Feature Branch**: `001-game-management`
**Created**: 2025-06-11
**Status**: Draft
**Input**: User description: "Two Truths and a Lie game management web application for team building events"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Player Joins and Participates in Game (Priority: P1)

As a game participant, I want to join a game session with a simple code and nickname so that I can quickly start playing without complex registration.

**Why this priority**: This is the core user journey that enables any participant to join and play the game. Without this, no game can take place. It represents the minimum viable product - participants can join, register episodes, vote, and see results.

**Independent Test**: Can be fully tested by creating a game session, having a player join with session ID and nickname, registering 3 episodes (marking one as lie), viewing another team's episodes, voting on the lie, and seeing the result. Delivers a complete playable game experience.

**Acceptance Scenarios**:

1. **Given** a player has a valid session ID, **When** they enter the session ID and their nickname on the join screen, **Then** they are admitted to the game session and see the game dashboard
2. **Given** a player is in the preparation phase, **When** they enter 3 episodes and mark one as a lie, **Then** their episodes are saved and the lie information is hidden from others
3. **Given** it's another team's turn, **When** the player views the presenting team's 3 episodes during answer phase, **Then** they can vote for which episode they think is the lie
4. **Given** the player's team has voted, **When** the host reveals the answer, **Then** the player sees the correct answer, all teams' votes, and updated scores in real-time
5. **Given** the player is on a mobile device, **When** they use any screen, **Then** all UI elements are clearly visible and easily tappable

---

### User Story 2 - Host Manages Game Session (Priority: P2)

As a game host, I want to create game sessions, manage teams, and control game flow so that I can facilitate a smooth and engaging game experience for all participants.

**Why this priority**: While players can technically play with predetermined teams, the host needs control over game creation, team management, and progression to ensure the game runs smoothly. This enables a more professional event experience.

**Independent Test**: Can be tested by logging in as host, creating a new game session, receiving a session ID, organizing participants into teams via drag-and-drop, starting the game, advancing through turns, and ending the game.

**Acceptance Scenarios**:

1. **Given** a host logs in, **When** they create a new game session, **Then** a unique session ID is generated and displayed for sharing with participants
2. **Given** participants have joined the session, **When** the host uses the team management interface, **Then** they can create teams (A-E) and assign participants to teams via drag-and-drop
3. **Given** teams are set up and episodes registered, **When** the host designates which team presents first and starts the answer timer, **Then** the answer phase begins with a countdown visible to all
4. **Given** the answer phase timer has expired or all teams voted, **When** the host clicks "reveal answer", **Then** the correct lie is shown, points are auto-calculated, and scoreboard updates in real-time
5. **Given** all teams have presented, **When** the host ends the game, **Then** final rankings are displayed with the winning team highlighted

---

### User Story 3 - Real-Time Scoring and Progress Tracking (Priority: P3)

As any game participant (player or host), I want to see real-time score updates and game status so that I can track team performance and stay engaged throughout the event.

**Why this priority**: Real-time updates significantly enhance engagement and excitement, but the game can function without them using manual refresh or page reload. This represents a UX enhancement layer.

**Independent Test**: Can be tested by having multiple players/hosts viewing the game simultaneously on different devices, making votes/reveals, and verifying all devices show score updates and phase changes immediately without page refresh.

**Acceptance Scenarios**:

1. **Given** multiple participants are viewing the game dashboard, **When** a team's turn changes, **Then** all participants see the current presenting team highlighted within 1 second
2. **Given** the host reveals an answer, **When** points are calculated, **Then** the scoreboard updates across all participant screens immediately showing new point totals
3. **Given** teams are voting, **When** a team submits their vote, **Then** the host's screen shows voting status update in real-time (e.g., "Team B: Voted")
4. **Given** a participant's network connection is temporarily interrupted, **When** connection is restored, **Then** the current game state is synchronized without data loss

---

### User Story 4 - Game Result Celebration (Priority: P4)

As a game participant, I want to see an engaging final results screen with rankings and celebration effects so that the winning team feels recognized and the event ends on a high note.

**Why this priority**: This enhances the event experience and provides closure, but the core game functionality works without special celebration effects.

**Independent Test**: Can be tested by completing a full game and verifying the final results screen displays rankings, highlights the winner, and shows celebratory effects.

**Acceptance Scenarios**:

1. **Given** the game has ended, **When** the final results screen loads, **Then** all teams are displayed in ranking order with their final point totals
2. **Given** the results are displayed, **When** the winning team is shown, **Then** their name is highlighted and celebratory effects (confetti animation) appear
3. **Given** participants view the final results, **When** they review the rankings, **Then** they can see a summary of each team's performance

---

### Edge Cases

- What happens when a participant loses internet connection during voting? The system should preserve their voting state and allow reconnection without loss of progress.
- What happens when the host accidentally clicks "End Game" prematurely? The system should show a confirmation modal to prevent accidental termination.
- What happens when a player submits episodes with one or more blank fields? The system should show validation errors preventing submission until all 3 episodes are filled.
- What happens when all teams vote for the same wrong episode? The presenting team earns maximum points (all teams × 5pt).
- What happens when a participant tries to join with a nickname already in use? The system should either append a number (e.g., "John(2)") or request a different nickname.
- What happens when the timer expires but some teams haven't voted? Default behavior: force submit with no vote (0 points) or allow late voting (recommended).
- What happens when a player tries to access the game management screen? The system should redirect them to the player dashboard based on their role.
- What happens when more than 5 teams try to form? The system should support dynamic team creation or show a message about recommended team count.

## Requirements *(mandatory)*

### Functional Requirements

**Session Management:**
- **FR-001**: System MUST allow hosts to create new game sessions and generate unique 6-character alphanumeric session IDs
- **FR-002**: System MUST allow participants to join sessions using session ID and nickname (no password required)
- **FR-003**: System MUST distinguish between host role (privileged) and player role (standard)
- **FR-004**: System MUST persist session state including teams, scores, episodes, and current turn throughout the game

**Team Management:**
- **FR-005**: System MUST allow hosts to create multiple teams (typically A-E, but flexible)
- **FR-006**: System MUST allow hosts to assign participants to teams using an intuitive interface (drag-and-drop recommended)
- **FR-007**: System MUST display current team assignments to all participants
- **FR-008**: System MUST support optional feature for participants to select their own team during join

**Episode Registration:**
- **FR-009**: System MUST allow each participant to register 3 episodes about themselves
- **FR-010**: System MUST allow participants to designate exactly one episode as the "lie"
- **FR-011**: System MUST keep the lie designation completely hidden from all other participants until reveal time
- **FR-012**: System MUST allow participants to edit/update their episodes before their team's turn
- **FR-013**: System MUST validate that all 3 episode fields are filled before accepting submission

**Game Progression:**
- **FR-014**: System MUST allow hosts to designate which team presents next
- **FR-015**: System MUST display the presenting team's representative name and their 3 episodes to all participants
- **FR-016**: System MUST show which team is currently presenting with visual highlighting on scoreboard
- **FR-017**: System MUST prevent the presenting team from voting during their own turn

**Voting Phase:**
- **FR-018**: System MUST allow hosts to start an answer timer with configurable duration (default: 90 seconds recommended)
- **FR-019**: System MUST display countdown timer to all participants during voting phase
- **FR-020**: System MUST allow each non-presenting team to vote for exactly one episode as the lie
- **FR-021**: System MUST accept team votes via first team member to submit or designated team representative
- **FR-022**: System MUST show voting status to host (e.g., "Team B: Voted", "Team C: Not Voted")
- **FR-023**: System MUST allow host to close voting manually before timer expires
- **FR-024**: System MUST handle timer expiration appropriately for teams that haven't voted

**Scoring and Results:**
- **FR-025**: System MUST reveal the lie when host triggers answer reveal
- **FR-026**: System MUST display all teams' votes alongside the correct answer
- **FR-027**: System MUST automatically calculate points using these rules:
  - Correct guessing team: +10 points
  - Presenting team: +5 points for each team that guessed incorrectly
- **FR-028**: System MUST update the scoreboard in real-time across all participant devices when points are awarded
- **FR-029**: System MUST display cumulative scores for all teams throughout the game
- **FR-030**: System MUST support configurable point values (10pt/5pt as defaults, changeable by host)

**Game Completion:**
- **FR-031**: System MUST allow host to end the game after all teams have presented
- **FR-032**: System MUST display final rankings showing all teams sorted by total points
- **FR-033**: System MUST highlight the winning team on the final results screen
- **FR-034**: System MUST show celebratory visual effect for the winning team (confetti or similar animation recommended)

**User Experience:**
- **FR-035**: System MUST provide responsive design supporting smartphones, tablets, and desktop computers
- **FR-036**: System MUST display game status clearly at all times (current phase, current team, time remaining)
- **FR-037**: System MUST show appropriate loading indicators during data operations
- **FR-038**: System MUST display user-friendly error messages for input errors or system issues
- **FR-039**: System MUST provide toast notifications for actions like "Vote Submitted" or "Points Earned"
- **FR-040**: System MUST use confirmation modals for destructive actions (e.g., "End Game")

**Performance:**
- **FR-041**: System MUST complete score calculations and scoreboard updates within 3 seconds
- **FR-042**: System MUST maintain timer accuracy with no visible lag or drift

**Reliability:**
- **FR-043**: System MUST maintain 99.9% uptime during expected event duration (2-3 hours)
- **FR-044**: System MUST preserve game state (scores, turn, votes) even if network connectivity is briefly interrupted
- **FR-045**: System MUST handle reconnections gracefully, syncing participants to current game state

**Security:**
- **FR-046**: System MUST ensure lie information is never exposed to clients before reveal time (server-side only)
- **FR-047**: System MUST prevent participants from viewing other teams' votes before reveal time
- **FR-048**: System MUST validate all user inputs to prevent injection attacks or malformed data

### Key Entities

- **GameSession**: Represents an active game instance. Attributes: session ID (unique 6-char code), creation timestamp, current phase (preparation/presentation/voting/reveal/ended), current presenting team, host identifier, scoring rules (points for correct guess, points for successful deception).

- **Team**: Represents a group of participants competing together. Attributes: team name (e.g., "Team A"), list of participant IDs, cumulative score, presentation order position. Relationships: belongs to one GameSession, contains multiple Participants.

- **Participant**: Represents an individual player or host. Attributes: nickname, role (host/player), connection status (online/offline), episode collection (3 episodes with lie designation). Relationships: belongs to one GameSession, assigned to one Team (if player).

- **Episode**: Represents one of three statements made by a participant. Attributes: text content (story/fact), is_lie boolean (true for the one lie, false for two truths), episode number (1-3). Relationships: belongs to one Participant.

- **Vote**: Represents a team's guess during another team's presentation. Attributes: voting team ID, selected episode number (1-3), timestamp, is_correct boolean. Relationships: associated with one Team, targets one presenting Team's episode set.

- **Turn**: Represents one team's presentation round. Attributes: presenting team ID, presenting participant ID, episode set reference, vote collection, points awarded to presenting team, points awarded to guessing teams, turn number. Relationships: belongs to one GameSession, references one Team as presenter.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Participants can join a game session in under 30 seconds by entering session ID and nickname
- **SC-002**: Hosts can create a new game session and receive a shareable session ID in under 10 seconds
- **SC-003**: Hosts can organize participants into teams in under 2 minutes for typical group size (15-25 participants, 3-5 teams)
- **SC-004**: The system supports up to 50 concurrent participants in a single game session without performance degradation
- **SC-005**: Score calculations and scoreboard updates appear across all participant devices within 3 seconds of reveal action
- **SC-006**: Timer countdown displays with less than 500ms delay across all participant devices
- **SC-007**: 95% of participants successfully complete episode registration on their first attempt without assistance
- **SC-008**: The game operates without interruption for 99.9% of a typical 2-hour event duration
- **SC-009**: All UI elements are usable on mobile devices (smartphones 375px width and above) without horizontal scrolling
- **SC-010**: Network interruptions of up to 10 seconds do not cause data loss or game state corruption
- **SC-011**: Hosts can control game flow (advance turns, reveal answers, end game) with single-click actions requiring no technical knowledge
- **SC-012**: 90% of first-time users understand current game phase and required actions without external instruction
- **SC-013**: Event organizers report 50% reduction in manual scoring effort compared to paper-based game management
- **SC-014**: Post-event surveys show 85% or higher participant satisfaction with game flow and real-time features

### Assumptions

- **AS-001**: Event venues have reliable Wi-Fi or cellular connectivity for all participants
- **AS-002**: Participants use modern browsers (Chrome 90+, Firefox 88+, Safari 14+, or equivalent mobile browsers)
- **AS-003**: Average team size is 3-5 participants, with 3-5 teams per game session
- **AS-004**: Typical game duration is 45-90 minutes (preparation + all teams presenting once)
- **AS-005**: Hosts have basic computer/smartphone literacy (can navigate web forms, click buttons)
- **AS-006**: Episodes are text-only (no image/video uploads required for MVP)
- **AS-007**: One game session = one event (no need for persistent user accounts or historical game data)
- **AS-008**: Voting is simple majority or first submission per team (no complex weighted voting)
- **AS-009**: Answer timer duration is consistent across all turns (no per-turn timer customization required)
- **AS-010**: Game language is Japanese (internationalization not required for MVP)
