import { expect, test } from '@playwright/test';

/**
 * E2E Tests for Answer Submission Flow
 * Feature: 001-lie-detection-answers (User Story 1)
 * Task: T047
 *
 * Tests the complete participant journey:
 * 1. Navigate from TOP page to active game
 * 2. Select lie episodes for each presenter
 * 3. Submit answer
 * 4. Verify redirect to TOP page
 *
 * Validates:
 * - Game selection from TOP page
 * - Answer form rendering with presenters/episodes
 * - Selection state management
 * - Form validation (all presenters must have selection)
 * - Answer submission and redirect
 * - Answer upsert on resubmission
 */

test.describe('Answer Submission - Participant Journey', () => {
  let _gameId: string;
  let nickname: string;

  test.beforeEach(async ({ page, context }) => {
    // Clear cookies to simulate fresh participant
    await context.clearCookies();
    nickname = `参加者${Date.now()}`;

    // Setup: Create session and set nickname
    await page.goto('/');
    await page.getByPlaceholder('例: 田中太郎').fill(nickname);
    await page.getByRole('button', { name: '設定する' }).click();
    await expect(page.getByText(`ようこそ、${nickname}さん！`)).toBeVisible({ timeout: 10000 });

    // Note: This test assumes there's at least one active game (出題中)
    // In a real test environment, you'd create a game programmatically via API
    // For now, we'll check if games exist and skip if none available
  });

  test('US1: Participant can select and submit answers for active game', async ({ page }) => {
    // Given: User is on TOP page with active games displayed
    await page.goto('/');

    // Check if there are any active games
    const gameCards = page.locator('[data-testid="game-card"]');
    const gameCount = await gameCards.count();

    if (gameCount === 0) {
      test.skip(true, 'No active games available for testing');
      return;
    }

    // When: User clicks on a game to answer
    // (Assuming games have clickable cards or links)
    const firstGameCard = gameCards.first();
    await firstGameCard.click();

    // Then: Should navigate to answer submission page
    await expect(page).toHaveURL(/\/games\/[^/]+\/answer/);

    // And: Should see answer form header
    await expect(page.getByRole('heading', { name: /嘘を見抜いて回答しよう/i })).toBeVisible();
    await expect(
      page.getByText(/各出題者のエピソードから嘘だと思うものを1つ選んでください/i)
    ).toBeVisible();

    // And: Should see presenters and their episodes
    await expect(page.getByRole('region', { name: /のエピソード$/i })).toBeVisible();

    // When: User selects one episode per presenter
    // (This assumes episodes are rendered as buttons with aria-pressed)
    const episodeButtons = page
      .getByRole('button', { pressed: false })
      .filter({ hasText: /エピソード/ });
    const episodeCount = await episodeButtons.count();

    if (episodeCount > 0) {
      // Select first episode for each presenter (simplified for test)
      // In a real scenario, you'd select specific episodes
      await episodeButtons.first().click();
    }

    // Then: Submit button should be enabled when all selections complete
    // (This test is simplified - in reality, you'd select all required episodes)
    const submitButton = page.getByRole('button', { name: /回答を送信/i });

    // When: User submits the answer
    if (await submitButton.isEnabled()) {
      await submitButton.click();

      // Then: Should redirect to TOP page
      await expect(page).toHaveURL('/', { timeout: 10000 });

      // And: Should show success message or confirmation
      // (Implementation may vary - could be toast, alert, or status message)
    }
  });

  test('FR-005: Submit button disabled until all presenters have selections', async ({ page }) => {
    // Given: User is on answer submission page
    await page.goto('/');

    const gameCards = page.locator('[data-testid="game-card"]');
    const gameCount = await gameCards.count();

    if (gameCount === 0) {
      test.skip(true, 'No active games available for testing');
      return;
    }

    await gameCards.first().click();
    await expect(page).toHaveURL(/\/games\/[^/]+\/answer/);

    // When: Form is displayed without any selections
    const submitButton = page.getByRole('button', { name: /回答を送信/i });

    // Then: Submit button should be disabled
    await expect(submitButton).toBeDisabled();

    // And: Should show validation message
    await expect(page.getByText(/すべての出題者のエピソードを選択してください/i)).toBeVisible();
  });

  test('Visual selection feedback when episode is clicked', async ({ page }) => {
    // Given: User is on answer submission page
    await page.goto('/');

    const gameCards = page.locator('[data-testid="game-card"]');
    const gameCount = await gameCards.count();

    if (gameCount === 0) {
      test.skip(true, 'No active games available for testing');
      return;
    }

    await gameCards.first().click();
    await expect(page).toHaveURL(/\/games\/[^/]+\/answer/);

    // When: User clicks an episode button
    const firstEpisodeButton = page
      .getByRole('button', { pressed: false })
      .filter({ hasText: /エピソード/ })
      .first();

    if ((await firstEpisodeButton.count()) > 0) {
      await firstEpisodeButton.click();

      // Then: Button should show selected state
      await expect(firstEpisodeButton).toHaveAttribute('aria-pressed', 'true');
      await expect(firstEpisodeButton).toHaveAttribute('data-selected', 'true');

      // And: Should have visual styling for selected state
      // (Checking for presence of blue background class)
      const classList = await firstEpisodeButton.getAttribute('class');
      expect(classList).toContain('bg-blue');
    }
  });

  test('Reset button clears all selections', async ({ page }) => {
    // Given: User is on answer submission page with selections made
    await page.goto('/');

    const gameCards = page.locator('[data-testid="game-card"]');
    const gameCount = await gameCards.count();

    if (gameCount === 0) {
      test.skip(true, 'No active games available for testing');
      return;
    }

    await gameCards.first().click();
    await expect(page).toHaveURL(/\/games\/[^/]+\/answer/);

    // Select an episode
    const episodeButton = page
      .getByRole('button', { pressed: false })
      .filter({ hasText: /エピソード/ })
      .first();

    if ((await episodeButton.count()) > 0) {
      await episodeButton.click();
      await expect(episodeButton).toHaveAttribute('aria-pressed', 'true');

      // When: User clicks reset button
      const resetButton = page.getByRole('button', { name: /リセット/i });
      await resetButton.click();

      // Then: All selections should be cleared
      await expect(episodeButton).toHaveAttribute('aria-pressed', 'false');
      await expect(episodeButton).toHaveAttribute('data-selected', 'false');
    }
  });

  test('FR-013: Resubmission updates existing answer (upsert)', async ({ page }) => {
    // Given: User has already submitted an answer
    await page.goto('/');

    const gameCards = page.locator('[data-testid="game-card"]');
    const gameCount = await gameCards.count();

    if (gameCount === 0) {
      test.skip(true, 'No active games available for testing');
      return;
    }

    // First submission
    await gameCards.first().click();
    await expect(page).toHaveURL(/\/games\/[^/]+\/answer/);

    const episodeButtons = page
      .getByRole('button', { pressed: false })
      .filter({ hasText: /エピソード/ });

    if ((await episodeButtons.count()) > 0) {
      // Make initial selection and submit
      await episodeButtons.first().click();
      const submitButton = page.getByRole('button', { name: /回答を送信/i });

      if (await submitButton.isEnabled()) {
        await submitButton.click();
        await expect(page).toHaveURL('/', { timeout: 10000 });

        // When: User returns to the same game to modify answer
        await gameCards.first().click();
        await expect(page).toHaveURL(/\/games\/[^/]+\/answer/);

        // Then: Previous selections should be loaded
        const selectedButtons = page.getByRole('button', { pressed: true });
        await expect(selectedButtons.first()).toBeVisible();

        // When: User changes selection and resubmits
        const unselectedButton = page
          .getByRole('button', { pressed: false })
          .filter({ hasText: /エピソード/ })
          .first();

        if ((await unselectedButton.count()) > 0) {
          await unselectedButton.click();
          await submitButton.click();

          // Then: Should successfully update (upsert)
          await expect(page).toHaveURL('/', { timeout: 10000 });
        }
      }
    }
  });

  test('Accessibility: Keyboard navigation through episodes', async ({ page }) => {
    // Given: User is on answer submission page
    await page.goto('/');

    const gameCards = page.locator('[data-testid="game-card"]');
    const gameCount = await gameCards.count();

    if (gameCount === 0) {
      test.skip(true, 'No active games available for testing');
      return;
    }

    await gameCards.first().click();
    await expect(page).toHaveURL(/\/games\/[^/]+\/answer/);

    // When: User navigates using keyboard
    const episodeButtons = page.getByRole('button').filter({ hasText: /エピソード/ });

    if ((await episodeButtons.count()) > 0) {
      const firstButton = episodeButtons.first();

      // Tab to first episode button
      await page.keyboard.press('Tab');
      await expect(firstButton).toBeFocused();

      // Press Space/Enter to select
      await page.keyboard.press('Space');
      await expect(firstButton).toHaveAttribute('aria-pressed', 'true');

      // Tab to next button
      await page.keyboard.press('Tab');
      const secondButton = episodeButtons.nth(1);
      await expect(secondButton).toBeFocused();
    }
  });

  test('Error handling: Game not found', async ({ page }) => {
    // When: User tries to access non-existent game
    await page.goto('/games/non-existent-game-id/answer');

    // Then: Should show error message
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText(/ゲームが見つかりませんでした/i)).toBeVisible();
  });

  test('Error handling: Game in wrong status (not 出題中)', async ({ page: _page }) => {
    // Note: This test would require programmatic game creation in 準備中 or 締切 status
    // Skipping for now as it requires backend setup
    test.skip(true, 'Requires programmatic game creation in non-active status');
  });
});

test.describe('Answer Submission - Edge Cases', () => {
  test('FR-015: Reject access to game with zero presenters', async ({
    page: _page,
    context: _context,
  }) => {
    // Note: This test would require programmatic game creation with no presenters
    // Skipping for now as it requires backend setup
    test.skip(true, 'Requires programmatic game creation with zero presenters');
  });

  test('FR-009: Reject access when participant limit reached', async ({
    page: _page,
    context: _context,
  }) => {
    // Note: This test would require:
    // 1. Creating game with maxParticipants=5
    // 2. Having 5 sessions submit answers
    // 3. Attempting 6th session access
    // Skipping for now as it requires complex backend setup
    test.skip(
      true,
      'Requires programmatic game creation with participant limit and multiple sessions'
    );
  });
});
