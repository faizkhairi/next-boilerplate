import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

// Security headers applied to every route.
//
// Why no per-request nonce: a nonce-based script-src/style-src would let us
// drop 'unsafe-inline' entirely, but it requires every page that needs it to
// opt into dynamic rendering (the nonce has to be generated per request and
// threaded into the HTML), which would take the marketing and auth pages
// here out of static generation. This boilerplate optimizes for pages
// staying statically renderable by default, so it accepts 'unsafe-inline'
// for script-src/style-src instead.
//
// To tighten this later: switch to a nonce via middleware/proxy.ts (see
// https://nextjs.org/docs/app/guides/content-security-policy), drop
// 'unsafe-inline', and opt each page that needs the nonce into dynamic
// rendering.
const contentSecurityPolicy = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data:`,
  // No client-side Stripe.js/frame embed in this app: checkout is a
  // top-level redirect to Stripe-hosted pages, so connect-src/frame-src
  // don't need Stripe domains added. Add them here if that ever changes.
  `connect-src 'self'`,
  `frame-src 'none'`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // HSTS only makes sense once the app is actually served over HTTPS.
  ...(isDev
    ? []
    : [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]),
];

const config: NextConfig = {
  transpilePackages: ['@repo/database', '@repo/email'],
  experimental: {
    // Enable optimizations for monorepo
    optimizePackageImports: ['@repo/database', '@repo/email'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default config;
