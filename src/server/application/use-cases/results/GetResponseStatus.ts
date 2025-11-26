// Use Case: Get Response Status
// Feature: 006-results-dashboard, User Story 1
// Feature: 007-game-closure, User Story 3 (added closed game support)
// Returns real-time response submission status for moderators

import type {
  ParticipantStatusDto,
  ResponseStatusDto,
} from '@/server/application/dto/ResponseStatusDto';
import type { IAnswerRepository } from '@/server/domain/repositories/IAnswerRepository';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
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

    // Validate game status - allow both 出題中 and 締切 for dashboard viewing
    const gameStatus = game.status.toString();
    if (gameStatus !== '出題中' && gameStatus !== '締切') {
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

    // Determine if polling should continue - stop when game is closed
    const shouldContinuePolling = gameStatus === '出題中';

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
        shouldContinuePolling,
        lastUpdated: new Date(),
      },
    };
  }
}
