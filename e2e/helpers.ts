import { expect, type APIRequestContext, type Page } from "@playwright/test";
import postgres from "postgres";

export const PASSWORD = "e2e-password-123";

export function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@e2e.test`;
}

/** Create a user through the Better Auth API. Using `page.request` also signs the page in. */
export async function signUpViaApi(request: APIRequestContext, email: string, name = "E2E User") {
  const res = await request.post("/api/auth/sign-up/email", {
    data: { email, password: PASSWORD, name },
  });
  expect(res.ok(), await res.text()).toBeTruthy();
}

export async function signInViaUi(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.waitForURL("/");
}

/** Promote a user to admin directly in the database (there is no UI path for the first admin). */
export async function makeAdmin(email: string) {
  const sql = postgres(process.env.POSTGRES_URL!, { max: 1 });
  try {
    const rows = await sql`UPDATE "user" SET role = 'admin' WHERE email = ${email} RETURNING id`;
    expect(rows).toHaveLength(1);
  } finally {
    await sql.end();
  }
}
