// Infrastructure: Prisma Answer Repository
// Implements IAnswerRepository interface using Prisma ORM

import type { PrismaClient } from '@/generated/prisma';
import { AnswerEntity } from '@/server/domain/entities/Answer';
import type { IAnswerRepository } from '@/server/domain/repositories/IAnswerRepository';

export class PrismaAnswerRepository implements IAnswerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(answer: AnswerEntity): Promise<void> {
    const json = answer.toJSON();

    await this.prisma.answer.upsert({
      where: {
        sessionId_gameId: {
          sessionId: json.sessionId,
          gameId: json.gameId,
        },
      },
      update: {
        nickname: json.nickname,
        selections: json.selections,
        updatedAt: json.updatedAt,
      },
      create: {
        id: json.id,
        sessionId: json.sessionId,
        gameId: json.gameId,
        nickname: json.nickname,
        selections: json.selections,
        createdAt: json.createdAt,
        updatedAt: json.updatedAt,
      },
    });
  }

  async findBySessionAndGame(sessionId: string, gameId: string): Promise<AnswerEntity | null> {
    const answer = await this.prisma.answer.findUnique({
      where: {
        sessionId_gameId: {
          sessionId,
          gameId,
        },
      },
    });

    if (!answer) {
      return null;
    }

    return this.toDomain(answer);
  }

  async findByGameId(gameId: string): Promise<AnswerEntity[]> {
    const answers = await this.prisma.answer.findMany({
      where: {
        gameId,
      },
    });

    return answers.map((answer) => this.toDomain(answer));
  }

  async delete(sessionId: string, gameId: string): Promise<void> {
    await this.prisma.answer.deleteMany({
      where: {
        sessionId,
        gameId,
      },
    });
  }

  async findSelectionsByAnswer(
    answerId: string
  ): Promise<Array<{ presenterId: string; episodeId: string }>> {
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
    });

    if (!answer) {
      return [];
    }

    // Parse selections from JSON
    const selections =
      typeof answer.selections === 'string' ? JSON.parse(answer.selections) : answer.selections;

    // Convert selections object to array of {presenterId, episodeId}
    return Object.entries(selections as Record<string, string>).map(
      ([presenterId, episodeId]) => ({
        presenterId,
        episodeId,
      })
    );
  }

  private toDomain(answer: {
    id: string;
    sessionId: string;
    gameId: string;
    nickname: string;
    selections: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): AnswerEntity {
    // Parse selections from JSON (Prisma stores as JSON, need to convert to object)
    const selections =
      typeof answer.selections === 'string' ? JSON.parse(answer.selections) : answer.selections;

    return AnswerEntity.reconstruct({
      id: answer.id,
      sessionId: answer.sessionId,
      gameId: answer.gameId,
      nickname: answer.nickname,
      selections: selections as Record<string, string>,
      createdAt: answer.createdAt,
      updatedAt: answer.updatedAt,
    });
  }
}
