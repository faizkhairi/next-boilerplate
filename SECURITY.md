# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, use [GitHub's private vulnerability reporting](https://github.com/faizkhairi/next-boilerplate/security/advisories/new), which is enabled on this repository. Include:

1. A description of the vulnerability
2. Steps to reproduce the issue
3. Any potential impact

You will receive acknowledgment within 48 hours and a detailed response within 5 business days.

## Supported Versions

Only the latest commit on `main` is supported. There are no maintained release branches.

## Built-in Protections

This boilerplate ships with, and CI enforces:

- **Security headers and CSP** on every route (`apps/web/next.config.ts`): Content-Security-Policy, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, and HSTS outside development.
- **Rate limiting** on auth endpoints (`apps/web/lib/rate-limit.ts`): register, forgot/reset password, and the credentials sign-in callback. It is in-memory and per-instance; use a shared store (for example Redis/Upstash) behind a load balancer.
- **Secret scanning**: gitleaks runs in CI on every push and pull request, and GitHub push protection is enabled on this repository.
- **Dependency auditing**: `pnpm audit --audit-level=high` runs in CI, and Dependabot opens weekly grouped updates for npm and GitHub Actions.
- **Password hashing** with bcrypt, and email verification enforced before login.
- **Input validation** on all API routes with Zod schemas.

## Security Best Practices

When using this boilerplate, ensure you:

- Never commit `.env` files or secrets to version control
- Generate strong secrets for `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
- Use HTTPS in production (`NEXTAUTH_URL` must be `https://`)
- Keep dependencies updated (`pnpm audit`, or let Dependabot open the PR)
- Swap the in-memory rate limiter for a shared store before scaling past one instance
