# Data Model: Two Truths and a Lie Game Management System

**Date**: 2025-06-11
**Feature**: 001-game-management
**Phase**: 1 (Design & Contracts)

## Entity Overview

The system uses 6 primary entities to manage game state:

1. **GameSession** - Root aggregate representing a game instance
2. **Team** - Group of participants competing together
3. **Participant** - Individual player or host
4. **Episode** - One of three statements (2 truths, 1 lie)
5. **Vote** - Team's guess about which episode is the lie
6. **Turn** - One team's presentation round

## Entity Details

### GameSession

**Purpose**: Root aggregate managing entire game lifecycle from creation to completion.

**Attributes**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique 6-character session code (e.g., "3KH9Q2") |
| createdAt | Date | Yes | Session creation timestamp |
| lastActivityTimestamp | Date | Yes | Last activity time (for TTL cleanup) |
| phase | SessionPhase | Yes | Current game phase (see enum below) |
| hostId | string | Yes | Participant ID of the host |
| currentTurnId | string | null | ID of active turn (null if no active turn) |
| scoringRules | ScoringRules | Yes | Point values for correct guess and deception |
| presentationOrder | string[] | Yes | Array of team IDs defining turn order |
| currentPresentingTeamIndex | number | Yes | Index in presentationOrder (0-based) |

**Enums**:
```typescript
enum SessionPhase {
  PREPARATION = 'preparation',     // Participants joining, registering episodes
  PRESENTATION = 'presentation',   // Presenter's episodes displayed
  VOTING = 'voting',               // Teams voting on the lie
  REVEAL = 'reveal',               // Correct answer and scores revealed
  COMPLETED = 'completed'          // All teams presented, game ended
}

interface ScoringRules {
  pointsForCorrectGuess: number;  // Default: 10
  pointsPerDeception: number;     // Default: 5
}
```

**Relationships**:
- Has many Teams (1-to-many)
- Has many Participants (1-to-many)
- Has many Turns (1-to-many)
- Has one Host (1-to-1 with Participant where role=HOST)

**State Transitions**:
```
PREPARATION → PRESENTATION → VOTING → REVEAL → PRESENTATION (next team)
                                                    ↓
                                               COMPLETED (when all teams done)
```

**Validation Rules**:
- Session ID must be unique and 6 characters
- Host ID must reference existing participant with role=HOST
- Phase transitions must follow state machine
- presentationOrder must contain all team IDs
- currentPresentingTeamIndex must be valid index

---

### Team

**Purpose**: Represents a competing group of participants.

**Attributes**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique team identifier (UUID) |
| sessionId | string | Yes | Parent game session ID |
| name | string | Yes | Display name (e.g., "Team A", "Team Blue") |
| participantIds | string[] | Yes | Array of participant IDs in this team |
| cumulativeScore | number | Yes | Total points earned (starts at 0) |
| presentationOrder | number | null | Position in turn sequence (0-based, null if not set) |

**Relationships**:
- Belongs to one GameSession (many-to-1)
- Has many Participants (1-to-many)
- Has many Votes (1-to-many, as voting team)
- Has many Turns (1-to-many, as presenting team)

**Validation Rules**:
- Team name must be unique within session
- participantIds must reference existing participants
- cumulativeScore cannot be negative
- presentationOrder must be unique within session if set
- Minimum 1 participant per team recommended

---

### Participant

**Purpose**: Represents an individual user (player or host).

**Attributes**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique participant identifier (UUID) |
| sessionId | string | Yes | Parent game session ID |
| nickname | string | Yes | Display name entered at join |
| role | ParticipantRole | Yes | HOST or PLAYER |
| teamId | string | null | Assigned team ID (null for host or unassigned) |
| connectionStatus | ConnectionStatus | Yes | Current connection state |
| episodes | Episode[] | Yes | Array of 3 episodes (empty array initially) |
| lastSeenTimestamp | Date | Yes | Last activity timestamp |

**Enums**:
```typescript
enum ParticipantRole {
  HOST = 'host',
  PLAYER = 'player'
}

enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected'
}
```

**Relationships**:
- Belongs to one GameSession (many-to-1)
- Belongs to one Team (many-to-1, optional)
- Has many Episodes (1-to-many, exactly 3 when registered)

**Validation Rules**:
- Nickname must be unique within session
- Nickname length: 1-30 characters
- Episodes array must have exactly 3 episodes when submitted
- Exactly one episode must have isLie=true
- Host cannot be assigned to a team
- Players must be assigned to a team before game starts

---

### Episode

**Purpose**: One of three statements made by a participant (2 truths, 1 lie).

**Attributes**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique episode identifier (UUID) |
| participantId | string | Yes | Author of this episode |
| episodeNumber | number | Yes | Position in set (1, 2, or 3) |
| text | string | Yes | The statement content |
| isLie | boolean | Yes | True if this is the lie, false for truths |
| createdAt | Date | Yes | Initial registration timestamp |
| updatedAt | Date | Yes | Last edit timestamp |

**Relationships**:
- Belongs to one Participant (many-to-1)

**Validation Rules**:
- episodeNumber must be 1, 2, or 3
- text length: 10-500 characters (after trimming)
- text cannot be empty after trimming whitespace
- Exactly one episode per participant must have isLie=true
- Episodes can be edited only during PREPARATION phase or before participant's team presents

---

### Vote

**Purpose**: Records a team's guess about which episode is the lie.

**Attributes**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique vote identifier (UUID) |
| turnId | string | Yes | Turn this vote belongs to |
| votingTeamId | string | Yes | Team that submitted this vote |
| selectedEpisodeNumber | number | Yes | Which episode they think is the lie (1, 2, or 3) |
| isCorrect | boolean | null | True if correct, false if wrong (calculated at reveal) |
| submittedAt | Date | Yes | Vote submission timestamp |

**Relationships**:
- Belongs to one Turn (many-to-1)
- Belongs to one Team (many-to-1, as voting team)

**Validation Rules**:
- selectedEpisodeNumber must be 1, 2, or 3
- votingTeamId cannot be the presenting team
- Only one vote per team per turn
- Vote immutable after submission (no edits)
- isCorrect calculated when turn moves to REVEAL phase

---

### Turn

**Purpose**: Represents one team's presentation round with episodes, votes, and scoring.

**Attributes**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique turn identifier (UUID) |
| sessionId | string | Yes | Parent game session ID |
| presentingTeamId | string | Yes | Team presenting their episodes |
| presenterParticipantId | string | Yes | Specific participant whose episodes are shown |
| turnNumber | number | Yes | Sequence number (1-based) |
| phase | TurnPhase | Yes | Current turn phase |
| presentedEpisodes | Episode[] | Yes | 3 episodes from presenter (snapshot) |
| correctEpisodeNumber | number | null | Which episode is the lie (revealed at end) |
| votes | Vote[] | Yes | Array of team votes (empty initially) |
| timerStartedAt | Date | null | When voting timer started (null if not started) |
| timerDurationMs | number | null | Timer duration in milliseconds |
| pointsAwarded | TurnPoints | null | Points calculated after reveal |
| startedAt | Date | Yes | Turn start timestamp |
| completedAt | Date | null | Turn completion timestamp (null if in progress) |

**Enums**:
```typescript
enum TurnPhase {
  PRESENTING = 'presenting',  // Episodes displayed, no timer yet
  VOTING = 'voting',          // Timer running, teams voting
  REVEALING = 'revealing'     // Answer revealed, scores calculated
}

interface TurnPoints {
  presentingTeamPoints: number;       // Points earned by presenting team
  correctGuessingTeams: {             // Teams that guessed correctly
    teamId: string;
    points: number;
  }[];
}
```

**Relationships**:
- Belongs to one GameSession (many-to-1)
- Belongs to one Team (many-to-1, as presenting team)
- Belongs to one Participant (many-to-1, as presenter)
- Has many Votes (1-to-many)

**State Transitions**:
```
PRESENTING → VOTING → REVEALING
```

**Validation Rules**:
- presentingTeamId must reference existing team
- presenterParticipantId must belong to presentingTeamId
- presentedEpisodes must be exactly 3 episodes
- correctEpisodeNumber must be 1, 2, or 3 (set at turn creation from presenter's isLie flag)
- timerDurationMs must be positive if set
- Votes can only be submitted during VOTING phase
- pointsAwarded calculated when phase changes to REVEALING

---

## Value Objects

### SessionId

**Purpose**: Strongly-typed session identifier with validation.

```typescript
class SessionId {
  private readonly value: string;

  constructor(value: string) {
    if (!/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/.test(value)) {
      throw new Error('Invalid session ID format');
    }
    this.value = value.toUpperCase();
  }

  toString(): string {
    return this.value;
  }

  equals(other: SessionId): boolean {
    return this.value === other.value;
  }
}
```

### Score

**Purpose**: Encapsulates score calculation logic and validation.

```typescript
class Score {
  private readonly value: number;

  constructor(value: number) {
    if (value < 0) {
      throw new Error('Score cannot be negative');
    }
    if (!Number.isInteger(value)) {
      throw new Error('Score must be an integer');
    }
    this.value = value;
  }

  add(points: number): Score {
    return new Score(this.value + points);
  }

  toNumber(): number {
    return this.value;
  }
}
```

---

## Data Relationships Diagram

```
GameSession
├── hostId → Participant (role=HOST)
├── Teams[] (1-to-many)
│   └── participantIds[] → Participants
├── Participants[] (1-to-many)
│   └── episodes[] → Episodes (3 per participant)
└── Turns[] (1-to-many)
    ├── presentingTeamId → Team
    ├── presenterParticipantId → Participant
    ├── presentedEpisodes[] → Episodes (snapshot)
    └── votes[] → Votes
        └── votingTeamId → Team
```

---

## Database Schema (Future Migration)

When migrating from in-memory to PostgreSQL:

```sql
-- GameSession table
CREATE TABLE game_sessions (
  id VARCHAR(6) PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_activity_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  phase VARCHAR(20) NOT NULL,
  host_id UUID NOT NULL REFERENCES participants(id),
  current_turn_id UUID REFERENCES turns(id),
  points_for_correct_guess INTEGER NOT NULL DEFAULT 10,
  points_per_deception INTEGER NOT NULL DEFAULT 5,
  presentation_order JSONB NOT NULL,  -- Array of team IDs
  current_presenting_team_index INTEGER NOT NULL DEFAULT 0
);

-- Team table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(6) NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  participant_ids JSONB NOT NULL DEFAULT '[]',
  cumulative_score INTEGER NOT NULL DEFAULT 0,
  presentation_order INTEGER,
  UNIQUE(session_id, name)
);

-- Participant table
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(6) NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  nickname VARCHAR(30) NOT NULL,
  role VARCHAR(10) NOT NULL,
  team_id UUID REFERENCES teams(id),
  connection_status VARCHAR(20) NOT NULL DEFAULT 'connected',
  last_seen_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, nickname),
  CHECK (role IN ('host', 'player')),
  CHECK (connection_status IN ('connected', 'disconnected'))
);

-- Episode table
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  text TEXT NOT NULL,
  is_lie BOOLEAN NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (episode_number IN (1, 2, 3)),
  CHECK (length(trim(text)) >= 10 AND length(text) <= 500)
);

-- Turn table
CREATE TABLE turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(6) NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  presenting_team_id UUID NOT NULL REFERENCES teams(id),
  presenter_participant_id UUID NOT NULL REFERENCES participants(id),
  turn_number INTEGER NOT NULL,
  phase VARCHAR(20) NOT NULL,
  presented_episodes JSONB NOT NULL,  -- Snapshot of 3 episodes
  correct_episode_number INTEGER,
  timer_started_at TIMESTAMP,
  timer_duration_ms INTEGER,
  points_awarded JSONB,  -- Structure: { presentingTeamPoints, correctGuessingTeams[] }
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  CHECK (phase IN ('presenting', 'voting', 'revealing')),
  CHECK (correct_episode_number IN (1, 2, 3))
);

-- Vote table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turn_id UUID NOT NULL REFERENCES turns(id) ON DELETE CASCADE,
  voting_team_id UUID NOT NULL REFERENCES teams(id),
  selected_episode_number INTEGER NOT NULL,
  is_correct BOOLEAN,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (selected_episode_number IN (1, 2, 3)),
  UNIQUE(turn_id, voting_team_id)  -- One vote per team per turn
);

-- Indexes for performance
CREATE INDEX idx_sessions_last_activity ON game_sessions(last_activity_timestamp);
CREATE INDEX idx_participants_session ON participants(session_id);
CREATE INDEX idx_teams_session ON teams(session_id);
CREATE INDEX idx_episodes_participant ON episodes(participant_id);
CREATE INDEX idx_turns_session ON turns(session_id);
CREATE INDEX idx_votes_turn ON votes(turn_id);
```

---

## Migration Checklist

When migrating from in-memory to persistent storage:

- [ ] Implement PostgreSQL repository classes implementing existing interfaces
- [ ] Add database connection pooling configuration
- [ ] Implement transaction support for multi-entity operations
- [ ] Add database migration scripts
- [ ] Update environment configuration for database credentials
- [ ] Implement repository integration tests against test database
- [ ] Add database health check endpoint
- [ ] Update deployment documentation with database setup instructions
- [ ] Configure backup and recovery procedures
- [ ] Add database monitoring and alerting
