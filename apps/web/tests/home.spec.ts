import { expect, test } from "@playwright/test";
import { config } from "@repo/config";

test.describe("home page", () => {
	if (config.ui.marketing.enabled) {
		test("should load", async ({ page }) => {
			await page.goto("/");

			await expect(
				page.getByRole("heading", {
					level: 1,
					name: "See which ads bring your store a profit",
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
