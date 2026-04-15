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

	// ─── Extract: structured video list ─────────────────────────────────

	test("extract structured video list from search results", async ({ page }) => {
		await page.goto("https://www.youtube.com/results?search_query=TypeScript+tutorial+2025")
		await page.waitForLoadState("networkidle")

		// Extract structured data from the results page.
		// The schema tells the LLM exactly what fields to return.
		const videos = await ai(
			"extract every video result on this page",
			{
				page,
				type: "extract",
				schema: {
					videos: [{
						title: "string — exact video title as shown on the page",
						url: "string — full YouTube watch URL (https://www.youtube.com/watch?v=...)",
						channel: "string — channel / uploader name",
						views: "string — view count in human format (e.g. 1.2M, 340K)",
						posted: "string — when it was posted (e.g. 3 days ago, 2 months ago)",
					}],
				},
			},
		) as { videos: Array<{ title: string; url: string; channel: string; views: string; posted: string }> }

		expect(videos.videos.length).toBeGreaterThan(0)
		const first = videos.videos[0]
		expect(typeof first.title).toBe("string")
		expect(first.title.length).toBeGreaterThan(0)
		expect(first.url).toContain("youtube.com/watch")
		expect(first.channel.length).toBeGreaterThan(0)

		console.log(`\n✅ Found ${videos.videos.length} videos`)
		for (const v of videos.videos.slice(0, 3)) {
			console.log(`  📹 ${v.title}`)
			console.log(`     Channel: ${v.channel} | ${v.views} | ${v.posted}`)
			console.log(`     URL: ${v.url}`)
		}
	})

	// ─── Extract: video list → iterate → extract comments ───────────────

	test("extract video list, then extract comments from each video", async ({ page }) => {
		await page.goto("https://www.youtube.com/results?search_query=Python+for+beginners")
		await page.waitForLoadState("networkidle")

		// Step 1: extract the top 5 video results
		const searchResults = await ai(
			"extract the first 5 video results: title, watch URL, channel, and view count",
			{
				page,
				type: "extract",
				schema: {
					videos: [{
						title: "string",
						url: "string (full watch URL)",
						channel: "string",
						views: "string",
					}],
				},
			},
		) as { videos: Array<{ title: string; url: string; channel: string; views: string }> }

		expect(searchResults.videos.length).toBeGreaterThan(0)
		console.log(`\n✅ Found ${searchResults.videos.length} videos`)

		// Step 2: iterate over each video and extract comments (limit to first 2)
		for (const video of searchResults.videos.slice(0, 2)) {
			await page.goto(video.url)
			await page.waitForLoadState("networkidle")

			await ai("scroll down to the comments section", { page })

			const comments = await ai(
				"extract the top 5 comments: username, comment text, and like count",
				{
					page,
					type: "extract",
					schema: {
						comments: [{
							username: "string — display name of the commenter",
							text: "string — the comment text",
							likes: "string — like count as shown (e.g. 42, 1.2K)",
						}],
					},
				},
			) as { comments: Array<{ username: string; text: string; likes: string }> }

			console.log(`\n📹 ${video.title}`)
			console.log(`   Channel: ${video.channel} | ${video.views}`)
			console.log(`   💬 ${comments.comments.length} comments extracted:`)
			for (const c of comments.comments.slice(0, 3)) {
				const preview = c.text.length > 80 ? c.text.slice(0, 80) + "…" : c.text
				console.log(`      @${c.username}: ${preview}`)
				console.log(`      ❤️  ${c.likes} likes`)
			}
		}
	})
});
