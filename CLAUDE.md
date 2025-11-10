# UsoHontoGame Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-06

## Active Technologies
- TypeScript 5 with strict mode enabled + Next.js 15, React 19, Tailwind CSS v4 (002-separate-game-states)
- In-memory for MVP (will need persistence layer later) (002-separate-game-states)
- TypeScript 5 with strict mode + Next.js 15 (App Router), React 19, Tailwind CSS v4 (003-simplify-screen-flow)
- In-memory (existing session storage, no changes required) (003-simplify-screen-flow)
- TypeScript 5 with strict mode enabled + Next.js 16.0.1, React 19.2.0, Tailwind CSS v4, nanoid 5.1.6 (001-session-top-page)
- In-memory storage for MVP (game state), Cookie storage (session management) (001-session-top-page)
- TypeScript 5 with strict mode enabled + Next.js 16.0.1, React 19.2.0 + Prisma 6.x (ORM), nanoid 5.1.6 (ID generation), Tailwind CSS v4 (styling) (002-game-preparation)
- SQLite (file-based database via Prisma) (002-game-preparation)
- TypeScript 5 with strict mode enabled + Next.js 16.0.1, React 19.2.0 + Prisma 6.x (ORM), Zod 3.x (runtime validation), nanoid 5.1.6 (ID generation), Tailwind CSS v4 (styling) (002-game-preparation)

- TypeScript 5 with strict mode enabled (001-game-management)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5 with strict mode enabled: Follow standard conventions

## Recent Changes
- 002-game-preparation: Added TypeScript 5 with strict mode enabled + Next.js 16.0.1, React 19.2.0 + Prisma 6.x (ORM), Zod 3.x (runtime validation), nanoid 5.1.6 (ID generation), Tailwind CSS v4 (styling)
- 002-game-preparation: Added TypeScript 5 with strict mode enabled + Next.js 16.0.1, React 19.2.0 + Prisma 6.x (ORM), nanoid 5.1.6 (ID generation), Tailwind CSS v4 (styling)
- 001-session-top-page: Added TypeScript 5 with strict mode enabled + Next.js 16.0.1, React 19.2.0, Tailwind CSS v4, nanoid 5.1.6


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
