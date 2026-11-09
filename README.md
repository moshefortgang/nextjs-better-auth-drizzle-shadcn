# Next.js 16 + Better Auth + Drizzle + Shadcn/UI + Jest

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
   NEXT_PUBLIC_BASE_URL=http://localhost:3000

   AUTH_GOOGLE_ID=your_google_client_id
   AUTH_GOOGLE_SECRET=your_google_client_secret
   
4. Apply migrations (if applicable):  
   ```bash
   npx drizzle-kit push

5. Run the app:  
   ```bash
   pnpm dev

## Running Tests:
This project uses Jest for unit testing.

To run tests, use the following command:
```bash
pnpm test
