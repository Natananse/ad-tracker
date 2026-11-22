import { expect, test } from "@playwright/test";
import { config } from "@repo/config";

test.describe("home page", () => {
	if (config.ui.marketing.enabled) {
		test("the campaign illustration recalculates sales credit when the attribution model changes", async ({
			page,
		}) => {
			await page.goto("/#features");
			await page.getByRole("link", { name: "Trace each order" }).click();
			const figure = page.getByRole("figure", {
				name: "Interactive campaign comparison",
			});
			const prospecting = figure
				.getByRole("row")
				.filter({ hasText: "Prospecting" });
			const shopping = figure
				.getByRole("row")
				.filter({ hasText: "Shopping" });
			const last = figure.getByRole("radio", { name: "Last click" });
			await expect(last).toBeChecked();
			await expect(prospecting).toContainText("$800.00");
			await last.press("ArrowRight");
			await expect(
				figure.getByRole("radio", { name: "First click" }),
			).toBeChecked();
			await expect(prospecting).toContainText("0 orders");
			await expect(shopping).toContainText("$1,500.00");
			await expect(shopping).toContainText("$330.00");
			await last.check();
			await expect(shopping).toContainText("$700.00");
		});

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

		test("the sky, diagram points, and scrolling strip share the page motion control", async ({
			page,
		}) => {
			await page.emulateMedia({ reducedMotion: "no-preference" });
			await page.goto("/");
			const strip = page.getByRole("region", {
				name: "Report sources and file formats",
			});
			const track = strip.locator('[data-test="report-sources-track"]');
			const movingElements = [
				track,
				page.locator('[data-test="hero-sky"]'),
				page.locator("#report-inputs path[pathLength]").first(),
				page
					.locator("#attribution-flow [data-flow-signal]:visible")
					.first(),
			];
			await strip
				.getByRole("button", { name: "Pause page motion" })
				.click();
			for (const element of movingElements) {
				await expect(element).not.toHaveCSS("animation-name", "none");
				await expect(element).toHaveCSS(
					"animation-play-state",
					"paused",
				);
			}
			await strip
				.getByRole("button", { name: "Resume page motion" })
				.press("Enter");
			for (const element of movingElements) {
				await expect(element).toHaveCSS(
					"animation-play-state",
					"running",
				);
			}
			await page.emulateMedia({ reducedMotion: "reduce" });
			for (const element of movingElements) {
				await expect(element).toHaveCSS("animation-name", "none");
			}
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
