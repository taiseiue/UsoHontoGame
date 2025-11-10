# Feature Specification: Session Management and TOP Page

**Feature Branch**: `001-session-top-page`
**Created**: 2025-11-10
**Status**: Draft
**Input**: User description: "Common infrastructure: session management and TOP page with game list"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First-Time Visitor Creates Session (Priority: P1)

A new user visits the application for the first time and needs to establish their identity before participating in any games. The system automatically creates a session for them and prompts them to choose a nickname that will be remembered across visits.

**Why this priority**: This is the foundational capability required for all other features. Without session management, users cannot participate in games or be identified by the system. This represents the absolute minimum infrastructure needed.

**Independent Test**: Can be fully tested by visiting the application without any games created and verifying that a session ID is assigned and nickname can be set. Delivers the value of persistent user identity.

**Acceptance Scenarios**:

1. **Given** I am a new visitor without any existing session, **When** I access the application, **Then** the system assigns me a unique session ID and stores it in a cookie
2. **Given** I have a new session but no nickname, **When** I am prompted to enter a nickname, **Then** I can input a nickname and it is saved in my session cookie
3. **Given** I have set my nickname, **When** I close and reopen my browser, **Then** my session ID and nickname are still available from the cookies
4. **Given** I have an existing session, **When** I visit the application again, **Then** I am not prompted to set my nickname again

### Edge Cases

- What happens when a user's session cookie is deleted or expires? System should create a new session and prompt for nickname again.
- What happens when a user tries to set an empty nickname? System should validate and require a non-empty nickname.
- What happens when the same nickname is used by multiple users? System should allow duplicate nicknames since sessions are identified by session ID, not nickname.
- What happens when there are many games with "出題中" status? System should display all of them in a scrollable list (pagination can be added later if needed).
- What happens when a user accesses the TOP page with JavaScript disabled? The page should still display the game list (server-side rendering in Next.js handles this).
- What happens when game status changes while a user is viewing the TOP page? User needs to refresh to see updates (real-time updates can be added later if needed).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create a unique session ID for each new visitor and store it in a secure, HTTP-only cookie
- **FR-002**: System MUST prompt users without a nickname to set a nickname on their first visit
- **FR-003**: System MUST store the user's nickname in a cookie alongside their session ID
- **FR-004**: System MUST persist session ID and nickname cookies across browser sessions (not session-only cookies)
- **FR-005**: System MUST set appropriate cookie expiration time of at least 30 days
- **FR-014**: System MUST validate that nicknames are not empty strings
- **FR-015**: System MUST allow multiple users to have the same nickname (since session IDs are unique)
- **FR-016**: TOP page MUST be server-side rendered using Next.js App Router to ensure content is available without JavaScript

### Key Entities

- **Session**: Represents a user's persistent identity across visits. Contains a unique session ID (UUID format) and the user's chosen nickname. Session information is stored in cookies on the client side.
- **User**: Represents a participant in the system. Identified by session ID and has an associated nickname. Multiple users can have the same nickname since they are uniquely identified by session ID.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: New users can establish a session and set a nickname in under 30 seconds
- **SC-002**: Session cookies persist for at least 30 days, allowing users to return without re-entering their nickname

## Assumptions

- Session management is implemented using Next.js built-in cookie functionality (next/headers or similar APIs)
- Cookies are set with SameSite=Lax and Secure flags for security
- The dashboard and game management pages will be implemented in separate features
- Session expiration is set to 30 days (2592000 seconds) as a reasonable default for a game event application
- Nickname maximum length is set to 50 characters to prevent abuse while allowing creative names

## Dependencies

- Existing game status management system (games can have statuses: 準備中, 出題中, 締切)
- In-memory storage system mentioned in CLAUDE.md for MVP
- Next.js 15 App Router and React 19 as specified in CLAUDE.md
- Cookie management APIs from Next.js

## Out of Scope

- User authentication beyond session-based identification
- Password protection or security beyond basic session cookies
- Real-time updates of game list (WebSocket/polling not included)
- User profile pages or account management
- Ability to edit nickname after initial setup
- Game participation functionality (joining games, submitting answers)
- Dashboard implementation details
- Game management interface implementation details
- Pagination of game list
- Sorting or filtering options for game list
- Admin privileges or role-based access control
