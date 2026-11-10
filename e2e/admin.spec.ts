import { expect, test, type Page } from "@playwright/test";
import { makeAdmin, signUpViaApi, uniqueEmail } from "./helpers";

async function openActions(page: Page, email: string) {
  await page.getByRole("button", { name: `Actions for ${email}` }).click();
  // A menu that is still animating closed stays in the DOM; only target the open one.
  return page.locator('[role="menu"][data-state="open"]');
}

test("non-admins cannot open user management", async ({ page }) => {
  await signUpViaApi(page.request, uniqueEmail("regular"));

  await page.goto("/users");
  await expect(page.getByRole("heading", { name: "Admins only" })).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
});

test.describe("as an admin", () => {
  let target: string;

  test.beforeEach(async ({ page, request }) => {
    target = uniqueEmail("target");
    await signUpViaApi(request, target, "Target User");

    const adminEmail = uniqueEmail("admin");
    // Signing up through page.request also signs the page in. Sessions read the role from
    // the database on every request, so the promotion applies without signing in again.
    await signUpViaApi(page.request, adminEmail, "Admin User");
    await makeAdmin(adminEmail);

    await page.goto("/users");
    await page.getByLabel("Search users by email").fill(target);
    await expect(page.getByRole("row")).toHaveCount(2); // header + target
  });

  test("bans and unbans a user", async ({ page }) => {
    const row = page.getByRole("row").filter({ hasText: target });

    page.once("dialog", (dialog) => dialog.accept("Spamming"));
    await (await openActions(page, target)).getByRole("menuitem", { name: "Ban" }).click();
    await expect(row.getByText("Banned")).toBeVisible();

    await (await openActions(page, target)).getByRole("menuitem", { name: "Unban" }).click();
    await expect(row.getByText("Active")).toBeVisible();
  });

  test("promotes a user to admin", async ({ page }) => {
    const row = page.getByRole("row").filter({ hasText: target });

    await (await openActions(page, target)).getByRole("menuitem", { name: "Make admin" }).click();
    await expect(row.getByText("admin", { exact: true })).toBeVisible();
  });

  test("impersonates a user and returns", async ({ page }) => {
    await (await openActions(page, target)).getByRole("menuitem", { name: "Impersonate" }).click();

    const banner = page.getByRole("status").filter({ hasText: "You are impersonating" });
    await expect(banner).toContainText(target);

    await banner.getByRole("button", { name: "Stop impersonating" }).click();
    await expect(page).toHaveURL(/\/users/);
    await expect(banner).toHaveCount(0);
  });
});
