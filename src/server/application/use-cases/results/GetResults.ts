// Use Case: Get Results
// Feature: 006-results-dashboard, User Story 3
// Returns final rankings with winner highlighting

import type { RankingDto } from '@/server/application/dto/RankingDto';
import type { IAnswerRepository } from '@/server/domain/repositories/IAnswerRepository';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import { GameId } from '@/server/domain/value-objects/GameId';

type Result<T> = { success: true; data: T } | { success: false; errors: Record<string, string[]> };

export class GetResults {
  constructor(
    private readonly gameRepository: IGameRepository,
    private readonly answerRepository: IAnswerRepository
  ) {}

  async execute(gameId: string): Promise<Result<RankingDto>> {
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
          _form: ["Results only available when game status is '締切'"],
        },
      };
    }

    // Get presenters and episodes
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

    // Calculate scores and build rankings
    const participantScores = answers.map((answer) => {
      const selections: Record<
        string,
        { episodeId: string; episodeText: string; wasCorrect: boolean }
      > = {};
      let totalScore = 0;

      presenterData.forEach((presenter) => {
        const selectedEpisodeId = answer.selections.get(presenter.presenterId) || '';
        const selectedEpisode = presenter.episodes.find((ep) => ep.id === selectedEpisodeId);
        const wasCorrect = selectedEpisodeId === presenter.lieEpisodeId;

        selections[presenter.presenterId] = {
          episodeId: selectedEpisodeId,
          episodeText: selectedEpisode?.text || '',
          wasCorrect,
        };

        if (wasCorrect) {
          totalScore += 10;
        }
      });

      return {
        nickname: answer.nickname,
        totalScore,
        selections,
      };
    });

    // Sort by score (highest first)
    participantScores.sort((a, b) => b.totalScore - a.totalScore);

    // Assign ranks (handle ties)
    const highestScore = participantScores.length > 0 ? participantScores[0].totalScore : 0;
    let currentRank = 1;
    const rankings = participantScores.map((participant, index) => {
      if (index > 0 && participant.totalScore < participantScores[index - 1].totalScore) {
        currentRank = index + 1;
      }
      return {
        rank: currentRank,
        nickname: participant.nickname,
        totalScore: participant.totalScore,
        isWinner: currentRank === 1,
        selections: participant.selections,
      };
    });

    // Calculate average score
    const totalScore = participantScores.reduce((sum, p) => sum + p.totalScore, 0);
    const averageScore =
      participantScores.length > 0
        ? Math.round((totalScore / participantScores.length) * 10) / 10
        : 0;

    // Calculate median score
    let medianScore = 0;
    if (participantScores.length > 0) {
      const sortedScores = [...participantScores].map((p) => p.totalScore).sort((a, b) => a - b);

      if (sortedScores.length % 2 === 0) {
        // Even: average of two middle values
        const mid1 = sortedScores[sortedScores.length / 2 - 1];
        const mid2 = sortedScores[sortedScores.length / 2];
        medianScore = Math.round(((mid1 + mid2) / 2) * 10) / 10;
      } else {
        // Odd: middle value
        medianScore = sortedScores[Math.floor(sortedScores.length / 2)];
      }
    }

    return {
      success: true,
      data: {
        gameId: game.id.toString(),
        gameName: game.name ?? '',
        rankings,
        totalParticipants: answers.length,
        highestScore,
        averageScore,
        medianScore,
        calculatedAt: new Date(),
      },
    };
  }
}
