import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@/generated/prisma/client';

/**
 * Test Database Utility for Integration Tests
 * Creates isolated SQLite databases for parallel test execution
 */

export interface TestDatabase {
  prisma: PrismaClient;
  databasePath: string;
  cleanup: () => Promise<void>;
}

/**
 * Creates an isolated test database for integration tests
 * Each test file gets its own SQLite database to avoid concurrency issues
 *
 * @param testFileName - Name of the test file (used for unique DB naming)
 * @returns TestDatabase instance with PrismaClient and cleanup function
 */
export async function createTestDatabase(testFileName: string): Promise<TestDatabase> {
  // Create unique database file path
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const dbFileName = `test-${testFileName.replace('.test.ts', '')}-${timestamp}-${randomId}.db`;
  const databasePath = path.resolve(process.cwd(), 'prisma', dbFileName);
  const databaseUrl = `file:${databasePath}`;

  // Create PrismaClient with isolated database
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  // Connect and create schema
  try {
    await prisma.$connect();

    // Enable foreign key constraints
    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;');

    // Create the database schema manually since migrations don't work with dynamic DB files
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Game" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT,
        "creatorId" TEXT NOT NULL,
        "maxPlayers" INTEGER NOT NULL,
        "currentPlayers" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT '準備中',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX "Game_creatorId_idx" ON "Game"("creatorId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX "Game_status_idx" ON "Game"("status")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Presenter" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "gameId" TEXT NOT NULL,
        "nickname" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Presenter_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX "Presenter_gameId_idx" ON "Presenter"("gameId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Episode" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "presenterId" TEXT NOT NULL,
        "text" TEXT NOT NULL,
        "isLie" BOOLEAN NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Episode_presenterId_fkey" FOREIGN KEY ("presenterId") REFERENCES "Presenter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX "Episode_presenterId_idx" ON "Episode"("presenterId")
    `);

    // Answer table (001-lie-detection-answers feature)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Answer" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sessionId" TEXT NOT NULL,
        "gameId" TEXT NOT NULL,
        "nickname" TEXT NOT NULL,
        "selections" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "Answer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX "Answer_sessionId_gameId_key" ON "Answer"("sessionId", "gameId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX "Answer_gameId_idx" ON "Answer"("gameId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX "Answer_sessionId_idx" ON "Answer"("sessionId")
    `);

    // Participation table (001-lie-detection-answers feature)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Participation" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sessionId" TEXT NOT NULL,
        "gameId" TEXT NOT NULL,
        "nickname" TEXT NOT NULL,
        "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Participation_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX "Participation_sessionId_gameId_key" ON "Participation"("sessionId", "gameId")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX "Participation_gameId_idx" ON "Participation"("gameId")
    `);
  } catch (error) {
    await prisma.$disconnect();
    throw new Error(`Failed to setup test database: ${error}`);
  }

  const cleanup = async (): Promise<void> => {
    try {
      // Clean up database content (ignore if tables don't exist)
      try {
        await prisma.answer.deleteMany();
        await prisma.participation.deleteMany();
        await prisma.episode.deleteMany();
        await prisma.presenter.deleteMany();
        await prisma.game.deleteMany();
      } catch (dbError) {
        // Ignore table not found errors during cleanup
        const prismaError = dbError as { code?: string };
        if (prismaError.code !== 'P2021') {
          console.warn('Database cleanup error:', dbError);
        }
      }

      // Disconnect
      await prisma.$disconnect();

      // Remove database file
      if (fs.existsSync(databasePath)) {
        fs.unlinkSync(databasePath);
      }
    } catch (error) {
      console.warn(`Warning: Failed to cleanup test database ${databasePath}:`, error);
    }
  };

  return {
    prisma,
    databasePath,
    cleanup,
  };
}

/**
 * Clean up any leftover test database files
 * Useful for CI/CD environments
 */
export async function cleanupAllTestDatabases(): Promise<void> {
  const prismaDir = path.resolve(process.cwd(), 'prisma');

  if (!fs.existsSync(prismaDir)) {
    return;
  }

  const files = fs.readdirSync(prismaDir);
  const testDbFiles = files.filter((file) => file.startsWith('test-') && file.endsWith('.db'));

  for (const file of testDbFiles) {
    try {
      fs.unlinkSync(path.join(prismaDir, file));
    } catch (error) {
      console.warn(`Warning: Failed to cleanup test database file ${file}:`, error);
    }
  }
}
