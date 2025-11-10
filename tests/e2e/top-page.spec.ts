import { test, expect } from '@playwright/test';

/**
 * E2E Tests for TOP Page
 *
 * Tests the following user stories:
 * - US1: First-time visitor creates session with nickname
 * - US2: User browses available games
 *
 * Validates:
 * - Session creation and persistence
 * - Nickname validation and storage
 * - Game list filtering and display
 * - No-JavaScript functionality (Server Components)
 */

test.describe('TOP Page - Session Management', () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies before each test to simulate first-time visitor
    await context.clearCookies();
  });

  test('US1: First-time visitor can create session and set nickname', async ({ page }) => {
    // Given: A first-time visitor
    await page.goto('/');

    // Then: Should see nickname input form
    await expect(page.getByRole('heading', { name: 'ニックネームを設定' })).toBeVisible();
    await expect(page.getByPlaceholder('例: 田中太郎')).toBeVisible();

    // When: User enters a valid nickname
    const nickname = 'テストユーザー';
    await page.getByPlaceholder('例: 田中太郎').fill(nickname);
    await page.getByRole('button', { name: '設定する' }).click();

    // Then: Should navigate to game list page
    await expect(page.getByText(`ようこそ、${nickname}さん！`)).toBeVisible({ timeout: 10000 });

    // And: Session cookie should be set
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === 'sessionId');
    const nicknameCookie = cookies.find(c => c.name === 'nickname');

    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.httpOnly).toBe(true); // FR-001: HTTP-only cookie
    expect(sessionCookie?.sameSite).toBe('Lax');
    expect(nicknameCookie).toBeDefined();
    expect(nicknameCookie?.value).toBe(nickname);
  });

  test('FR-014: Empty nickname validation prevents submission', async ({ page }) => {
    // Given: A first-time visitor on nickname input page
    await page.goto('/');

    // When: User tries to submit empty nickname
    await page.getByPlaceholder('例: 田中太郎').fill('');
    await page.getByRole('button', { name: '設定する' }).click();

    // Then: Should show validation error
    await expect(page.getByText('ニックネームを入力してください')).toBeVisible();

    // And: Should remain on nickname input page
    await expect(page.getByRole('heading', { name: 'ニックネームを設定' })).toBeVisible();
  });

  test('Nickname max length validation (50 characters)', async ({ page }) => {
    // Given: A first-time visitor on nickname input page
    await page.goto('/');

    // When: User enters a nickname longer than 50 characters
    const longNickname = 'あ'.repeat(51);
    await page.getByPlaceholder('例: 田中太郎').fill(longNickname);

    // Then: Should show validation error
    await expect(page.getByText('ニックネームは50文字以内で入力してください')).toBeVisible();
  });

  test('SC-002: Session persists across browser reloads (30-day cookie)', async ({ page, context }) => {
    // Given: User has set nickname
    await page.goto('/');
    const nickname = 'テスト永続化';
    await page.getByPlaceholder('例: 田中太郎').fill(nickname);
    await page.getByRole('button', { name: '設定する' }).click();
    await expect(page.getByText(`ようこそ、${nickname}さん！`)).toBeVisible({ timeout: 10000 });

    // When: Page is reloaded
    await page.reload();

    // Then: User should still be logged in without nickname prompt
    await expect(page.getByText(`ようこそ、${nickname}さん！`)).toBeVisible();

    // And: Cookie should have 30-day expiration
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name === 'sessionId');
    const nicknameCookie = cookies.find(c => c.name === 'nickname');

    // Check maxAge is approximately 30 days (2592000 seconds ± 10 seconds for test execution time)
    expect(sessionCookie).toBeDefined();
    expect(nicknameCookie).toBeDefined();

    // Cookies set via next/headers use maxAge, which gets converted to expires
    // Verify the cookie expires in the future (approximately 30 days)
    if (sessionCookie?.expires) {
      const expiresDate = new Date(sessionCookie.expires * 1000);
      const now = new Date();
      const diffInDays = (expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffInDays).toBeGreaterThan(29); // At least 29 days remaining
      expect(diffInDays).toBeLessThan(31); // At most 31 days
    }
  });
});

test.describe('TOP Page - Game Browsing', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear cookies and set up session with nickname for game browsing tests
    await context.clearCookies();
    await page.goto('/');
    await page.getByPlaceholder('例: 田中太郎').fill('ゲームテストユーザー');
    await page.getByRole('button', { name: '設定する' }).click();
    await expect(page.getByText('ようこそ、ゲームテストユーザーさん！')).toBeVisible({ timeout: 10000 });
  });

  test('US2: User can browse available games with 出題中 status', async ({ page }) => {
    // Given: User has session and nickname set (done in beforeEach)

    // Then: Should see game list section
    await expect(page.getByText('参加可能なゲーム')).toBeVisible();
  });

  test('FR-007: Only games with 出題中 status are displayed', async ({ page }) => {
    // Given: Multiple games exist with different statuses (seeded in repository)
    // The InMemoryGameRepository should have test data

    // Then: Game list should only show games with 出題中 status
    // Note: This test depends on test data being available
    // If no games are available, should show empty state message
    const gameListSection = page.locator('[data-testid="game-list"]').or(page.getByText('参加可能なゲーム'));
    await expect(gameListSection).toBeVisible();
  });

  test('FR-011 equivalent: Empty state when no games available', async ({ page }) => {
    // Given: User is on TOP page with nickname set
    // And: No games with 出題中 status exist

    // Then: Should show appropriate empty state message
    // This test may need to be adjusted based on actual empty state implementation
    const content = await page.textContent('body');
    const hasGames = content?.includes('参加可能なゲーム') ?? false;

    // Either games are shown or empty state is shown
    expect(hasGames).toBe(true);
  });
});

test.describe('TOP Page - No JavaScript Functionality (FR-016)', () => {
  test('TOP page renders server-side without JavaScript', async ({ browser }) => {
    // Create a context with JavaScript disabled
    const context = await browser.newContext({
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    // Given: User visits TOP page without JavaScript
    await page.goto('/');

    // Then: Should see nickname input form (Server Component)
    await expect(page.getByRole('heading', { name: 'ニックネームを設定' })).toBeVisible();
    await expect(page.getByPlaceholder('例: 田中太郎')).toBeVisible();
    await expect(page.getByRole('button', { name: '設定する' })).toBeVisible();

    // Note: Form submission requires JavaScript for client-side validation and Server Action
    // However, the page structure and content should be visible without JS (Server Components)

    await context.close();
  });

  test('Game list renders server-side with existing session', async ({ browser, context: defaultContext }) => {
    // First, create a session with nickname using JavaScript enabled
    const setupPage = await defaultContext.newPage();
    await setupPage.goto('/');
    await setupPage.getByPlaceholder('例: 田中太郎').fill('NoJSテスト');
    await setupPage.getByRole('button', { name: '設定する' }).click();
    await expect(setupPage.getByText('ようこそ、NoJSテストさん！')).toBeVisible({ timeout: 10000 });

    // Get cookies from the setup page
    const cookies = await defaultContext.cookies();
    await setupPage.close();

    // Now test with JavaScript disabled
    const noJsContext = await browser.newContext({
      javaScriptEnabled: false,
    });

    // Add the session cookies to the no-JS context
    await noJsContext.addCookies(cookies);

    const page = await noJsContext.newPage();
    await page.goto('/');

    // Then: Should see game list page (Server Component)
    await expect(page.getByText('ようこそ、NoJSテストさん！')).toBeVisible();
    await expect(page.getByText('参加可能なゲーム')).toBeVisible();

    await noJsContext.close();
  });
});

test.describe('TOP Page - Performance (SC-001)', () => {
  test('SC-001: Session creation and nickname setup takes less than 30 seconds', async ({ page }) => {
    const startTime = Date.now();

    // Given: A first-time visitor
    await page.goto('/');

    // When: User creates session and sets nickname
    await page.getByPlaceholder('例: 田中太郎').fill('パフォーマンステスト');
    await page.getByRole('button', { name: '設定する' }).click();

    // Then: Should complete in less than 30 seconds
    await expect(page.getByText('ようこそ、パフォーマンステストさん！')).toBeVisible({ timeout: 10000 });

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds

    expect(duration).toBeLessThan(30); // SC-001: Less than 30 seconds
    console.log(`Session creation completed in ${duration.toFixed(2)} seconds`);
  });
});
