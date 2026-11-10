import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@/db";

// Comma-separated user IDs that are always treated as admins.
// Useful for bootstrapping the first admin before anyone has the "admin" role.
export const adminUserIds = (process.env.ADMIN_USER_IDS ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

function e2eRateLimitDisabled() {
  if (process.env.E2E_DISABLE_RATE_LIMIT !== "true") return false;
  try {
    const { hostname } = new URL(process.env.BETTER_AUTH_URL ?? "");
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  emailAndPassword: { enabled: true },
  // E2E tests create many accounts from one IP in seconds. The flag only takes effect when
  // the app is served from localhost, so setting it on a deployed environment does nothing.
  rateLimit: { enabled: e2eRateLimitDisabled() ? false : undefined },
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    },
  },
  plugins: [
    admin({
      adminUserIds,
      impersonationSessionDuration: 60 * 60, // 1 hour
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
