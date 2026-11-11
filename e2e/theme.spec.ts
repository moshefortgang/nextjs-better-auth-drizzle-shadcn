import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light" });

test("switches theme from the login page and remembers it", async ({ page }) => {
  await page.goto("/login");
  const html = page.locator("html");
  await expect(html).not.toHaveClass(/\bdark\b/);

  await page.getByRole("button", { name: "Change theme" }).click();
  await expect(page.getByRole("menuitemradio", { name: "System" })).toBeChecked();
  await page.getByRole("menuitemradio", { name: "Dark" }).click();
  await expect(html).toHaveClass(/\bdark\b/);

  await page.reload();
  await expect(html).toHaveClass(/\bdark\b/);
  await page.getByRole("button", { name: "Change theme" }).click();
  await expect(page.getByRole("menuitemradio", { name: "Dark" })).toBeChecked();

  await page.getByRole("menuitemradio", { name: "Light" }).click();
  await expect(html).not.toHaveClass(/\bdark\b/);
});
