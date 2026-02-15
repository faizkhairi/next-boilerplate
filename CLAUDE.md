# next-boilerplate — AI Development Guide

## Project Overview

Production-ready Next.js 15 boilerplate with **zero external account dependencies**. Self-contained monorepo for building SaaS applications without relying on third-party services like Clerk, Resend, PostHog, or Sentry.

**Philosophy:** Simple, fast to start, fully self-contained development environment.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Next.js 15 (App Router) | Latest React patterns, server components, streaming SSR |
| **Language** | TypeScript 5.7.3 | Type safety, better DX, fewer runtime errors |
| **Auth** | NextAuth.js 4.24 | Open source, supports credentials + OAuth, JWT sessions |
| **Database** | Prisma 6.19 + PostgreSQL 16 | Type-safe ORM, excellent DX, Docker for local dev |
| **Email** | Nodemailer + React Email | SMTP-agnostic, works with any provider, preview in Mailpit |
| **UI** | Shadcn + Tailwind CSS | Copy-paste components, highly customizable, no runtime overhead |
| **Forms** | React Hook Form + Zod | Performant, type-safe validation, great UX |
| **Monorepo** | Turborepo + pnpm | Fast builds, shared packages, efficient caching |

---

## Architecture

### Monorepo Structure

```
next-boilerplate/
├── apps/
│   └── web/                      # Next.js 15 application
│       ├── app/
│       │   ├── (auth)/           # Auth routes (login, register, etc.)
│       │   ├── api/              # API routes
│       │   │   └── auth/[...nextauth]/  # NextAuth.js handler
│       │   ├── dashboard/        # Protected routes
│       │   ├── layout.tsx        # Root layout
│       │   ├── page.tsx          # Landing page
│       │   └── globals.css       # Tailwind + CSS variables
│       ├── components/
│       │   └── ui/               # Shadcn components
│       ├── lib/
│       │   ├── auth.ts           # NextAuth.js config
│       │   ├── auth-utils.ts     # Auth helpers (register, verify, reset)
│       │   ├── db.ts             # Prisma client export
│       │   ├── validations.ts    # Zod schemas
│       │   └── utils.ts          # Utility functions (cn, etc.)
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── package.json
│
├── packages/
│   ├── database/                 # Prisma ORM
│   │   ├── prisma/
│   │   │   └── schema.prisma     # Database models
│   │   ├── src/
│   │   │   └── client.ts         # Singleton Prisma client
│   │   └── package.json
│   │
│   ├── email/                    # Email templates + mailer
│   │   ├── src/
│   │   │   ├── mailer.ts         # Nodemailer SMTP client
│   │   │   ├── index.ts          # Helper functions
│   │   │   └── templates/        # React Email components
│   │   │       ├── welcome.tsx
│   │   │       ├── verify-email.tsx
│   │   │       └── reset-password.tsx
│   │   └── package.json
│   │
│   └── typescript-config/        # Shared TypeScript configs
│       ├── base.json
│       └── nextjs.json
│
├── docker-compose.yml            # PostgreSQL + Mailpit
├── turbo.json                    # Turborepo pipeline
├── .env.example                  # Environment variables template
└── pnpm-workspace.yaml           # Workspace config
```

---

## Key Conventions

### 1. Route Groups (App Router)

```typescript
app/
├── (auth)/          // Shared layout for auth pages (centered card)
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   ├── reset-password/
│   └── verify/
└── dashboard/       // Protected routes (requires authentication)
    ├── layout.tsx   // Server-side session check
    └── page.tsx
```

**Pattern:** Use route groups `(name)` for shared layouts without affecting URL structure.

### 2. Server vs. Client Components

| Type | When to Use | Example |
|------|-------------|---------|
| **Server Component** (default) | Data fetching, accessing secrets, SEO | `app/dashboard/page.tsx` |
| **Client Component** (`"use client"`) | Forms, hooks (useState, useEffect), event handlers | Auth pages, interactive UI |

**Rule:** Default to server components. Only add `"use client"` when needed.

### 3. Authentication Patterns

**Protected Routes:**
```typescript
// app/dashboard/layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");
  return <>{children}</>;
}
```

**Client-Side Auth:**
```typescript
"use client";
import { signIn, signOut } from "next-auth/react";

// Login
await signIn("credentials", { email, password, redirect: false });

// Logout
await signOut({ callbackUrl: "/" });
```

### 4. Database Patterns

**Prisma Client Import:**
```typescript
import { prisma } from "@repo/database/client";

// Always use in server components or API routes
const user = await prisma.user.findUnique({ where: { email } });
```

**Schema Conventions:**
- Use `@map("table_name")` for snake_case table names
- Use `cuid()` for primary keys
- Add `createdAt` and `updatedAt` to all models
- Foreign keys with `onDelete: Cascade` for referential integrity

### 5. Email Sending

**Development:**
```typescript
// Emails are caught by Mailpit (localhost:8025)
import { sendVerificationEmail } from "@repo/email";

await sendVerificationEmail(email, verifyUrl);
```

**Production:** Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in `.env` for your SMTP provider (Gmail, Mailgun, SendGrid, etc.). No SaaS signup required for the boilerplate.

### 6. Form Validation

**Pattern:**
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";

const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
});

const onSubmit = async (data: LoginInput) => {
  // Handle form submission
};
```

**Zod Schema Example:**
```typescript
// lib/validations.ts
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

---

## Development Workflow

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment variables
cp .env.example .env

# 3. Generate NEXTAUTH_SECRET
openssl rand -base64 32
# Paste into .env

# 4. Start Docker services
docker compose up -d

# 5. Generate Prisma client
cd packages/database && pnpm db:generate

# 6. Push database schema
cd ../.. && pnpm --filter @repo/database db:push

# 7. Start dev server
pnpm dev
```

### Database Commands

```bash
# Push schema changes (development)
pnpm --filter @repo/database db:push

# Create migration (production)
pnpm --filter @repo/database db:migrate

# Open Prisma Studio
pnpm --filter @repo/database db:studio

# Reset database (⚠️ deletes all data)
pnpm --filter @repo/database db:reset
```

### Email Testing

1. Start Mailpit: `docker compose up -d`
2. Send test email (register new user)
3. View at http://localhost:8025

### Building

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Run in production mode with Docker
docker compose -f docker-compose.prod.yml up
```

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/next_boilerplate` |
| `NEXTAUTH_URL` | App URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth.js secret (32+ chars) | Generate with `openssl rand -base64 32` |

### SMTP (Email)

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server host | `localhost` (Mailpit) |
| `SMTP_PORT` | SMTP server port | `1025` |
| `SMTP_USER` | SMTP username | (empty for Mailpit) |
| `SMTP_PASS` | SMTP password | (empty for Mailpit) |
| `SMTP_FROM` | Sender email address | `noreply@example.com` |

### Optional OAuth

**GitHub:**
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `NEXT_PUBLIC_GITHUB_ENABLED="true"`

**Google:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_GOOGLE_ENABLED="true"`

### Optional Stripe

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

## Common Tasks

### Adding a New Page

1. Create file in `apps/web/app/your-page/page.tsx`
2. Server component by default (no `"use client"`)
3. Use `getServerSession(authOptions)` for auth-gated pages

### Adding a New API Route

1. Create file in `apps/web/app/api/your-route/route.ts`
2. Export `GET`, `POST`, `PUT`, `DELETE` handlers
3. Use `NextRequest` and `NextResponse`

**Example:**
```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Handle request
  return NextResponse.json({ success: true });
}
```

### Adding a New Prisma Model

1. Edit `packages/database/prisma/schema.prisma`
2. Run `pnpm --filter @repo/database db:push` (dev) or `db:migrate` (prod)
3. Regenerate client: `pnpm --filter @repo/database db:generate`

### Adding a Shadcn Component

```bash
cd apps/web
npx shadcn@latest add <component-name>
# Example: npx shadcn@latest add dialog
```

### Adding a New Email Template

1. Create React Email component in `packages/email/src/templates/`
2. Add helper function in `packages/email/src/index.ts`
3. Use `render()` to convert to HTML

---

## Troubleshooting

### Prisma Client Not Found

```bash
cd packages/database
pnpm db:generate
```

### Database Connection Error

```bash
# Check Docker is running
docker ps

# Restart PostgreSQL
docker compose restart postgres
```

### NextAuth Session Issues

- Check `NEXTAUTH_SECRET` is set in `.env`
- Check `NEXTAUTH_URL` matches your app URL
- Clear cookies and try again

### Email Not Sending

- Check Mailpit is running: `docker ps | grep mailpit`
- View Mailpit UI: http://localhost:8025
- Check SMTP_* env vars

---

## Deployment

### Netlify (Recommended)

1. Connect GitHub repo to Netlify
2. Add environment variables in Netlify dashboard
3. Build command: `pnpm build`
4. Publish directory: `apps/web/.next`
5. Use Docker PostgreSQL or a managed PostgreSQL (Neon, Supabase, etc.) if preferred

### Self-Hosted (VPS)

1. Clone repo on server
2. Copy `.env` and fill in production values
3. Run `docker compose up -d` for PostgreSQL
4. Run `pnpm build && pnpm start`
5. Use PM2 or systemd for process management

---

## Testing

**Unit Tests:** Vitest with React Testing Library
```bash
pnpm --filter @repo/web test
```

**E2E Tests:** Playwright
```bash
pnpm --filter @repo/web test:e2e
```

---

## Pre-Push Build Verification

**Always run the production build locally before pushing to CI:**
```bash
pnpm build
```

This catches issues that dev mode silently ignores:
- **Pino logger signatures**: Must be `logger.info(obj, msg)` not `logger.info(msg, obj)`
- **React Server Components**: Pages without `"use client"` cannot use `onClick`, `useState`, etc.
- **`useSearchParams()`**: Must be wrapped in `<Suspense>` for static pre-rendering
- **Type errors**: `tsc --noEmit` runs during `next build` but not during `next dev`

---

## Next.js 15 Patterns (Important)

### Server vs Client Components
- **Default** is Server Component — no `useState`, `useEffect`, `onClick` allowed
- Add `"use client"` only when needed for interactivity
- The `error.tsx` and `not-found.tsx` files need `"use client"` if they use event handlers

### useSearchParams Requires Suspense
Pages using `useSearchParams()` must wrap the consuming component in `<Suspense>`:
```tsx
export default function MyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MyContent />  {/* useSearchParams() lives here */}
    </Suspense>
  );
}
```
This is required because Next.js 15 pre-renders pages statically, and search params are only available client-side.

---

## Security Best Practices

1. **Never commit `.env`** — use `.env.example` as template
2. **Rotate `NEXTAUTH_SECRET`** regularly in production
3. **Use HTTPS** in production (`NEXTAUTH_URL` should be `https://`)
4. **Validate all inputs** with Zod schemas
5. **Hash passwords** with bcrypt (10 salt rounds)
6. **Email verification required** before login (enforced in credentials provider)
7. **Rate limit API routes** (add middleware as needed)

---

## Performance

- **Server Components** render on server → smaller JS bundles
- **Streaming SSR** with Suspense for faster Time to First Byte
- **Prisma connection pooling** → efficient database access
- **Turborepo caching** → faster builds
- **Image optimization** with Next.js `<Image>` component

---

## Extending the Boilerplate

### Adding Stripe Payments

1. Uncomment Stripe env vars in `.env`
2. Create `packages/payments/` (optional)
3. Add webhook handler at `app/api/stripe/webhook/route.ts`
4. Update Subscription model in Prisma schema

### Adding Multi-Tenancy

1. Add `tenantId` to User model
2. Create Tenant model with relations
3. Add `tenantId` filter to all Prisma queries
4. Implement tenant selection in middleware

### Adding Tests

Vitest and Playwright are already installed. Add test files:
- Unit tests: `apps/web/__tests__/` or co-located `*.test.ts` files
- E2E tests: `apps/web/e2e/` Playwright specs
- Run: `pnpm --filter @repo/web test` (unit) or `pnpm --filter @repo/web test:e2e` (E2E)

---

## Maintenance

### Updating Dependencies

```bash
# Check outdated packages
pnpm outdated

# Update all to latest
pnpm update --latest

# Update specific package
pnpm update next@latest
```

### Database Migrations

**Development:**
```bash
pnpm --filter @repo/database db:push
```

**Production:**
```bash
pnpm --filter @repo/database db:migrate
```

---

## Support

- **GitHub Issues:** [Report bugs or request features](https://github.com/faizkhairi/next-boilerplate/issues)
- **Discussions:** [Ask questions](https://github.com/faizkhairi/next-boilerplate/discussions)
- **Pull Requests:** Contributions welcome!

---

**Last Updated:** 2026-02-15
