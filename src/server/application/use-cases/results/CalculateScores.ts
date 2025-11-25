// Use Case: Calculate Scores
// Feature: 006-results-dashboard, User Story 2
// Calculates participant scores based on correct lie identification

import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import type { IAnswerRepository } from '@/server/domain/repositories/IAnswerRepository';
import type { ScoreDto } from '@/server/application/dto/ScoreDto';
import { GameId } from '@/server/domain/value-objects/GameId';

type Result<T> = { success: true; data: T } | { success: false; errors: Record<string, string[]> };

export interface CalculateScoresOutput {
  gameId: string;
  gameName: string;
  scores: ScoreDto[];
  calculatedAt: Date;
}

export class CalculateScores {
  constructor(
    private readonly gameRepository: IGameRepository,
    private readonly answerRepository: IAnswerRepository
  ) {}

  async execute(gameId: string): Promise<Result<CalculateScoresOutput>> {
    // Find game
    const game = await this.gameRepository.findById(new GameId(gameId));
    if (!game) {
      return {
        success: false,
        errors: { _form: ['Game not found'] },
      };
    }

    // Validate game status (must be closed)
    if (game.status.toString() !== '締切') {
      return {
        success: false,
        errors: {
          _form: ["Scoreboard only available when game status is '締切'"],
        },
      };
    }

    // Get all presenters and their episodes
    const presenters = await this.gameRepository.findPresentersByGameId(gameId);
    const presenterData = await Promise.all(
      presenters.map(async (presenter) => {
        const episodes = await this.gameRepository.findEpisodesByPresenterId(presenter.id);
        const lieEpisode = episodes.find((ep) => ep.isLie);
        return {
          presenterId: presenter.id,
          presenterNickname: presenter.nickname,
          lieEpisodeId: lieEpisode?.id || '',
          episodes,
        };
      })
    );

    // Get all answers
    const answers = await this.answerRepository.findByGameId(gameId);

    // Calculate scores for each participant
    const scores: ScoreDto[] = answers.map((answer) => {
      const details = presenterData.map((presenter) => {
        const selectedEpisodeId = answer.selections.get(presenter.presenterId) || '';
        const selectedEpisode = presenter.episodes.find((ep) => ep.id === selectedEpisodeId);
        const wasCorrect = selectedEpisodeId === presenter.lieEpisodeId;

        return {
          presenterId: presenter.presenterId,
          presenterNickname: presenter.presenterNickname,
          selectedEpisodeId,
          selectedEpisodeText: selectedEpisode?.text || '',
          correctEpisodeId: presenter.lieEpisodeId,
          wasCorrect,
          pointsEarned: wasCorrect ? 10 : 0,
        };
      });

      const totalScore = details.reduce((sum, detail) => sum + detail.pointsEarned, 0);

      return {
        nickname: answer.nickname,
        totalScore,
        details,
      };
    });

    // Sort by score (highest first)
    scores.sort((a, b) => b.totalScore - a.totalScore);

    return {
      success: true,
      data: {
        gameId: game.id.toString(),
        gameName: game.name ?? '',
        scores,
        calculatedAt: new Date(),
      },
    };
  }
}
