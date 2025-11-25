// Use Case: Get Response Status
// Feature: 006-results-dashboard, User Story 1
// Returns real-time response submission status for moderators

import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import type { IAnswerRepository } from '@/server/domain/repositories/IAnswerRepository';
import type {
  ResponseStatusDto,
  ParticipantStatusDto,
} from '@/server/application/dto/ResponseStatusDto';
import { GameId } from '@/server/domain/value-objects/GameId';

type Result<T> = { success: true; data: T } | { success: false; errors: Record<string, string[]> };

export class GetResponseStatus {
  constructor(
    private readonly gameRepository: IGameRepository,
    private readonly answerRepository: IAnswerRepository
  ) {}

  async execute(gameId: string): Promise<Result<ResponseStatusDto>> {
    // Find game
    const game = await this.gameRepository.findById(new GameId(gameId));
    if (!game) {
      return {
        success: false,
        errors: { _form: ['Game not found'] },
      };
    }

    // Validate game status
    if (game.status.toString() !== '出題中') {
      return {
        success: false,
        errors: {
          _form: ['Game not accepting responses. Dashboard only available during answer phase.'],
        },
      };
    }

    // Get all answers for this game
    const answers = await this.answerRepository.findByGameId(gameId);

    // Build participant status list
    const participants: ParticipantStatusDto[] = answers
      .map((answer) => ({
        nickname: answer.nickname,
        hasSubmitted: true,
        submittedAt: answer.createdAt,
      }))
      .sort((a, b) => a.nickname.localeCompare(b.nickname)); // Sort alphabetically

    // Calculate summary
    const totalParticipants = game.currentPlayers;
    const submittedCount = answers.length;
    const allSubmitted = submittedCount === totalParticipants;

    return {
      success: true,
      data: {
        gameId: game.id.toString(),
        gameName: game.name ?? '',
        gameStatus: game.status.toString() as '準備中' | '出題中' | '締切',
        participants,
        totalParticipants,
        submittedCount,
        allSubmitted,
        lastUpdated: new Date(),
      },
    };
  }
}
