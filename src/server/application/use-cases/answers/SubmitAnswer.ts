// Use Case: SubmitAnswer
// Handles answer submission with validation, participation tracking, and upsert

import type { SubmitAnswerRequest } from '@/server/application/dto/requests/SubmitAnswerRequest';
import { AnswerEntity } from '@/server/domain/entities/Answer';
import { ParticipationEntity } from '@/server/domain/entities/Participation';
import type { IAnswerRepository } from '@/server/domain/repositories/IAnswerRepository';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import type { IParticipationRepository } from '@/server/domain/repositories/IParticipationRepository';
import { GameId } from '@/server/domain/value-objects/GameId';

export interface SubmitAnswerSuccess {
  success: true;
  data: {
    answerId: string;
    message: string;
  };
}

export interface SubmitAnswerError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type SubmitAnswerResult = SubmitAnswerSuccess | SubmitAnswerError;

export class SubmitAnswer {
  constructor(
    private readonly answerRepository: IAnswerRepository,
    private readonly participationRepository: IParticipationRepository,
    private readonly gameRepository: IGameRepository
  ) {}

  async execute(request: SubmitAnswerRequest): Promise<SubmitAnswerResult> {
    // Validate selections
    if (!request.selections || Object.keys(request.selections).length === 0) {
      return {
        success: false,
        error: {
          code: 'INVALID_SELECTIONS',
          message: '回答が選択されていません',
        },
      };
    }

    // Fetch and validate game
    let gameId: GameId;
    try {
      gameId = new GameId(request.gameId);
    } catch {
      // Invalid UUID format - treat as not found
      return {
        success: false,
        error: {
          code: 'GAME_NOT_FOUND',
          message: 'ゲームが見つかりません',
        },
      };
    }

    const game = await this.gameRepository.findById(gameId);

    if (!game) {
      return {
        success: false,
        error: {
          code: 'GAME_NOT_FOUND',
          message: 'ゲームが見つかりません',
        },
      };
    }

    // Validate game status - must be in '出題中' (accepting responses)
    if (game.status.toString() === '準備中') {
      return {
        success: false,
        error: {
          code: 'GAME_NOT_STARTED',
          message: 'このゲームはまだ開始されていません',
        },
      };
    }

    if (game.status.toString() === '締切') {
      return {
        success: false,
        error: {
          code: 'GAME_CLOSED',
          message: 'このゲームは締め切られました',
        },
      };
    }

    // Validate that all presenters have selections
    const presenters = await this.gameRepository.findPresentersByGameId(request.gameId);
    const presenterIds = presenters.map((p) => p.id);

    // Check if all presenters have a selection
    for (const presenterId of presenterIds) {
      if (!request.selections[presenterId]) {
        return {
          success: false,
          error: {
            code: 'INCOMPLETE_SELECTIONS',
            message: 'すべての出題者の回答を選択してください',
          },
        };
      }
    }

    // Check if participant exists
    const participantExists = await this.participationRepository.exists(
      request.sessionId,
      request.gameId
    );

    // Check participant limit for new participants
    if (!participantExists) {
      const currentCount = await this.participationRepository.countByGameId(request.gameId);

      if (currentCount >= game.maxPlayers) {
        return {
          success: false,
          error: {
            code: 'PARTICIPANT_LIMIT_REACHED',
            message: '参加人数が上限に達しました',
          },
        };
      }

      // Create participation record
      const participation = ParticipationEntity.create({
        sessionId: request.sessionId,
        gameId: request.gameId,
        nickname: request.nickname,
      });

      await this.participationRepository.create(participation);

      // Update game's current player count
      game.addPlayer();
      await this.gameRepository.update(game);
    }

    // Check if answer already exists
    const existingAnswer = await this.answerRepository.findBySessionAndGame(
      request.sessionId,
      request.gameId
    );

    let answer: AnswerEntity;
    if (existingAnswer) {
      // Update existing answer (preserves ID)
      answer = AnswerEntity.reconstruct({
        id: existingAnswer.id,
        sessionId: request.sessionId,
        gameId: request.gameId,
        nickname: request.nickname,
        selections: request.selections,
        createdAt: existingAnswer.createdAt,
        updatedAt: new Date(),
      });
    } else {
      // Create new answer (generates new ID)
      answer = AnswerEntity.create({
        sessionId: request.sessionId,
        gameId: request.gameId,
        nickname: request.nickname,
        selections: request.selections,
      });
    }

    await this.answerRepository.upsert(answer);

    return {
      success: true,
      data: {
        answerId: answer.id,
        message: '回答を送信しました',
      },
    };
  }
}
