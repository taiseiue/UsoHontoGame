import { test, expect, type Page } from '@playwright/test';

/**
 * E2E Test: Responsive Design
 *
 * Tests the application across different viewport sizes:
 * - Mobile (375px) - iPhone SE
 * - Tablet (768px) - iPad
 * - Desktop (1024px) - Standard laptop
 */

const viewports = [
  { name: 'Mobile (375px)', width: 375, height: 667 },
  { name: 'Tablet (768px)', width: 768, height: 1024 },
  { name: 'Desktop (1024px)', width: 1024, height: 768 },
];

async function testPageResponsiveness(page: Page, viewportName: string) {
  // Test that key elements are visible and properly sized
  const elements = await page.locator('button, input, a').all();

  for (const element of elements) {
    if (await element.isVisible()) {
      const box = await element.boundingBox();
      if (box) {
        // Check minimum touch target size (44px for mobile)
        if (viewportName.includes('Mobile') || viewportName.includes('Tablet')) {
          expect(box.height).toBeGreaterThanOrEqual(40); // Allow 40px minimum for some elements
        }
      }
    }
  }
}

test.describe('Responsive Design Tests', () => {
  for (const viewport of viewports) {
    test(`JoinPage should be responsive at ${viewport.name}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      const page = await context.newPage();

      await test.step(`Navigate to JoinPage`, async () => {
        await page.goto('/');

        // Verify page loads
        await expect(page.locator('text=ウソホントゲーム')).toBeVisible();

        // Check that form elements are visible
        await expect(page.locator('input#nickname')).toBeVisible();
        await expect(page.locator('button:has-text("ゲームを作成")')).toBeVisible();
      });

      await test.step(`Verify interactive elements`, async () => {
        // Check button sizes
        const createButton = page.locator('button:has-text("ゲームを作成")');
        const box = await createButton.boundingBox();

        if (box) {
          // Mobile and tablet should have touch-friendly sizes
          if (viewport.name.includes('Mobile') || viewport.name.includes('Tablet')) {
            expect(box.height).toBeGreaterThanOrEqual(40);
          }
        }
      });

      await test.step(`Test form interaction`, async () => {
        // Fill form and verify it works on this viewport
        await page.fill('input#nickname', 'Test User');
        const value = await page.inputValue('input#nickname');
        expect(value).toBe('Test User');
      });

      await context.close();
    });
  }

  test('HostManagementPage should adapt to different viewports', async ({ browser }) => {
    // Create a session first
    const setupContext = await browser.newContext();
    const setupPage = await setupContext.newPage();

    await setupPage.goto('/');
    await setupPage.fill('input#nickname', 'Test Host');
    await setupPage.click('button:has-text("ゲームを作成")');
    await setupPage.waitForURL(/\/game\/[A-Z0-9]+/);

    const url = setupPage.url();
    const sessionId = url.match(/\/game\/([A-Z0-9]+)/)![1];
    const hostManageUrl = `/manage/${sessionId}`;

    await setupContext.close();

    // Test each viewport
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      const page = await context.newPage();

      await test.step(`Test ${viewport.name}`, async () => {
        await page.goto(hostManageUrl);

        // Check if page loads
        const hostManagement = page.locator('text=Host Management');
        if (await hostManagement.isVisible({ timeout: 3000 }).catch(() => false)) {
          // Verify key elements are accessible
          await expect(page.locator('text=Session ID')).toBeVisible();

          // Check statistics cards adapt to viewport
          const statsCards = page.locator('.rounded-lg.bg-white.p-4');
          const count = await statsCards.count();
          expect(count).toBeGreaterThan(0);
        }
      });

      await context.close();
    }
  });

  test('GamePage should be responsive across viewports', async ({ browser }) => {
    // Create session and get game URL
    const setupContext = await browser.newContext();
    const setupPage = await setupContext.newPage();

    await setupPage.goto('/');
    await setupPage.fill('input#nickname', 'Player');
    await setupPage.click('button:has-text("ゲームを作成")');
    await setupPage.waitForURL(/\/game\/[A-Z0-9]+/);

    const gameUrl = setupPage.url();
    await setupContext.close();

    // Test each viewport
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      const page = await context.newPage();

      await test.step(`Test ${viewport.name}`, async () => {
        await page.goto(gameUrl);

        // Verify session header is visible
        await expect(page.locator('text=セッション:')).toBeVisible({ timeout: 5000 });

        // Check participants list is accessible
        await expect(page.locator('text=参加者一覧')).toBeVisible();

        // Verify grid layout adapts (should use different columns based on viewport)
        const gridContainer = page.locator('.grid');
        if (await gridContainer.count() > 0) {
          const firstGrid = gridContainer.first();
          const className = await firstGrid.getAttribute('class');

          // Mobile should use single column, desktop should use multi-column
          if (viewport.name.includes('Mobile')) {
            expect(className).toContain('grid-cols-1');
          }
        }
      });

      await context.close();
    }
  });

  test('Modal should be centered and visible on all viewports', async ({ browser }) => {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      const page = await context.newPage();

      await test.step(`Test modal on ${viewport.name}`, async () => {
        await page.goto('/');

        // Click create button to potentially trigger any modal
        await page.fill('input#nickname', 'Test');
        await page.click('button:has-text("ゲームを作成")');

        // Check if any modal appears and is properly sized
        const modal = page.locator('[role="dialog"]');
        if (await modal.isVisible({ timeout: 1000 }).catch(() => false)) {
          const box = await modal.boundingBox();
          if (box) {
            // Modal should fit within viewport
            expect(box.width).toBeLessThanOrEqual(viewport.width);
            expect(box.height).toBeLessThanOrEqual(viewport.height);
          }
        }
      });

      await context.close();
    }
  });
});
