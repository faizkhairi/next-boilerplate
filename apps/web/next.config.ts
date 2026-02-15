import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['@repo/database', '@repo/email'],
  experimental: {
    // Enable optimizations for monorepo
    optimizePackageImports: ['@repo/database', '@repo/email'],
  },
};

export default config;
