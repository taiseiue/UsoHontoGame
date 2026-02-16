# UsoHontoGame (ウソホント)

A truth-or-lie guessing game built with Next.js 16, React 19, and SQLite. Players try to identify which episode among three presented stories is false.

## Quick Start

### Prerequisites

- Node.js 20+
- npm

### Installation and Launch

```bash
# Clone repository (or in existing directory)
npm install

# Set up environment variables
echo "DATABASE_URL=\"file:./dev.db\"" > .env
echo "DATABASE_URL=\"file:$(pwd)/prisma/dev.db\"" > .env.local

# Set up database
npx prisma migrate dev
npx prisma generate

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### First Access

1. Register your nickname (saved in cookies)
2. Session is automatically created

### Two Entry Points

- **Player View** (`/`): Join published games
- **Moderator View** (`/games`): Manage your games

⚠️ No navigation buttons. Access URLs directly.

## Game Flow

### Moderator (Game Creator)

1. **View Game List** → `/games`
   - Display your game list
   - Create new game from "Create Game" button

2. **Create Game** → `/games/create`
   - Set game name, player limit (1-100)
   - Status: **準備中** (Preparing)

3. **Register Presenters & Episodes** → `/games/[id]/presenters`
   - Add presenters (1-10)
   - Register 3 episodes per presenter
   - Mark one episode as "lie" (hidden from players)

4. **Publish Game** → `/games/[id]`
   - Change status to **出題中** (Active)
   - Players can now join

5. **Monitor Progress** → `/games/[id]/dashboard`
   - Real-time response status
   - Participant list and answer status

6. **Close Game** → `/games/[id]`
   - Change status to **締切** (Closed)
   - Publish results

### Player

1. **Discover Games** → `/`
   - Display list of "Active" games

2. **Vote** → `/games/[id]/answer`
   - View 3 episodes from each presenter
   - Select the episode you think is a lie
   - Submit answer

3. **View Results** → `/games/[id]/results`
   - Rankings by correct answers
   - Winner celebration

## Implemented Features

### Session Management
- Cookie-based authentication
- Nickname registration
- Persistent sessions

### Moderator Features
- Game creation, editing, and deletion
- Presenter and episode registration
- Game status management (準備中 → 出題中 → 締切)
- Real-time dashboard

### Player Features
- Active game list display
- Game participation and voting
- Results display with rankings

### Other Features
- Internationalization (Japanese, English)
- SQLite persistence
- Automatic migrations

---

## Developer Information

### Tech Stack

#### Core
- **Framework**: Next.js 16.0.1 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS v4

#### Data & Persistence
- **Database**: SQLite (via Prisma)
- **ORM**: Prisma 6.19.0
- **Validation**: Zod 4.1.12
- **ID Generation**: nanoid 5.1.6

#### Testing
- **Unit Tests**: Vitest 4.0.7
- **E2E Tests**: Playwright 1.56.1
- **Component Tests**: Testing Library

⚠️ **Note**: Many tests are currently failing. Test files are not currently maintained.

#### Code Quality
- **Lint & Format**: Biome 2.3.4, ESLint 9

### Architecture

**Clean Architecture** + **Domain-Driven Design**

```
src/
├── app/                    # Next.js pages (Presentation Layer)
├── components/             # React components (Presentation Layer)
└── server/
    ├── application/        # Use Cases (Application Layer)
    ├── domain/             # Entities, Value Objects (Domain Layer)
    └── infrastructure/     # Database, External APIs (Infrastructure Layer)
```

**Key Patterns**:
- Repository Pattern
- Server Actions (Next.js)
- Value Objects
- Use Case Pattern

### Project Structure

```
.
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── actions/                # Server Actions
│   │   ├── api/                    # API Routes
│   │   ├── games/                  # Game pages
│   │   │   ├── [id]/
│   │   │   │   ├── answer/         # Answer submission page
│   │   │   │   ├── dashboard/      # Dashboard
│   │   │   │   ├── presenters/     # Presenter management
│   │   │   │   └── results/        # Results display
│   │   │   ├── create/             # Game creation
│   │   │   └── page.tsx            # Game list
│   │   └── page.tsx                # TOP (session)
│   ├── components/
│   │   ├── domain/                 # Domain components
│   │   ├── pages/                  # Page components
│   │   └── ui/                     # Reusable UI
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Utilities
│   ├── server/
│   │   ├── application/            # Use Cases & DTOs
│   │   ├── domain/                 # Domain layer
│   │   └── infrastructure/         # External dependencies
│   └── types/                      # TypeScript types
├── tests/
│   ├── e2e/                        # Playwright E2E tests
│   ├── integration/                # Integration tests
│   └── utils/                      # Test utilities
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── migrations/                 # Migration files
│   └── dev.db                      # SQLite database
└── specs/                          # Feature specifications
```

### Database Schema

```prisma
model Game {
  id              String          @id @default(uuid())
  name            String?
  creatorId       String
  maxPlayers      Int
  currentPlayers  Int             @default(0)
  status          String          @default("準備中")
  presenters      Presenter[]
  answers         Answer[]
  participations  Participation[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model Presenter {
  id        String    @id @default(uuid())
  gameId    String
  nickname  String
  episodes  Episode[]
  game      Game      @relation(fields: [gameId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now())
}

model Episode {
  id          String    @id @default(uuid())
  presenterId String
  text        String
  isLie       Boolean
  presenter   Presenter @relation(fields: [presenterId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
}

model Answer {
  id         String   @id @default(uuid())
  sessionId  String
  gameId     String
  nickname   String
  selections Json
  game       Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([sessionId, gameId])
}

model Participation {
  id        String   @id @default(uuid())
  sessionId String
  gameId    String
  nickname  String
  joinedAt  DateTime @default(now())
  game      Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)

  @@unique([sessionId, gameId])
}
```

## Development Guide

### Available Commands

#### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
```

#### Testing
```bash
npm test                   # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:ui            # Interactive UI
npm run test:coverage      # Coverage report
npm run test:e2e           # E2E tests
npm run test:e2e:ui        # E2E tests UI
npm run test:e2e:debug     # E2E debug
```

#### Database
```bash
npx prisma migrate dev     # Run migrations (dev)
npx prisma migrate deploy  # Run migrations (prod)
npx prisma studio          # Database GUI
npx prisma generate        # Generate Prisma Client
```

#### Seed Scripts (Test Data Generation)
```bash
# Global seed: Reset entire database and create fresh data
npm run seed
# - Deletes all existing data
# - Creates 150 games with fixed creator ID (seed-creator-session-id)
# - 50 games per status (準備中/出題中/締切)
# - Use case: Return to initial state, test all statuses

# User-specific seed: Create test data for your session
npm run seed:my <session-id>
# - Deletes only games from specified session ID
# - Creates ~100 games for that session ID
# - Other users' games are preserved
# - Use case: Test /games page with large dataset
```

#### Code Quality
```bash
npm run lint               # Lint with ESLint
npm run lint:biome         # Lint with Biome
npm run format             # Format with Biome
npm run format:check       # Check formatting
npm run check              # Lint + format
```

### Development Tips

#### Getting Your Session ID

1. Open DevTools (F12)
2. Application → Cookies → `http://localhost:3000`
3. Copy `sessionId` cookie value

**Use Cases:**
- Generate test data: `npm run seed:my <session-id>`
- Debug session-specific issues

#### Testing with Multiple Users

- **Normal browser**: User A
- **Incognito mode**: User B

Each browser maintains independent sessions.

```bash
# Terminal 1: Seed games for User A
npm run seed:my <session-id-A>

# Terminal 2: Seed games for User B
npm run seed:my <session-id-B>
```

### Development Workflow

#### Database Changes
1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name description`
3. Update repository implementations
4. Update domain entities (if needed)

### Development Tips

#### Getting Your Session ID

1. Open DevTools (F12)
2. Application → Cookies → `http://localhost:3000`
3. Copy `sessionId` cookie value

**Use Cases:**
- Generate test data: `npm run seed:my <session-id>`
- Debug session-specific issues

#### Testing with Multiple Users

- **Normal browser**: User A
- **Incognito mode**: User B

Each browser maintains independent sessions.

```bash
# Terminal 1: Seed games for User A
npm run seed:my <session-id-A>

# Terminal 2: Seed games for User B
npm run seed:my <session-id-B>
```

### Environment Variables

`.env`:
```env
DATABASE_URL="file:./dev.db"
```

`.env.local`:
```env
DATABASE_URL="file:/absolute/path/to/prisma/dev.db"
```

⚠️ **Note**: Both files are required.
- `.env`: For Prisma CLI (relative path)
- `.env.local`: For Next.js runtime (absolute path)

## License

Private project - All rights reserved

## Acknowledgments

Built with [Claude Code](https://claude.ai/code)
