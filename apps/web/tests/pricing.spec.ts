import { expect, test } from "@playwright/test";
import { config } from "@repo/config";

test.skip(!config.ui.marketing.enabled, "The marketing page is disabled.");

test("the plan action stays highlighted when the pointer moves onto it", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/#pricing");
	const pricing = page.locator("#pricing");
	const heading = pricing.getByRole("heading", { name: "Pro", exact: true });
	const signup = pricing.getByRole("link", { name: "Sign up (Pro)" });
	const background = () =>
		signup.evaluate((link) => getComputedStyle(link).backgroundColor);

	await pricing.getByRole("radio", { name: "Monthly" }).hover();
	const idle = await background();
	await heading.hover();
	await expect.poll(background).not.toBe(idle);
	const highlighted = await background();
	await signup.hover();
	await expect(signup).toHaveCSS("background-color", highlighted);
	await pricing.getByRole("radio", { name: "Monthly" }).hover();
	await expect(signup).toHaveCSS("background-color", idle);
});

test("visitors can compare billing periods and open the selected plan action", async ({
	page,
}) => {
	await page.goto("/#pricing");

	const pricing = page.locator("#pricing");
	const periods = pricing.getByRole("group", { name: "Billing period" });
	const monthly = periods.getByRole("radio", { name: "Monthly" });
	const yearly = periods.getByRole("radio", { name: "Yearly" });
	const pro = pricing.locator('[data-test="price-table-plan"]').filter({
		has: page.getByRole("heading", { name: "Pro", exact: true }),
	});
	const price = pro.locator('[data-test="price-table-plan-price"]');

	await expect(monthly).toBeChecked();
	await expect(price).toContainText("$29.00");
	await yearly.check();
	await expect(yearly).toBeChecked();
	await expect(price).toContainText("$290.00");

	await yearly.press("ArrowLeft");
	await expect(monthly).toBeChecked();
	await expect(price).toContainText("$29.00");
	await expect(
		pricing.getByRole("link", { name: "Contact sales" }),
	).toHaveAttribute("href", /\/contact$/);
	const signup = pro.getByRole("link");
	await signup.focus();
	await signup.press("Enter");
	await expect(page).toHaveURL(/\/auth\/signup(?:[?#].*)?$/);
	await expect(
		page.getByRole("heading", { name: "Create an account" }),
	).toBeVisible();
});
