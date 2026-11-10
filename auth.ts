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

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  emailAndPassword: { enabled: true },
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
