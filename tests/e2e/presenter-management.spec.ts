// E2E Test: Presenter Management Flow
// Feature: 002-game-preparation
// Tests the complete presenter and episode registration flow

import { expect, test } from "@playwright/test";

test.describe("Presenter Management Flow", () => {
	let gameId: string;

	test.beforeEach(async ({ page }) => {
		// Navigate to home page and set nickname (prerequisite)
		await page.goto("/");
		await page.fill('input[name="nickname"]', "TestModerator");
		await page.click('button[type="submit"]');
		await page.waitForURL("/top");

		// Create a test game first
		await page.goto("/games/create");
		await page.fill('input[name="playerLimit"]', "10");
		await page.click('button[type="submit"]');
		await page.waitForURL("/top", { timeout: 3000 });

		// Extract game ID from URL or use a mock ID for testing
		// For MVP, we'll use a hardcoded ID
		gameId = "550e8400-e29b-41d4-a716-446655440003"; // Preparation game from test data
	});

	test("should display presenter management page", async ({ page }) => {
		await page.goto(`/games/${gameId}/presenters`);

		// Check page title
		await expect(page.locator("h1")).toContainText("プレゼンター管理");

		// Check form is visible
		await expect(page.locator('input[name="nickname"]')).toBeVisible();
		await expect(
			page.locator("text=プレゼンターを追加"),
		).toBeVisible();

		// Check back link
		await expect(page.locator('a[href="/top"]')).toContainText(
			"TOPページに戻る",
		);
	});

	test("should add a presenter successfully", async ({ page }) => {
		await page.goto(`/games/${gameId}/presenters`);

		// Fill in presenter nickname
		await page.fill('input[name="nickname"]', "田中太郎");

		// Submit form
		await page.click('button[type="submit"]');

		// Should show success message
		await expect(
			page.locator("text=プレゼンターを追加しました"),
		).toBeVisible();

		// Should appear in presenter list
		await expect(page.locator("text=田中太郎")).toBeVisible();
	});

	test("should show validation error for empty nickname", async ({
		page,
	}) => {
		await page.goto(`/games/${gameId}/presenters`);

		// Submit without filling nickname
		await page.click('button[type="submit"]');

		// Should show validation error
		await expect(
			page.locator("text=ニックネームを入力してください"),
		).toBeVisible();
	});

	test("should add episode to presenter", async ({ page }) => {
		await page.goto(`/games/${gameId}/presenters`);

		// First add a presenter
		await page.fill('input[name="nickname"]', "山田花子");
		await page.click(
			'form:has(input[name="nickname"]) button[type="submit"]',
		);
		await expect(
			page.locator("text=プレゼンターを追加しました"),
		).toBeVisible();

		// Click "エピソード追加" button for the presenter
		await page.click("text=エピソード追加");

		// Fill in episode form
		await page.fill('textarea[name="text"]', "私は昨日富士山に登りました。");

		// Submit episode
		await page.click(
			'form:has(textarea[name="text"]) button[type="submit"]',
		);

		// Should show success message
		await expect(
			page.locator("text=エピソードを追加しました"),
		).toBeVisible();

		// Episode should appear in the list
		await expect(
			page.locator("text=私は昨日富士山に登りました。"),
		).toBeVisible();
	});

	test("should mark episode as lie", async ({ page }) => {
		await page.goto(`/games/${gameId}/presenters`);

		// Add presenter
		await page.fill('input[name="nickname"]', "佐藤次郎");
		await page.click(
			'form:has(input[name="nickname"]) button[type="submit"]',
		);
		await page.waitForTimeout(500);

		// Select presenter for episode addition
		await page.click("text=エピソード追加");

		// Add first episode (truth)
		await page.fill('textarea[name="text"]', "私は猫を飼っています。");
		await page.click(
			'form:has(textarea[name="text"]) button[type="submit"]',
		);
		await page.waitForTimeout(500);

		// Add second episode (truth)
		await page.fill('textarea[name="text"]', "私は東京に住んでいます。");
		await page.click(
			'form:has(textarea[name="text"]) button[type="submit"]',
		);
		await page.waitForTimeout(500);

		// Add third episode (lie)
		await page.fill(
			'textarea[name="text"]',
			"私は宇宙飛行士の資格を持っています。",
		);
		await page.check('input[name="isLie"]');
		await page.click(
			'form:has(textarea[name="text"]) button[type="submit"]',
		);

		// Should show success
		await expect(
			page.locator("text=エピソードを追加しました"),
		).toBeVisible();

		// Lie episode should be marked with "ウソ" badge
		await expect(page.locator("text=ウソ")).toBeVisible();
	});

	test("should validate episode text length", async ({ page }) => {
		await page.goto(`/games/${gameId}/presenters`);

		// Add presenter
		await page.fill('input[name="nickname"]', "鈴木一郎");
		await page.click(
			'form:has(input[name="nickname"]) button[type="submit"]',
		);
		await page.waitForTimeout(500);

		await page.click("text=エピソード追加");

		// Try to add episode with text over 1000 characters
		const longText = "あ".repeat(1001);
		await page.fill('textarea[name="text"]', longText);

		// Submit button should be disabled
		await expect(
			page.locator('form:has(textarea[name="text"]) button[type="submit"]'),
		).toBeDisabled();

		// Character count should show error state
		await expect(page.locator("text=1001/1000")).toBeVisible();
	});

	test("should prevent adding more than 3 episodes", async ({ page }) => {
		await page.goto(`/games/${gameId}/presenters`);

		// Add presenter
		await page.fill('input[name="nickname"]', "高橋美咲");
		await page.click(
			'form:has(input[name="nickname"]) button[type="submit"]',
		);
		await page.waitForTimeout(500);

		await page.click("text=エピソード追加");

		// Add 3 episodes
		for (let i = 1; i <= 3; i++) {
			await page.fill('textarea[name="text"]', `エピソード${i}`);
			if (i === 3) {
				await page.check('input[name="isLie"]');
			}
			await page.click(
				'form:has(textarea[name="text"]) button[type="submit"]',
			);
			await page.waitForTimeout(500);
		}

		// Episode form should show "already has 3 episodes" message
		await expect(
			page.locator("text=既に3つのエピソードが登録されています"),
		).toBeVisible();

		// Submit button should be disabled
		await expect(
			page.locator('form:has(textarea[name="text"]) button[type="submit"]'),
		).toBeDisabled();
	});

	test("should prevent adding second lie episode", async ({ page }) => {
		await page.goto(`/games/${gameId}/presenters`);

		// Add presenter
		await page.fill('input[name="nickname"]', "中村健太");
		await page.click(
			'form:has(input[name="nickname"]) button[type="submit"]',
		);
		await page.waitForTimeout(500);

		await page.click("text=エピソード追加");

		// Add first episode as lie
		await page.fill('textarea[name="text"]', "私は火星に行ったことがあります。");
		await page.check('input[name="isLie"]');
		await page.click(
			'form:has(textarea[name="text"]) button[type="submit"]',
		);
		await page.waitForTimeout(500);

		// Lie checkbox should be disabled
		await expect(page.locator('input[name="isLie"]')).toBeDisabled();

		// Help text should indicate lie already exists
		await expect(
			page.locator("text=既にウソのエピソードが登録されています"),
		).toBeVisible();
	});

	test("should remove presenter and cascade delete episodes", async ({
		page,
	}) => {
		await page.goto(`/games/${gameId}/presenters`);

		// Add presenter with episodes
		await page.fill('input[name="nickname"]', "小林さくら");
		await page.click(
			'form:has(input[name="nickname"]) button[type="submit"]',
		);
		await page.waitForTimeout(500);

		await page.click("text=エピソード追加");
		await page.fill('textarea[name="text"]', "テストエピソード");
		await page.click(
			'form:has(textarea[name="text"]) button[type="submit"]',
		);
		await page.waitForTimeout(500);

		// Listen for confirmation dialog
		page.on("dialog", (dialog) => dialog.accept());

		// Click remove button
		await page.click("text=削除");

		// Presenter should be removed
		await expect(page.locator("text=小林さくら")).not.toBeVisible();
	});

	test("should show completion status correctly", async ({ page }) => {
		await page.goto(`/games/${gameId}/presenters`);

		// Add presenter
		await page.fill('input[name="nickname"]', "渡辺優子");
		await page.click(
			'form:has(input[name="nickname"]) button[type="submit"]',
		);
		await page.waitForTimeout(500);

		await page.click("text=エピソード追加");

		// Add 3 episodes with 1 lie
		const episodes = [
			{ text: "私は犬が好きです。", isLie: false },
			{ text: "私は料理が得意です。", isLie: false },
			{ text: "私は月に旅行したことがあります。", isLie: true },
		];

		for (const episode of episodes) {
			await page.fill('textarea[name="text"]', episode.text);
			if (episode.isLie) {
				await page.check('input[name="isLie"]');
			}
			await page.click(
				'form:has(textarea[name="text"]) button[type="submit"]',
			);
			await page.waitForTimeout(500);
		}

		// Should show "完了" status
		await expect(page.locator("text=✓ 完了")).toBeVisible();
	});

	test("should display registration summary", async ({ page }) => {
		await page.goto(`/games/${gameId}/presenters`);

		// Check summary section exists
		await expect(page.locator("text=登録状況")).toBeVisible();
		await expect(page.locator("text=登録済みプレゼンター")).toBeVisible();
		await expect(page.locator("text=/完了/")).toBeVisible();
		await expect(page.locator("text=/未完了/")).toBeVisible();

		// Check counters show "/10" for presenter limit
		await expect(page.locator("text=/\\/10/")).toBeVisible();
	});

	test("should allow adding up to 10 presenters", async ({ page }) => {
		await page.goto(`/games/${gameId}/presenters`);

		// Add 10 presenters
		for (let i = 1; i <= 10; i++) {
			await page.fill('input[name="nickname"]', `プレゼンター${i}`);
			await page.click(
				'form:has(input[name="nickname"]) button[type="submit"]',
			);
			await page.waitForTimeout(300);
		}

		// All 10 should be visible
		await expect(page.locator("text=10/10")).toBeVisible();

		// Try to add 11th presenter
		await page.fill('input[name="nickname"]', "プレゼンター11");
		await page.click(
			'form:has(input[name="nickname"]) button[type="submit"]',
		);

		// Should show validation error
		await expect(
			page.locator("text=maximum of 10 presenters"),
		).toBeVisible();
	});

	test("should handle missing session gracefully", async ({ page }) => {
		// Clear cookies to simulate missing session
		await page.context().clearCookies();

		await page.goto(`/games/${gameId}/presenters`);

		await page.fill('input[name="nickname"]', "TestPresenter");
		await page.click('button[type="submit"]');

		// Should show session error
		await expect(
			page.locator("text=セッションが見つかりません"),
		).toBeVisible();
	});
});
