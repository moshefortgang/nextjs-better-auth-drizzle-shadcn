import { defineConfig, devices } from "@playwright/test";

// The suite creates users and promotes them to admin, so it must never fall back to the
// POSTGRES_URL in .env (Next.js would load it), nor run against a real database that happens
// to be exported in the shell. Require an explicit URL whose database name ends in "_test".
const dbName = (() => {
  try {
    return new URL(process.env.POSTGRES_URL ?? "").pathname.replace(/^\//, "");
  } catch {
    return "";
  }
})();
if (!dbName.endsWith("_test")) {
  throw new Error(
    "Set POSTGRES_URL to a disposable test database whose name ends in \"_test\" before running E2E tests (see README)."
  );
}

const port = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // CI builds in a separate step. Locally we build here too, because a second `next dev`
    // can't run next to yours. The build has no port baked in, so it still works for `pnpm start`.
    command: process.env.CI
      ? `pnpm start --port ${port}`
      : `pnpm build && pnpm start --port ${port}`,
    url: baseURL,
    // Never reuse a server already on this port: it may use a different database than the
    // POSTGRES_URL the tests write to (makeAdmin), or a real one.
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      BETTER_AUTH_URL: baseURL,
      E2E_DISABLE_RATE_LIMIT: "true",
    },
  },
});
