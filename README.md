# Next.js 16 + Better Auth + Drizzle + Shadcn/UI + Jest

[![CI](https://github.com/moshefortgang/next15-nextauth5-drizzle-shadcn/actions/workflows/ci.yml/badge.svg)](https://github.com/moshefortgang/next15-nextauth5-drizzle-shadcn/actions/workflows/ci.yml)

A modern stack for building full-stack web applications with:  
- **[Next.js](https://nextjs.org/)** for performance and scalability.
- **[React](https://react.dev/)** for a powerful and flexible UI framework.
- **[Better Auth](https://www.better-auth.com/)** for authentication.
- **[PostgreSQL](https://www.postgresql.org/)** for reliable and scalable database solutions.
- **[Drizzle ORM](https://orm.drizzle.team/)** for type-safe database management.
- **[Shadcn/UI](https://ui.shadcn.com/)** for beautiful, customizable components.
- **[Jest](https://jestjs.io/)** A testing framework for ensuring your app works as expected.

## Getting Started

1. Clone the repository:  
   ```bash
   git clone https://github.com/moshefortgang/nextjs-better-auth-drizzle-shadcn/
   cd nextjs-better-auth-drizzle-shadcn
   ```

2. Install dependencies using pnpm:
   ```bash
   # Install pnpm if you haven't already
   npm install -g pnpm

   # Install project dependencies
   pnpm install
   ```

3. Copy the `.env.example` file and rename it to `.env`:  
   ```bash
   cp .env.example .env
   ```

3. Configure the `.env` file with your values:  
   Open the `.env` file and fill in the following variables:
   ```env
   # Create a Postgres database on Vercel: https://vercel.com/postgres
   POSTGRES_URL=your_postgresql_database_url

   # Generate one here: https://generate-secret.vercel.app/32 (only required for localhost)
   BETTER_AUTH_SECRET=your_secret_key

   BETTER_AUTH_URL=http://localhost:3000

   AUTH_GOOGLE_ID=your_google_client_id
   AUTH_GOOGLE_SECRET=your_google_client_secret

   # Comma-separated user IDs that always have admin access
   ADMIN_USER_IDS=
   ```

4. Apply migrations (if applicable):  
   ```bash
   npx drizzle-kit push
   ```

5. Run the app:  
   ```bash
   pnpm dev
   ```

## Admin: User Management

The `/users` page (admins only) is built on the Better Auth [admin plugin](https://www.better-auth.com/docs/plugins/admin):

- Search users by email with server-side pagination
- Promote / demote admins
- Ban and unban users (with a reason)
- Impersonate a user, with a banner to return to your own account
- Revoke all of a user's sessions, or delete the user

Authorization is checked on the server for every request, not only in the proxy.

**Make yourself the first admin.** Sign up, then either add your user ID to `.env`:
```env
ADMIN_USER_IDS=your-user-id
```
or set the role directly in the database:
```sql
UPDATE "user" SET role = 'admin' WHERE email = 'you@example.com';
```

## Testing

| Command | What it runs |
| --- | --- |
| `pnpm test` | Jest + React Testing Library unit tests |
| `pnpm test:e2e` | Playwright end-to-end tests in a real browser |
| `pnpm lint` / `pnpm typecheck` | ESLint and TypeScript |

The E2E suite covers sign-up, sign-in, sign-out, wrong passwords, route protection and the admin flows (ban, promote, impersonate). It needs a **dedicated, disposable** database because it creates users and promotes them to admin:

```bash
docker run -d --rm --name e2e-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=app_test -p 54399:5432 postgres:17-alpine
export POSTGRES_URL=postgres://postgres:postgres@localhost:54399/app_test
pnpm db:migrate
pnpm exec playwright install chromium
pnpm test:e2e
```

The tests build the app and serve it on port 3100, so they can run while `pnpm dev` is running. Port 3100 must be free; an existing server there is never reused. The run refuses to start unless `POSTGRES_URL` is set explicitly and names a database ending in `_test`, so it can't accidentally use the database from your `.env` or one exported in your shell.

## Continuous Integration

[GitHub Actions](.github/workflows/ci.yml) runs on every push to `master` and on every pull request:

1. **Quality**: lint, typecheck and unit tests
2. **E2E**: starts a Postgres service, applies the migrations, builds the app and runs Playwright. When it fails, the HTML report is uploaded as an artifact.
