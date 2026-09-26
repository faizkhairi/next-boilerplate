# next-boilerplate

A self-contained Next.js monorepo template for building SaaS applications: no Clerk, no Resend, no PostHog, no Sentry, just NextAuth.js, Prisma and Nodemailer with local Docker services.

[![CI](https://github.com/faizkhairi/next-boilerplate/actions/workflows/ci.yml/badge.svg)](https://github.com/faizkhairi/next-boilerplate/actions/workflows/ci.yml)

## Features

- **Auth**: NextAuth.js with credentials + optional GitHub/Google OAuth, JWT sessions, email verification, password reset, route protection via `proxy.ts`
- **Database**: Prisma 7 (`@prisma/adapter-pg`) + PostgreSQL, with `User`, `Account`, `Session`, `VerificationToken` and `Subscription` models
- **Email**: React Email templates (welcome, verify, reset password) sent through Nodemailer; Mailpit catches everything locally
- **UI**: shadcn/ui components on Tailwind CSS 4, dark mode, Lucide icons
- **Payments (opt-in)**: Stripe checkout (redirect-based) and webhook handling, only active once `STRIPE_SECRET_KEY` is set
- **Security**: CSP and other security headers on every route, in-memory rate limiting on auth endpoints, an `/api/health` endpoint for uptime checks
- **Monorepo**: Turborepo + pnpm workspaces, `apps/web` (Next.js), `apps/docs` (VitePress), shared `packages/database`, `packages/email`, `packages/payments`, `packages/typescript-config`
- **CI**: lint, typecheck, unit tests with an enforced coverage floor, build on Node 22 and 24, `pnpm audit`, gitleaks secret scanning and a Playwright E2E job, all in GitHub Actions
- **Dependabot**: weekly grouped updates for npm and GitHub Actions

## Quick Start

Create a new project from this template, either:

```bash
npx degit faizkhairi/next-boilerplate my-app
```

or:

```bash
gh repo create my-app --template faizkhairi/next-boilerplate --private --clone
```

or click **Use this template** on GitHub and clone the resulting repository.

### Prerequisites

- Node.js 22.13+ (see `.nvmrc`; 24 LTS is recommended and is what CI's default build job uses)
- pnpm 12, via `corepack enable` (reads the pinned version from `package.json`) or `npm i -g pnpm@12`
- Docker Desktop, for local PostgreSQL and Mailpit

### Install and run

```bash
cd my-app

# Install dependencies (also generates the Prisma client via postinstall)
pnpm install

# Copy environment variables
cp .env.example .env

# Generate NEXTAUTH_SECRET and paste the output into .env
openssl rand -base64 32

# Start PostgreSQL + Mailpit
docker compose up -d

# Push the Prisma schema to the database
pnpm db:push

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Development emails land in Mailpit at [http://localhost:8025](http://localhost:8025).

## Environment Variables

All variables are documented with placeholders in `.env.example`.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma |
| `NEXTAUTH_URL` | Yes | Base URL of the app, used by NextAuth.js for callbacks |
| `NEXTAUTH_SECRET` | Yes | Signs NextAuth.js JWTs and cookies; generate with `openssl rand -base64 32` |
| `SMTP_HOST` | Yes | SMTP server host (Mailpit locally, any provider in production) |
| `SMTP_PORT` | Yes | SMTP server port |
| `SMTP_USER` | Optional | SMTP username (empty for Mailpit) |
| `SMTP_PASS` | Optional | SMTP password (empty for Mailpit) |
| `SMTP_FROM` | Yes | Sender address for outgoing email |
| `GITHUB_CLIENT_ID` | Optional | Enables GitHub OAuth when set with the secret below |
| `GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth app secret |
| `NEXT_PUBLIC_GITHUB_ENABLED` | Optional | Client-side flag that shows the GitHub login button |
| `GOOGLE_CLIENT_ID` | Optional | Enables Google OAuth when set with the secret below |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth app secret |
| `NEXT_PUBLIC_GOOGLE_ENABLED` | Optional | Client-side flag that shows the Google login button |
| `STRIPE_SECRET_KEY` | Optional | Enables Stripe checkout and subscription management |
| `STRIPE_WEBHOOK_SECRET` | Optional | Verifies incoming Stripe webhook signatures |
| `TRUSTED_PROXY_COUNT` | Optional | Reverse proxies in front of the app that append to `X-Forwarded-For` (default `1`); sets which entry the rate limiter trusts as the client IP |
| `PORT` | Optional | Overrides the port `next dev`/`next start` and the Playwright webServer listen on (default `3000`) |

## Scripts

Run from the repository root; each fans out to every workspace package via Turborepo.

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Run ESLint across the workspace |
| `pnpm typecheck` | Run `tsc --noEmit` across the workspace |
| `pnpm test` | Run unit tests across the workspace |
| `pnpm test:coverage` | Run unit tests with coverage |
| `pnpm db:push` | Push the Prisma schema to the database (shortcut for `pnpm --filter @repo/database db:push`) |
| `pnpm db:studio` | Open Prisma Studio (shortcut for `pnpm --filter @repo/database db:studio`) |

Two commands only exist at the package level, not as root shortcuts:

| Command | Description |
|---------|-------------|
| `pnpm --filter @repo/database db:migrate` | Create and apply a Prisma migration |
| `pnpm --filter @repo/web test:e2e` | Run the Playwright E2E suite |

## Testing

**Unit tests** run with Vitest against `apps/web/lib/**` and `apps/web/app/api/**`:

```bash
pnpm test
```

**Coverage** is enforced in CI and locally:

```bash
pnpm test:coverage
```

The thresholds live in `apps/web/vitest.config.ts` and are currently `10%` lines, `25%` functions, `10%` branches, `10%` statements, set just below the coverage measured when the thresholds were added. They are meant to only go up as more tests are added; never lower them to make CI pass.

**E2E tests** use Playwright against a running Postgres instance:

```bash
docker compose up -d
pnpm db:push
pnpm --filter @repo/web test:e2e
```

CI runs the E2E job against a production build (`pnpm build` then `pnpm start`) on Chromium only; the local Playwright config also defines Firefox and WebKit projects.

## Project Structure

```
next-boilerplate/
├── apps/
│   ├── web/                      # Next.js 16 application
│   │   ├── app/
│   │   │   ├── auth/             # /auth/*: login, register, forgot/reset password, verify
│   │   │   ├── api/              # Route handlers (auth, register, health, stripe, admin)
│   │   │   └── dashboard/        # Protected routes, incl. the Stripe subscription page
│   │   ├── components/ui/        # shadcn/ui components
│   │   ├── lib/                  # Auth config, rate limiting, validation, logging
│   │   ├── tests/e2e/            # Playwright specs
│   │   ├── next.config.ts        # Security headers + CSP
│   │   └── proxy.ts              # Route protection (Next.js 16's renamed middleware)
│   └── docs/                     # VitePress documentation site
│
├── packages/
│   ├── database/                 # Prisma schema, config and client
│   ├── email/                    # React Email templates + Nodemailer
│   ├── payments/                 # Stripe client (opt-in)
│   └── typescript-config/        # Shared tsconfig bases
│
├── docker-compose.yml            # PostgreSQL + Mailpit
├── turbo.json                    # Turborepo pipeline
└── .env.example                  # Environment variable template
```

## Security

- **Headers and CSP**: `apps/web/next.config.ts` sets a Content-Security-Policy plus `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` and (outside development) `Strict-Transport-Security` on every route. The CSP keeps `'unsafe-inline'` for `script-src`/`style-src` so pages stay statically renderable; tightening it to a per-request nonce is documented inline in `next.config.ts`.
- **Rate limiting**: `apps/web/lib/rate-limit.ts` is an in-memory, per-IP limiter applied to `/api/register`, `/api/forgot-password`, `/api/reset-password` and the credentials sign-in callback. It keys on the client IP recorded by your outermost trusted proxy (set `TRUSTED_PROXY_COUNT`), so run the app behind a proxy in production: without one, every IP header is client-controlled. It resets on restart and does not coordinate across instances; swap it for a shared store (for example Redis/Upstash) before running more than one instance.
- **Secret scanning**: the `secrets` CI job runs gitleaks on every push and pull request, and GitHub push protection is enabled on this repository.
- **Dependency audit**: the `audit` CI job runs `pnpm audit --audit-level=high`; Dependabot opens weekly grouped updates for npm and GitHub Actions.
- Report vulnerabilities as described in [SECURITY.md](SECURITY.md).

## Deployment

**Vercel**
```bash
pnpm build && vercel --prod
```
Add a managed PostgreSQL (Vercel Postgres or an external provider) and set the `.env.example` variables in the Vercel dashboard.

**Self-hosted (VPS or container)**
```bash
pnpm build
pnpm start
```
Run PostgreSQL alongside the app (`docker-compose.yml` covers local Postgres + Mailpit; run your own Postgres in production) and set environment variables via your process manager or container runtime.

Before deploying: apply pending migrations against the production database with `pnpm --filter @repo/database exec prisma migrate deploy` (there is no dedicated package.json script for this; `db:migrate` runs `prisma migrate dev`, which is for local development only), set all required environment variables, and confirm `/api/health` returns `200` after the deploy.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | ^16.3.6 |
| Language | TypeScript | ^6.0.3 |
| Auth | NextAuth.js | ^4.24.11 |
| Database | Prisma (`@prisma/adapter-pg`) + PostgreSQL | ^7.10.0 |
| Email | Nodemailer + React Email | ^10.0.10 / ^1.0.12 |
| UI | shadcn/ui + Tailwind CSS | ^4.3.3 |
| Forms | React Hook Form + Zod | ^7.89.0 / ^4.6.5 |
| Payments | Stripe (opt-in) | ^22.6.2 |
| Monorepo | Turborepo + pnpm | ^2.11.4 / 12.6.0 |
| Testing | Vitest + Playwright | ^5.0.2 / ^1.63.0 |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, the checks CI runs, and commit conventions.

## License

MIT, see [LICENSE](LICENSE).

Author: Faiz Khairi ([faizkhairi.github.io](https://faizkhairi.github.io), [@faizkhairi](https://github.com/faizkhairi))
