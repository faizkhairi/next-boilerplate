# next-boilerplate Implementation Guide

**Status:** ✅ PRODUCTION READY - All Phases Complete

**Context:** Custom zero-dependency Next.js 15 boilerplate to replace next-forge. Mirroring nuxt-boilerplate architecture (P1).

**Completion Date:** 2026-02-15

---

## ✅ Completed (Session 1)

### Foundation
- [x] Cleared all next-forge code (79,529 deletions)
- [x] Turborepo structure (package.json, turbo.json, pnpm-workspace.yaml)
- [x] .gitignore configured
- [x] Git history preserved

### Packages
- [x] **packages/typescript-config** — base.json, nextjs.json
- [x] **packages/database** — Prisma schema (User, Account, Session, Subscription)
- [x] **packages/email** — package.json structure

### Repository
- [x] 2 commits pushed to main
- [x] Clean foundation ready for build

---

## 🔨 Implementation Checklist (Next Session)

Use nuxt-boilerplate as reference: `c:\Repo\nuxt-boilerplate`

### Phase 1: Complete Email Package (~30 min)

**Reference:** `nuxt-boilerplate/packages/email/`

**Files to create:**

1. `packages/email/src/mailer.ts`
   ```typescript
   // Nodemailer client + send function
   // Use runtimeConfig for SMTP settings
   // Auto-detect Mailpit in dev (localhost:1025)
   ```

2. `packages/email/src/templates/welcome.tsx`
   ```typescript
   // React Email component
   // Welcome email after email verification
   ```

3. `packages/email/src/templates/verify-email.tsx`
   ```typescript
   // Email verification link
   // Include token + email in URL
   ```

4. `packages/email/src/templates/reset-password.tsx`
   ```typescript
   // Password reset link
   // Include token + email in URL
   ```

**Pattern:** Mirror nuxt-boilerplate email templates but use React Email instead of Vue Email.

---

### Phase 2: Create Next.js 15 App (~45 min)

**Reference:** nuxt-boilerplate/apps/web/

**Directory structure:**
```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── verify/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── subscription/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── register/route.ts
│   │   ├── verify-email/route.ts
│   │   ├── forgot-password/route.ts
│   │   └── reset-password/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/  (Shadcn components)
├── lib/
│   ├── auth.ts       (NextAuth config)
│   ├── db.ts         (Prisma client import)
│   └── validations.ts (Zod schemas)
├── public/
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

**Steps:**

1. **Create `apps/web/package.json`:**
   ```json
   {
     "name": "@repo/web",
     "version": "0.0.0",
     "private": true,
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "next lint"
     },
     "dependencies": {
       "next": "^15.1.6",
       "react": "^19.0.0",
       "react-dom": "^19.0.0",
       "next-auth": "^4.24.11",
       "@auth/prisma-adapter": "^2.11.1",
       "@repo/database": "workspace:*",
       "@repo/email": "workspace:*",
       "bcrypt": "^5.1.1",
       "zod": "^3.24.1",
       "tailwindcss": "^3.4.0",
       "autoprefixer": "^10.4.0",
       "postcss": "^8.4.0"
     },
     "devDependencies": {
       "@types/node": "^22.0.0",
       "@types/react": "^19.0.0",
       "@types/react-dom": "^19.0.0",
       "@types/bcrypt": "^5.0.2",
       "@repo/typescript-config": "workspace:*",
       "typescript": "^5.7.3"
     }
   }
   ```

2. **Create `apps/web/next.config.ts`:**
   ```typescript
   import type { NextConfig } from 'next';

   const config: NextConfig = {
     transpilePackages: ['@repo/database', '@repo/email'],
   };

   export default config;
   ```

3. **Create `apps/web/tailwind.config.ts`:**
   ```typescript
   // Shadcn + Tailwind config
   // Include content paths for app/**/*.tsx
   ```

4. **Create `apps/web/app/layout.tsx`:**
   ```typescript
   // Root layout with SessionProvider
   // Import globals.css
   ```

5. **Create `apps/web/app/page.tsx`:**
   ```typescript
   // Landing page with auth-aware redirect
   // If authenticated → /dashboard
   // Else → show landing with links to /auth/login
   ```

---

### Phase 3: NextAuth.js Configuration (~30 min)

**Reference:** nuxt-boilerplate/apps/web/server/api/auth/

**Files:**

1. `apps/web/lib/auth.ts`
   ```typescript
   import { NextAuthOptions } from 'next-auth';
   import { PrismaAdapter } from '@auth/prisma-adapter';
   import CredentialsProvider from 'next-auth/providers/credentials';
   import GithubProvider from 'next-auth/providers/github';
   import GoogleProvider from 'next-auth/providers/google';
   import { prisma } from '@repo/database/client';
   import bcrypt from 'bcrypt';

   export const authOptions: NextAuthOptions = {
     adapter: PrismaAdapter(prisma),
     session: { strategy: 'jwt' },
     pages: {
       signIn: '/auth/login',
       signOut: '/auth/logout',
       error: '/auth/error',
       verifyRequest: '/auth/verify',
       newUser: '/dashboard',
     },
     providers: [
       CredentialsProvider({
         // Email/password login
         // bcrypt.compare for password validation
       }),
       // GitHub OAuth (optional, env-gated)
       // Google OAuth (optional, env-gated)
     ],
     callbacks: {
       jwt: ({ token, user }) => {
         // Add user.id and role to token
       },
       session: ({ session, token }) => {
         // Add id and role to session.user
       },
     },
   };
   ```

2. `apps/web/app/api/auth/[...nextauth]/route.ts`
   ```typescript
   import NextAuth from 'next-auth';
   import { authOptions } from '@/lib/auth';

   const handler = NextAuth(authOptions);

   export { handler as GET, handler as POST };
   ```

3. `apps/web/lib/auth-utils.ts`
   ```typescript
   // registerUser, verifyEmail, requestPasswordReset, resetPassword
   // Mirror nuxt-boilerplate/apps/web/server/utils/auth.ts
   // Use Prisma, bcrypt, send emails via @repo/email
   ```

---

### Phase 4: Auth Pages (~45 min)

**Reference:** nuxt-boilerplate/apps/web/pages/auth/

Create React versions of:
- `login/page.tsx` — Form with email/password, OAuth buttons
- `register/page.tsx` — Form with name, email, password, confirmPassword
- `forgot-password/page.tsx` — Email input form
- `reset-password/page.tsx` — New password form (with token from query)
- `verify/page.tsx` — Auto-verify on mount with token from query

**Pattern:**
- Use React Hook Form + Zod (like nuxt-boilerplate but for React)
- Use Shadcn components (Button, Input, Card)
- Client-side validation with Zod schemas

---

### Phase 5: API Routes (~30 min)

**Reference:** nuxt-boilerplate/apps/web/server/api/

Create Next.js API routes:

1. `apps/web/app/api/register/route.ts` — POST handler, calls registerUser()
2. `apps/web/app/api/verify-email/route.ts` — POST handler, calls verifyEmail()
3. `apps/web/app/api/forgot-password/route.ts` — POST handler, calls requestPasswordReset()
4. `apps/web/app/api/reset-password/route.ts` — POST handler, calls resetPassword()

---

### Phase 6: Shadcn UI Components (~30 min)

**Install Shadcn:**
```bash
cd apps/web
npx shadcn@latest init
npx shadcn@latest add button card input badge
```

This creates:
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/input.tsx`
- `components/ui/badge.tsx`

**Configure:**
- Update `tailwind.config.ts` with Shadcn setup
- Create `app/globals.css` with Tailwind directives + Shadcn variables

---

### Phase 7: Docker Compose (~15 min)

**Reference:** nuxt-boilerplate/docker-compose.yml

**Create `docker-compose.yml`:**
```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: next_boilerplate
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mailpit:
    image: axllent/mailpit:latest
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI
    environment:
      MP_SMTP_AUTH_ACCEPT_ANY: 1
      MP_SMTP_AUTH_ALLOW_INSECURE: 1

volumes:
  postgres_data:
```

---

### Phase 8: Environment Variables (~10 min)

**Create `.env.example`:**
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/next_boilerplate"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me-to-random-string-32-chars"  # openssl rand -base64 32

# OAuth (optional)
# GITHUB_CLIENT_ID=""
# GITHUB_CLIENT_SECRET=""
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""

# Email (SMTP)
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="noreply@example.com"

# Stripe (opt-in)
# STRIPE_SECRET_KEY=""
# STRIPE_WEBHOOK_SECRET=""
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
```

---

### Phase 9: Documentation (~20 min)

**Update `README.md`:**
- Quick start instructions
- Architecture overview
- Auth flow documentation
- Docker Compose setup
- Feature list matching nuxt-boilerplate

**Create `CLAUDE.md`:**
- Project overview
- Architecture diagram
- Key commands
- Conventions (NextAuth.js, Prisma, Shadcn)
- File patterns
- Testing setup
- Deployment instructions

---

### Phase 10: Stripe Package (Optional, ~30 min)

**Reference:** nuxt-boilerplate/packages/payments/

**If time permits:**
1. Create `packages/payments/` with Stripe SDK
2. Add webhook handler
3. Add subscription management
4. Mirror nuxt-boilerplate payments package

---

### Phase 11: Tests (Optional, ~30 min)

**Reference:** nuxt-boilerplate/packages/e2e/

**If time permits:**
1. Add Playwright config
2. Create E2E tests for auth flow
3. Add Vitest for unit tests

---

## Key Patterns to Follow

**From nuxt-boilerplate:**
1. **Zero external dependencies** — no Clerk, Resend, PostHog, Sentry
2. **Opt-in Stripe** — only enabled if env vars set
3. **Mailpit for dev** — all emails caught locally (localhost:8025)
4. **Docker Compose** — one command to start PostgreSQL + Mailpit
5. **Self-contained** — `pnpm install && docker compose up && pnpm dev` = working app

**NextAuth.js vs Sidebase Nuxt Auth:**
- NextAuth.js is the underlying library (Sidebase wraps it for Nuxt)
- Configuration is similar but adapted for Next.js
- API routes instead of Nuxt server routes

**React Email vs Vue Email:**
- Same concept, different frameworks
- React Email components use JSX
- Vue Email uses SFC templates

---

## Session Start Commands

```bash
cd /c/Repo/next-boilerplate

# 1. Install dependencies
pnpm install

# 2. Start Docker
docker compose up -d

# 3. Push Prisma schema
pnpm db:push

# 4. Start dev
pnpm dev
```

---

## Verification Checklist

Before marking P2 complete:

- [ ] `pnpm install` works
- [ ] `docker compose up -d` starts PostgreSQL + Mailpit
- [ ] `pnpm db:push` syncs Prisma schema
- [ ] `pnpm dev` starts Next.js app
- [ ] Auth flow works: register → verify email (Mailpit) → login → dashboard
- [ ] Email templates render correctly
- [ ] Protected routes require auth
- [ ] Stripe opt-in works (if implemented)
- [ ] Tests pass (if implemented)
- [ ] README and CLAUDE.md complete
- [ ] Set as GitHub template

---

## Reference Files

**Key nuxt-boilerplate files to reference:**
- `apps/web/pages/auth/*.vue` → `apps/web/app/(auth)/*/page.tsx`
- `apps/web/server/api/auth/[...].ts` → `apps/web/app/api/auth/[...nextauth]/route.ts`
- `apps/web/server/utils/auth.ts` → `apps/web/lib/auth-utils.ts`
- `packages/email/src/mailer.ts` → `packages/email/src/mailer.ts` (adapt for React Email)
- `packages/database/prisma/schema.prisma` → Already done ✓

---

## Estimated Time: 4-6 hours

**Phase breakdown:**
- Phases 1-5 (Core): 3 hours
- Phase 6-9 (UI + Docs): 1.5 hours
- Phase 10-11 (Optional): 1 hour

**Priority order:**
1. Email package completion
2. Next.js app structure
3. NextAuth.js setup
4. Auth pages
5. API routes
6. Shadcn UI
7. Docker Compose
8. Documentation
9. Stripe (optional)
10. Tests (optional)

---

## Success Criteria

**P2 complete when:**
✓ Feature parity with nuxt-boilerplate (auth, email, database, UI)
✓ Zero external account dependencies
✓ Docker Compose working
✓ Documentation complete
✓ GitHub template enabled
✓ Verification checklist passed

---

**Next session: Start with Phase 1 (Email Package) and work through systematically.**
