/**
 * YouTube Search — sample test suite for playwright-ai-step
 *
 * Validates: search, filter by type, validate video metadata.
 * Uses PAS_OLLAMA_API_KEY (or PAS_MINIMAX_API_KEY / PAS_OPENAI_API_KEY).
 */

import { expect, test } from "@playwright/test";
import { ai } from "../src/fixtures";

test.describe("YouTube Search", () => {
	test("search for a video and validate results appear", async ({ page }) => {
		// Navigate directly to search results for reliability
		await page.goto(
			"https://www.youtube.com/results?search_query=typescript+tutorial",
		);

		await page.waitForLoadState("networkidle");

		const resultsVisible = await ai(
			"assert that video results are visible on the page",
			{ page, type: "assert" },
		);
		expect(resultsVisible).toBe(true);
	});

	test("filter results by video type", async ({ page }) => {
		await page.goto(
			"https://www.youtube.com/results?search_query=golang+tutorial",
		);

		await page.waitForLoadState("networkidle");

		await ai('click the "Videos" filter tab', { page });

		await page.waitForLoadState("networkidle");

		const videoFilterActive = await ai(
			'assert the "Videos" filter is currently selected or highlighted',
			{ page, type: "assert" },
		);
		expect(videoFilterActive).toBe(true);
	});

	test("open a video and validate the player loads", async ({ page }) => {
		await page.goto(
			"https://www.youtube.com/results?search_query=rust+for+beginners",
		);

		await page.waitForLoadState("networkidle");

		await ai("click the first video result", { page });

		await page.waitForLoadState("networkidle");

		const playerReady = await ai(
			"assert the YouTube video player is visible and the play button is present",
			{ page, type: "assert" },
		);
		expect(playerReady).toBe(true);
	});

	test("extract and validate video title", async ({ page }) => {
		await page.goto(
			"https://www.youtube.com/results?search_query=python+pandas+tutorial",
		);

		await page.waitForLoadState("networkidle");

		await ai("click the first video result", { page });

		await page.waitForLoadState("networkidle");

		const title = await ai("query the main video title text on this page", {
			page,
			type: "query",
		});

		console.info("title is", title);
		expect(typeof title).toBe("string");
		expect((title as string).trim().length).toBeGreaterThan(0);

		const titleLower = (title as string).toLowerCase();
		expect(titleLower).not.toBe("youtube");
	});

	test("validate channel name is visible on video page", async ({ page }) => {
		await page.goto(
			"https://www.youtube.com/results?search_query=react+crash+course",
		);

		await page.waitForLoadState("networkidle");

		await ai("click the first video result", { page });
		await page.waitForLoadState("networkidle");

		const channelVisible = await ai(
			"assert the channel/uploader name is visible on the page",
			{ page, type: "assert" },
		);
		expect(channelVisible).toBe(true);
	});

	test("search and scroll to load more results", async ({ page }) => {
		await page.goto(
			"https://www.youtube.com/results?search_query=machine+learning+fundamentals",
		);

		await page.waitForLoadState("networkidle");

		const initialResults = await ai(
			"assert at least one video result is visible",
			{ page, type: "assert" },
		);
		expect(initialResults).toBe(true);

		await ai("scroll down to load more results", { page });
		await page.waitForTimeout(2000);

		const moreResults = await ai(
			"assert there are now more results than before (at least 5 visible)",
			{ page, type: "assert" },
		);
		expect(moreResults).toBe(true);
	});

	test("navigate to trending page and validate content", async ({ page }) => {
		await page.goto("https://www.youtube.com/feed/trending");

		await page.waitForLoadState("networkidle");

		const trendingVisible = await ai(
			"assert the trending video section is visible with multiple videos",
			{ page, type: "assert" },
		);
		expect(trendingVisible).toBe(true);
	});
});
