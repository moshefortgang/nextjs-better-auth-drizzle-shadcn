import { expect, test } from "@playwright/test";
import { PASSWORD, signInViaUi, signUpViaApi, uniqueEmail } from "./helpers";

test("redirects signed-out visitors to the login page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText("Enter your email below to login")).toBeVisible();
});

test("registers a new account and lands on the dashboard", async ({ page }) => {
  const email = uniqueEmail("register");

  await page.goto("/register");
  await page.getByLabel("Name").fill("New User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Confirm Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create Account" }).click();

  await page.waitForURL("/");
  await page.getByRole("button", { name: "Open user menu" }).click();
  await expect(page.getByText(email)).toBeVisible();
});

test("rejects a wrong password", async ({ page, request }) => {
  const email = uniqueEmail("wrong-pw");
  await signUpViaApi(request, email);

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Login", exact: true }).click();

  await expect(page.getByText(/invalid email or password/i).first()).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("signs in and signs out", async ({ page, request }) => {
  const email = uniqueEmail("login");
  await signUpViaApi(request, email);

  await signInViaUi(page, email);

  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: /log out/i }).click();
  await expect(page).toHaveURL(/\/login$/);
});
