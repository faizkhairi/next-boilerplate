# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email **ifaizkhairi@gmail.com** with:

1. A description of the vulnerability
2. Steps to reproduce the issue
3. Any potential impact

You will receive acknowledgment within 48 hours and a detailed response within 5 business days.

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | Yes       |

## Security Best Practices

When using this boilerplate, ensure you:

- Never commit `.env` files or secrets to version control
- Generate strong secrets for `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
- Use HTTPS in production (`NEXTAUTH_URL` must be `https://`)
- Keep dependencies updated (`pnpm audit`)
- Validate all user inputs with Zod schemas
- Hash passwords with bcrypt (10+ salt rounds)
- Enable email verification before login
