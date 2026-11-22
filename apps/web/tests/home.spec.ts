import { expect, test } from "@playwright/test";
import { config } from "@repo/config";

test.describe("home page", () => {
	if (config.ui.marketing.enabled) {
		test("the mobile menu fits a narrow phone and opens the attribution section", async ({
			page,
		}) => {
			await page.setViewportSize({ width: 320, height: 800 });
			await page.goto("/");
			const pageWidth = await page.evaluate(
				() => document.documentElement.scrollWidth,
			);
			expect(pageWidth).toBeLessThanOrEqual(320);
			await page.getByRole("button", { name: "Open navigation" }).click();
			await page
				.getByRole("dialog")
				.getByRole("link", { name: "Attribution" })
				.click();
			await expect(page).toHaveURL(/\/#features$/);
			await expect(page.getByRole("dialog")).toBeHidden();
		});

		test("the report inputs can be paused and respect reduced motion", async ({
			page,
		}) => {
			await page.emulateMedia({ reducedMotion: "no-preference" });
			await page.goto("/");
			const strip = page.getByRole("region", {
				name: "Report sources and file formats",
			});
			const track = strip.locator('[data-test="report-sources-track"]');
			await strip
				.getByRole("button", { name: "Pause scrolling" })
				.click();
			await expect(track).toHaveCSS("animation-play-state", "paused");
			await strip
				.getByRole("button", { name: "Resume scrolling" })
				.press("Enter");
			await expect(track).toHaveCSS("animation-play-state", "running");
			await page.emulateMedia({ reducedMotion: "reduce" });
			await expect(track).toHaveCSS("animation-name", "none");
			await expect(strip.getByRole("listitem")).toHaveCount(5);
		});

		test("should load", async ({ page }) => {
			await page.goto("/");

			await expect(
				page.getByRole("heading", {
					level: 1,
					name: "See the profit behind every campaign.",
				}),
			).toBeVisible();
			await page.getByRole("button", { name: "Campaign costs" }).click();
			await expect(
				page.getByRole("columnheader", { name: "Refunds" }),
			).toBeVisible();
			await page
				.getByRole("link", { name: "View demo store", exact: true })
				.click();
			await expect(
				page.getByRole("heading", {
					name: "Campaign report",
					exact: true,
				}),
			).toBeVisible();
			await expect(
				page.getByRole("rowheader", { name: /Prospecting/ }),
			).toBeVisible();
		});
	} else {
		test("should be redirected to app", async ({ page }) => {
			await page.goto("/");

			await expect(page).toHaveURL(/\.*\/auth\/login/);
		});
	}
});
