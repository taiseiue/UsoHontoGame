// GameApplicationService
// Server Actions リファクタリング - Phase 2
// ゲーム管理のApplication Service

import { translateZodError } from '@/lib/i18n/translateZodError';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';
import { createGameRepository } from '@/server/infrastructure/repositories';
import { CreateGame } from '@/server/application/use-cases/games/CreateGame';
import { UpdateGameSettings } from '@/server/application/use-cases/games/UpdateGameSettings';
import { DeleteGame } from '@/server/application/use-cases/games/DeleteGame';
import { GetActiveGames } from '@/server/application/use-cases/games/GetActiveGames';
import { GetGamesByCreator } from '@/server/application/use-cases/games/GetGamesByCreator';
import { StartAcceptingResponses } from '@/server/application/use-cases/games/StartAcceptingResponses';
import { CloseGame } from '@/server/application/use-cases/games/CloseGame';
import { ValidateStatusTransition } from '@/server/application/use-cases/games/ValidateStatusTransition';
import type { GetActiveGamesResult } from '@/server/application/use-cases/games/GetActiveGames';
import { GameId } from '@/server/domain/value-objects/GameId';
import {
  CreateGameSchema,
  UpdateGameSchema,
  DeleteGameSchema,
  StartGameActionSchema,
  CloseGameActionSchema,
  StartAcceptingSchema,
} from '@/server/domain/schemas/gameSchemas';
import type { CreateGameOutput, GameManagementDto } from '@/server/application/dto/GameDto';
import type { GameDetailDto } from '@/server/application/dto/GameDetailDto';
import type { ServiceResponse, ServiceVoidResponse } from './types';
import { mapDomainErrorToServiceError } from './errorHandlers';

/**
 * GameApplicationService
 * ゲーム管理のビジネスロジックを調整
 * セッション取得、リポジトリ注入、UseCase実行、エラー変換を担当
 */
export class GameApplicationService {
  /**
   * ゲーム作成（バリデーション含む）
   * @param input 未検証のゲーム作成パラメータ
   * @returns 作成されたゲーム情報またはバリデーションエラー
   */
  async createGame(input: unknown): Promise<ServiceResponse<CreateGameOutput>> {
    // 1. Zodバリデーション
    const validationResult = CreateGameSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        errors: await translateZodError(validationResult.error),
      };
    }

    try {
      // 2. セッション取得
      const sessionService = SessionServiceContainer.getSessionService();
      const sessionId = await sessionService.requireCurrentSession();

      // 3. リポジトリ・UseCase準備
      const repository = createGameRepository();
      const useCase = new CreateGame(repository);

      // 4. UseCase実行
      const game = await useCase.execute({
        creatorId: sessionId,
        name: validationResult.data.name ?? null,
        playerLimit: validationResult.data.playerLimit,
      });

      return {
        success: true,
        data: game,
      };
    } catch (error) {
      return mapDomainErrorToServiceError(error, 'action.game.create.error');
    }
  }

  /**
   * ゲーム設定更新（バリデーション含む）
   * @param input 未検証の更新パラメータ
   * @returns 更新されたゲーム情報またはバリデーションエラー
   */
  async updateGame(input: unknown): Promise<ServiceResponse<GameDetailDto>> {
    // 1. Zodバリデーション
    const validationResult = UpdateGameSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        errors: await translateZodError(validationResult.error),
      };
    }

    try {
      // 2. セッション取得
      const sessionService = SessionServiceContainer.getSessionService();
      const sessionId = await sessionService.requireCurrentSession();

      // 3. リポジトリ・UseCase準備
      const repository = createGameRepository();
      const useCase = new UpdateGameSettings(repository);

      // 4. UseCase実行
      const result = await useCase.execute({
        gameId: validationResult.data.gameId,
        name: validationResult.data.name,
        playerLimit: validationResult.data.playerLimit,
        requesterId: sessionId,
      });

      if (!result.game) {
        return {
          success: false,
          errors: { _form: ['ゲームの更新に失敗しました'] },
        };
      }

      return {
        success: true,
        data: result.game,
      };
    } catch (error) {
      return mapDomainErrorToServiceError(error, 'action.game.update.error');
    }
  }

  /**
   * ゲーム削除（バリデーション含む）
   * @param input 未検証のゲームID
   * @returns 削除成功/失敗
   */
  async deleteGame(input: unknown): Promise<ServiceVoidResponse> {
    // 1. Zodバリデーション
    const validationResult = DeleteGameSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        errors: await translateZodError(validationResult.error),
      };
    }

    try {
      // 2. セッション取得
      const sessionService = SessionServiceContainer.getSessionService();
      const sessionId = await sessionService.requireCurrentSession();

      // 3. リポジトリ・UseCase準備
      const repository = createGameRepository();
      const useCase = new DeleteGame(repository);

      // 4. UseCase実行
      await useCase.execute({
        gameId: validationResult.data.gameId,
        requesterId: sessionId,
      });

      return { success: true };
    } catch (error) {
      return mapDomainErrorToServiceError(error, 'action.game.delete.error');
    }
  }

  /**
   * 作成者のゲーム一覧取得
   * @returns ゲーム一覧
   */
  async getGamesByCreator(): Promise<ServiceResponse<GameManagementDto[]>> {
    try {
      // 1. セッション取得
      const sessionService = SessionServiceContainer.getSessionService();
      const sessionId = await sessionService.requireCurrentSession();

      // 2. リポジトリ・UseCase準備
      const repository = createGameRepository();
      const useCase = new GetGamesByCreator(repository);

      // 3. UseCase実行
      const result = await useCase.execute({
        creatorId: sessionId,
      });

      return {
        success: true,
        data: result.games,
      };
    } catch (error) {
      return mapDomainErrorToServiceError(error, 'action.game.fetch.error');
    }
  }

  /**
   * ゲーム詳細取得
   * @param gameId ゲームID
   * @returns ゲーム詳細情報
   */
  async getGameDetail(gameId: string): Promise<ServiceResponse<GameDetailDto>> {
    try {
      // 1. セッション取得
      const sessionService = SessionServiceContainer.getSessionService();
      const sessionId = await sessionService.requireCurrentSession();

      // 2. リポジトリから直接取得（認可チェック込み）
      const repository = createGameRepository();
      const game = await repository.findById(new GameId(gameId));

      if (!game) {
        return {
          success: false,
          errors: { _form: ['ゲームが見つかりません'] },
        };
      }

      // 3. 認可チェック - 作成者のみ閲覧可能
      if (game.creatorId !== sessionId) {
        return {
          success: false,
          errors: { _form: ['このゲームを閲覧する権限がありません'] },
        };
      }

      // 4. DTOにマッピング
      const gameDetailDto: GameDetailDto = {
        id: game.id.toString(),
        name: game.name,
        status: game.status.toString(),
        maxPlayers: game.maxPlayers,
        currentPlayers: game.currentPlayers,
        availableSlots: game.availableSlots,
        creatorId: game.creatorId,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
      };

      return {
        success: true,
        data: gameDetailDto,
      };
    } catch (error) {
      return mapDomainErrorToServiceError(error, 'action.game.fetch.error');
    }
  }

  /**
   * ゲーム開始（準備中→出題中）（バリデーション含む）
   * @param input 未検証のゲームID
   * @returns 開始成功/失敗
   */
  async startGame(input: unknown): Promise<ServiceVoidResponse> {
    // 1. Zodバリデーション
    const validationResult = StartGameActionSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        errors: await translateZodError(validationResult.error),
      };
    }

    try {
      // 2. セッション取得
      const sessionService = SessionServiceContainer.getSessionService();
      const sessionId = await sessionService.requireCurrentSession();

      // 3. リポジトリ・UseCase準備
      const repository = createGameRepository();

      // 4. ステータス遷移検証
      const validateUseCase = new ValidateStatusTransition(repository);
      const validationResponse = await validateUseCase.execute(
        validationResult.data.gameId,
        '出題中',
        sessionId
      );

      if (!validationResponse.canTransition) {
        return {
          success: false,
          errors: {
            _form: validationResponse.errors.map((err) => err.message),
          },
        };
      }

      // 5. ゲーム開始実行
      const startUseCase = new StartAcceptingResponses(repository);
      await startUseCase.execute({ gameId: validationResult.data.gameId });

      return { success: true };
    } catch (error) {
      return mapDomainErrorToServiceError(error, 'action.game.start.error');
    }
  }

  /**
   * ゲーム終了（出題中→締切）（バリデーション含む）
   * @param input 未検証のゲームID
   * @returns 終了成功/失敗
   */
  async closeGame(input: unknown): Promise<ServiceVoidResponse> {
    // 1. Zodバリデーション
    const validationResult = CloseGameActionSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        errors: await translateZodError(validationResult.error),
      };
    }

    try {
      // 2. セッション取得
      const sessionService = SessionServiceContainer.getSessionService();
      const sessionId = await sessionService.requireCurrentSession();

      // 3. リポジトリ・UseCase準備
      const repository = createGameRepository();

      // 4. ステータス遷移検証
      const validateUseCase = new ValidateStatusTransition(repository);
      const validationResponse = await validateUseCase.execute(
        validationResult.data.gameId,
        '締切',
        sessionId
      );

      if (!validationResponse.canTransition) {
        return {
          success: false,
          errors: {
            _form: validationResponse.errors.map((err) => err.message),
          },
        };
      }

      // 5. ゲーム終了実行
      const closeUseCase = new CloseGame(repository);
      await closeUseCase.execute({ gameId: validationResult.data.gameId, sessionId });

      return { success: true };
    } catch (error) {
      return mapDomainErrorToServiceError(error, 'action.game.close.error');
    }
  }

  /**
   * 回答受付開始（旧startAcceptingAction用）（バリデーション含む）
   * @param input 未検証のゲームID
   * @returns 開始成功/失敗
   */
  async startAcceptingResponses(input: unknown): Promise<ServiceVoidResponse> {
    // 1. Zodバリデーション
    const validationResult = StartAcceptingSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        errors: await translateZodError(validationResult.error),
      };
    }

    try {
      // 2. セッション取得（認可用、現在は使用していないが将来のため）
      const sessionService = SessionServiceContainer.getSessionService();
      await sessionService.requireCurrentSession();

      // 3. リポジトリ・UseCase準備
      const repository = createGameRepository();
      const useCase = new StartAcceptingResponses(repository);

      // 4. UseCase実行
      await useCase.execute({ gameId: validationResult.data.gameId });

      return { success: true };
    } catch (error) {
      return mapDomainErrorToServiceError(error, 'action.game.start.error');
    }
  }

  /**
   * 公開中・締切ゲーム一覧取得（認証不要・TOP用）
   * @param params cursor, limit
   * @returns ゲーム一覧とページネーション情報
   */
  async getActiveGames(params: {
    cursor?: string;
    limit?: number;
  } = {}): Promise<GetActiveGamesResult> {
    const repository = createGameRepository();
    const useCase = new GetActiveGames(repository);
    return useCase.execute(params);
  }
}
