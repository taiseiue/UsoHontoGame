/**
 * ValidateStatusTransition Use Case
 * Feature: 004-status-transition
 *
 * Validates whether a game can transition from its current status to a target status.
 * Implements all business rules for status transitions as defined in data-model.md.
 */

import type { Game } from '../../../domain/entities/Game';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import {
  StatusTransitionError,
  type StatusTransitionErrorCode,
} from '../../../domain/errors/StatusTransitionError';
import type { IGameRepository } from '../../../domain/repositories/IGameRepository';
import { GameId } from '../../../domain/value-objects/GameId';
import type { GameStatusValue } from '../../../domain/value-objects/GameStatus';

export interface ValidationResult {
  canTransition: boolean;
  currentStatus: GameStatusValue;
  targetStatus: GameStatusValue;
  errors: Array<{
    code: StatusTransitionErrorCode;
    message: string;
    details?: Record<string, unknown>;
  }>;
}

/**
 * Use Case for validating status transitions
 * Implements all validation rules from the specification
 */
export class ValidateStatusTransition {
  constructor(private readonly gameRepository: IGameRepository) {}

  /**
   * Validates a status transition
   * @param gameId The game ID to validate
   * @param targetStatus The target status to transition to
   * @param sessionId The session ID of the user attempting the transition
   * @returns Validation result with errors if any
   */
  async execute(
    gameId: string,
    targetStatus: GameStatusValue,
    sessionId: string
  ): Promise<ValidationResult> {
    // Find the game
    const game = await this.gameRepository.findById(new GameId(gameId));
    if (!game) {
      throw new NotFoundError('ゲームが見つかりません');
    }

    const currentStatus = game.status.value;
    const errors: ValidationResult['errors'] = [];

    // Validate target status is allowed
    if (!this.isValidTargetStatus(targetStatus)) {
      throw StatusTransitionError.invalidTransition(currentStatus, targetStatus);
    }

    // Check authorization - only game creator can change status
    if (game.creatorId !== sessionId) {
      errors.push({
        code: 'UNAUTHORIZED',
        message: 'このゲームを変更する権限がありません',
      });
    }

    // Check if game is already closed (no transitions allowed from 締切)
    if (game.status.isClosed()) {
      errors.push({
        code: 'GAME_ALREADY_CLOSED',
        message: '締切状態のゲームは変更できません',
      });
    }

    // Validate specific transition rules
    if (errors.length === 0) {
      // Only validate if not already failed
      await this.validateTransitionRules(game, targetStatus, errors);
    }

    return {
      canTransition: errors.length === 0,
      currentStatus,
      targetStatus,
      errors,
    };
  }

  /**
   * Validates if the target status is a valid transition target
   */
  private isValidTargetStatus(targetStatus: string): targetStatus is GameStatusValue {
    return ['出題中', '締切'].includes(targetStatus);
  }

  /**
   * Validates specific transition business rules
   */
  private async validateTransitionRules(
    game: Game,
    targetStatus: GameStatusValue,
    errors: ValidationResult['errors']
  ): Promise<void> {
    const currentStatus = game.status.value;

    if (currentStatus === '準備中' && targetStatus === '出題中') {
      await this.validateStartGameTransition(game.id.value, errors);
    } else if (currentStatus === '出題中' && targetStatus === '締切') {
      // No additional validation needed for closing - just confirmation (handled in UI)
    } else {
      // Invalid transition path
      errors.push({
        code: 'INVALID_STATUS_TRANSITION',
        message: '無効なステータス遷移です',
      });
    }
  }

  /**
   * Validates the 準備中 → 出題中 transition
   * Business Rules:
   * - Game must have at least 1 presenter
   * - Each presenter must have exactly 3 episodes
   * - Each presenter must have exactly 1 episode where isLie = true
   */
  private async validateStartGameTransition(
    gameId: string,
    errors: ValidationResult['errors']
  ): Promise<void> {
    // Get all presenters for the game
    const presenters = await this.gameRepository.findPresentersByGameId(gameId);

    // Rule 1: Game must have at least 1 presenter
    if (presenters.length === 0) {
      errors.push({
        code: 'NO_PRESENTERS',
        message: 'ゲームを開始するには出題者が必要です',
      });
      return; // No point checking episodes if no presenters
    }

    // Rule 2 & 3: Validate each presenter's episodes
    for (const presenter of presenters) {
      const episodes = await this.gameRepository.findEpisodesByPresenterId(presenter.id);

      // Rule 2: Each presenter must have exactly 3 episodes
      if (episodes.length !== 3) {
        errors.push({
          code: 'INCOMPLETE_PRESENTER',
          message: `出題者 ${presenter.nickname} のエピソードが不完全です`,
          details: { presenterNickname: presenter.nickname, episodeCount: episodes.length },
        });
        continue; // Skip lie validation if episode count is wrong
      }

      // Rule 3: Each presenter must have exactly 1 episode where isLie = true
      const lieCount = episodes.filter((ep) => ep.isLie).length;
      if (lieCount !== 1) {
        errors.push({
          code: 'INVALID_LIE_COUNT',
          message: `出題者 ${presenter.nickname} はウソを1つ選択する必要があります`,
          details: { presenterNickname: presenter.nickname, lieCount },
        });
      }
    }
  }
}
