# next-boilerplate

> Production-ready Next.js 15 boilerplate with **zero external account dependencies**

A comprehensive, self-contained Next.js monorepo template for building SaaS applications. No Clerk, no Resend, no PostHog, no Sentry — just pure Next.js with best practices.

## Features

✅ **Authentication**
- NextAuth.js with credentials + OAuth (GitHub, Google)
- Email verification workflow
- Password reset flow
- JWT session strategy
- Protected routes & middleware

✅ **Database**
- Prisma ORM with PostgreSQL
- User, Account, Session, Subscription models
- Type-safe database access
- Docker Compose for local PostgreSQL

✅ **Email**
- React Email templates (welcome, verification, password reset)
- Nodemailer with SMTP
- Mailpit for local development (http://localhost:8025)
- Production-ready for any SMTP provider

✅ **UI**
- Shadcn UI components
- Tailwind CSS
- Dark mode support
- Responsive design
- Lucide icons

✅ **Payments (Optional)**
- Stripe integration (opt-in)
- Subscription management
- Webhook handling

✅ **Monorepo**
- Turborepo for fast builds
- `apps/web` (Next.js 15), `apps/docs` (VitePress)
- Shared packages: database, email, payments (Stripe opt-in), TypeScript config, ESLint config
- pnpm workspaces

**Zero external account dependencies:** This is a custom boilerplate, not next-forge. Auth is NextAuth.js (no Clerk), email is Nodemailer (no Resend), database is Prisma + Docker PostgreSQL (no Neon). No PostHog, Sentry, or BetterStack. Run `pnpm install`, `docker compose up -d`, and start coding — no SaaS signups required.

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Docker Desktop (for PostgreSQL + Mailpit)

### Installation

```bash
# Create project from template
gh repo create my-app --template faizkhairi/next-boilerplate --private --clone
cd my-app

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Generate NEXTAUTH_SECRET
openssl rand -base64 32
# Add the output to .env as NEXTAUTH_SECRET

# Start Docker services (PostgreSQL + Mailpit)
docker compose up -d

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

View development emails at [http://localhost:8025](http://localhost:8025) (Mailpit UI).

## Project Structure

```
next-boilerplate/
├── apps/
│   └── web/                      # Next.js 15 application
│       ├── app/
│       │   ├── (auth)/           # Auth routes
│       │   ├── api/              # API routes
│       │   └── dashboard/        # Protected routes
│       ├── components/           # React components
│       │   └── ui/               # Shadcn components
│       └── lib/                  # Utilities & config
│
├── packages/
│   ├── database/                 # Prisma schema + client
│   ├── email/                    # React Email templates + Nodemailer
│   └── typescript-config/        # Shared TypeScript configs
│
├── docker-compose.yml            # PostgreSQL + Mailpit
├── turbo.json                    # Turborepo config
└── .env.example                  # Environment variables template
```

## Environment Variables

See `.env.example` for all available variables. Key settings:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/next_boilerplate` |
| `NEXTAUTH_URL` | App URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth.js secret (32+ chars) | Required |
| `SMTP_HOST` | SMTP server host | `localhost` (Mailpit) |
| `SMTP_PORT` | SMTP server port | `1025` (Mailpit) |
| `SMTP_FROM` | Email sender address | `noreply@example.com` |

### Optional OAuth

Uncomment and fill in `.env` to enable:

- **GitHub OAuth**: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `NEXT_PUBLIC_GITHUB_ENABLED`
- **Google OAuth**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_GOOGLE_ENABLED`

### Optional Stripe

Uncomment and fill in `.env` to enable payments:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Development Workflow

### Running the app

```bash
# Start all services (PostgreSQL + Mailpit)
docker compose up -d

# Start Next.js dev server
pnpm dev

# Or run both database and dev server
pnpm db:push && pnpm dev
```

### Database Management

```bash
# Push schema changes to database (development)
pnpm db:push

# Create a migration (production)
pnpm db:migrate

# Open Prisma Studio (database GUI)
pnpm db:studio
```

### Email Testing

All emails sent in development are caught by Mailpit:
- **SMTP Server**: localhost:1025
- **Web UI**: http://localhost:8025

In production, set `SMTP_*` in `.env` to any SMTP provider (e.g. Gmail, Mailgun, SendGrid). No external account required for the boilerplate itself.

## Authentication Flow

1. **Registration** → `/auth/register`
   - User fills form (name, email, password)
   - Account created with `emailVerified: null`
   - Verification email sent with 24-hour token

2. **Email Verification** → `/auth/verify?token=xxx&email=xxx`
   - User clicks link from email
   - Token validated, `emailVerified` updated
   - Welcome email sent

3. **Login** → `/auth/login`
   - Email + password (or OAuth)
   - Email verification check (prevents unverified login)
   - JWT session created, redirect to `/dashboard`

4. **Password Reset** → `/auth/forgot-password` + `/auth/reset-password`
   - User requests reset (email sent with 1-hour token)
   - Clicks link, sets new password
   - Token deleted, password updated

## Deployment

### Netlify (Recommended for free tier)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --build
```

**Environment Variables**: Add all `.env` variables in Netlify dashboard.

**Database**: Use Docker PostgreSQL (same as local), or a managed PostgreSQL (e.g. Neon, Supabase) if you prefer.

### Self-Hosted (VPS)

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

**Database**: PostgreSQL on the same VPS (Docker or native install).

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 15.1.6 |
| Language | TypeScript | 5.7.3 |
| Auth | NextAuth.js | 4.24.11 |
| Database | Prisma + PostgreSQL | 6.19.2 |
| Email | Nodemailer + React Email | Latest |
| UI | Shadcn + Tailwind CSS | Latest |
| Forms | React Hook Form + Zod | Latest |
| Payments | Stripe (opt-in) | Latest |
| Monorepo | Turborepo + pnpm | Latest |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:push` | Push Prisma schema to database |
| `pnpm db:migrate` | Create database migration |
| `pnpm db:studio` | Open Prisma Studio |

## Deployment Checklist

### Pre-Deployment

- [ ] **Environment Variables**: Set all required env vars in production environment
  - `DATABASE_URL` — PostgreSQL connection string
  - `NEXTAUTH_SECRET` — Generate with `openssl rand -base64 32`
  - `NEXTAUTH_URL` — Your production URL (e.g., https://app.example.com)
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — SMTP provider credentials
  - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` — If using GitHub OAuth
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — If using Google OAuth
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — If using Stripe payments

- [ ] **Database**: Run migrations on production database
  ```bash
  pnpm db:migrate deploy
  ```

- [ ] **Build**: Verify production build succeeds
  ```bash
  pnpm build
  ```

- [ ] **Tests**: Run full test suite
  ```bash
  pnpm test
  ```

- [ ] **Security**:
  - [ ] Enable HTTPS (SSL/TLS certificate)
  - [ ] Set secure cookies (NEXTAUTH_URL must be https://)
  - [ ] Configure CORS if needed
  - [ ] Review rate limiting settings in `lib/ratelimit.ts`
  - [ ] Audit dependencies for vulnerabilities: `pnpm audit`

- [ ] **Email**: Configure production SMTP provider
  - Recommended: Resend, Mailgun, SendGrid, or Gmail SMTP
  - Update `FROM_EMAIL` in email service

- [ ] **OAuth** (if enabled):
  - [ ] Add production callback URLs to GitHub/Google OAuth apps
  - [ ] Update redirect URIs to match production domain

- [ ] **Stripe** (if enabled):
  - [ ] Switch to live API keys
  - [ ] Configure webhook endpoint in Stripe Dashboard
  - [ ] Test subscription flow end-to-end

### Post-Deployment

- [ ] **Health Check**: Verify `/api/health` endpoint returns 200
- [ ] **Smoke Tests**:
  - [ ] User registration works
  - [ ] Email verification works
  - [ ] Login works
  - [ ] Password reset works
  - [ ] OAuth login works (if enabled)
  - [ ] Protected routes require auth
  - [ ] Stripe checkout works (if enabled)

- [ ] **Monitoring**:
  - [ ] Set up uptime monitoring (e.g., UptimeRobot, Better Uptime)
  - [ ] Monitor error logs
  - [ ] Monitor database performance
  - [ ] Set up alerts for 5xx errors

- [ ] **Performance**:
  - [ ] Verify page load times < 3s
  - [ ] Check Lighthouse scores
  - [ ] Enable Next.js caching strategies
  - [ ] Configure CDN for static assets (if not using Vercel/Netlify)

### Deployment Platforms

**Vercel (Recommended)**
```bash
pnpm build && vercel --prod
```
- Auto-configures Next.js optimizations
- Add PostgreSQL via Vercel Postgres or external provider
- Add environment variables in Vercel Dashboard

**Netlify**
```bash
pnpm build && netlify deploy --prod
```
- Use @netlify/plugin-nextjs
- Add PostgreSQL via external provider (Supabase, Neon, etc.)
- Add environment variables in Netlify Dashboard

**Self-Hosted (Docker)**
```bash
docker build -t next-boilerplate .
docker run -p 3000:3000 --env-file .env.production next-boilerplate
```
- Requires PostgreSQL accessible from container
- Use docker-compose.yml for full stack deployment

## Contributing

This is a boilerplate template. Fork it and customize for your needs!

## License

MIT

## Support

- **Documentation**: See [CLAUDE.md](CLAUDE.md) for AI-assisted development guide
- **Issues**: [GitHub Issues](https://github.com/faizkhairi/next-boilerplate/issues)

---

## Author

**Faiz Khairi** — [faizkhairi.my](https://faizkhairi.my) — [@faizkhairi](https://github.com/faizkhairi)
