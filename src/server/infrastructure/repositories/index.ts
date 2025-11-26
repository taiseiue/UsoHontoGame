// Repository Factory with Dependency Injection
// Feature: 002-game-preparation, 001-lie-detection-answers
// Provides repository instances using Prisma

import type { IAnswerRepository } from '@/server/domain/repositories/IAnswerRepository';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import type { IParticipationRepository } from '@/server/domain/repositories/IParticipationRepository';
import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaAnswerRepository } from './PrismaAnswerRepository';
import { PrismaGameRepository } from './PrismaGameRepository';
import { PrismaParticipationRepository } from './PrismaParticipationRepository';

/**
 * Singleton Prisma client instance
 */
let prismaClient: PrismaClient | null = null;

/**
 * Gets Prisma client instance (singleton)
 */
function getPrismaClient(): PrismaClient {
  if (!prismaClient) {
    prismaClient = new PrismaClient();
  }
  return prismaClient;
}

/**
 * Creates game repository instance
 * @returns IGameRepository implementation using Prisma
 */
export function createGameRepository(): IGameRepository {
  return new PrismaGameRepository(getPrismaClient());
}

/**
 * Creates answer repository instance
 * @returns IAnswerRepository implementation using Prisma
 */
export function createAnswerRepository(): IAnswerRepository {
  return new PrismaAnswerRepository(getPrismaClient());
}

/**
 * Creates participation repository instance
 * @returns IParticipationRepository implementation using Prisma
 */
export function createParticipationRepository(): IParticipationRepository {
  return new PrismaParticipationRepository(getPrismaClient());
}

/**
 * Closes database connections (for testing and shutdown)
 */
export async function closeRepositoryConnections(): Promise<void> {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = null;
  }
}

export { PrismaAnswerRepository } from './PrismaAnswerRepository';
// Export repository implementations
export { PrismaGameRepository } from './PrismaGameRepository';
export { PrismaParticipationRepository } from './PrismaParticipationRepository';
