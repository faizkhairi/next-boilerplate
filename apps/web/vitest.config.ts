import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/tests/e2e/**", // Playwright E2E tests
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["lib/**", "app/api/**"],
      exclude: [
        "**/*.d.ts",
        "**/__tests__/**",
        "**/generated/**",
      ],
      // Measured 2026-09-26 with `pnpm test:coverage`:
      // statements 14.33%, branches 10.06%, functions 25%, lines 14.33%.
      // Thresholds below are those values rounded down to the nearest 5.
      // Raise these as coverage grows; never lower them to make CI pass.
      thresholds: {
        lines: 10,
        functions: 25,
        branches: 10,
        statements: 10,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
