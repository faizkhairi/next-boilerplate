# next-boilerplate

Documentation for the Next.js 16 monorepo boilerplate. It runs without third-party accounts: auth, email and the database are self-hosted, and Stripe is opt-in.

## Stack

- **Next.js 16** (App Router)
- **NextAuth.js**: auth (credentials + OAuth)
- **Prisma** (`@prisma/adapter-pg`) + **PostgreSQL** (Docker)
- **Nodemailer** + **React Email** + Mailpit (dev)
- **shadcn/ui** + Tailwind CSS
- **Stripe** (opt-in)

No Clerk, Resend, PostHog, Sentry, or other external account dependencies.

## Quick links

- [Guide](./guide.md): setup and usage
