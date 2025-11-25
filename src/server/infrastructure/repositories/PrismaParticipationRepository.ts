// Infrastructure: Prisma Participation Repository
// Implements IParticipationRepository interface using Prisma ORM

import type { PrismaClient } from '@/generated/prisma/client';
import { ParticipationEntity } from '@/server/domain/entities/Participation';
import type { IParticipationRepository } from '@/server/domain/repositories/IParticipationRepository';

export class PrismaParticipationRepository implements IParticipationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(participation: ParticipationEntity): Promise<void> {
    const json = participation.toJSON();

    await this.prisma.participation.create({
      data: {
        id: json.id,
        sessionId: json.sessionId,
        gameId: json.gameId,
        nickname: json.nickname,
        joinedAt: json.joinedAt,
      },
    });
  }

  async exists(sessionId: string, gameId: string): Promise<boolean> {
    const count = await this.prisma.participation.count({
      where: {
        sessionId,
        gameId,
      },
    });

    return count > 0;
  }

  async countByGameId(gameId: string): Promise<number> {
    return await this.prisma.participation.count({
      where: {
        gameId,
      },
    });
  }

  async findBySessionAndGame(
    sessionId: string,
    gameId: string
  ): Promise<ParticipationEntity | null> {
    const participation = await this.prisma.participation.findUnique({
      where: {
        sessionId_gameId: {
          sessionId,
          gameId,
        },
      },
    });

    if (!participation) {
      return null;
    }

    return this.toDomain(participation);
  }

  private toDomain(participation: {
    id: string;
    sessionId: string;
    gameId: string;
    nickname: string;
    joinedAt: Date;
  }): ParticipationEntity {
    return ParticipationEntity.create({
      sessionId: participation.sessionId,
      gameId: participation.gameId,
      nickname: participation.nickname,
    });
  }
}
