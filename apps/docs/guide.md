# Guide

## Setup

1. Clone the repo and install: `pnpm install`
2. Copy `.env.example` to `.env` and set `NEXTAUTH_SECRET`, `DATABASE_URL`, etc.
3. Start PostgreSQL + Mailpit: `docker compose up -d`
4. Push schema: `pnpm db:push`
5. Run dev: `pnpm dev` (web on port 3000)

## Apps

- **apps/web** — Next.js 15 app (auth, dashboard, Stripe opt-in)
- **apps/docs** — This VitePress site

## Packages

- **@repo/database** — Prisma schema and client
- **@repo/email** — Nodemailer + React Email templates
- **@repo/payments** — Stripe (opt-in)
- **@repo/eslint-config** — Shared ESLint
- **@repo/typescript-config** — Shared TypeScript config
