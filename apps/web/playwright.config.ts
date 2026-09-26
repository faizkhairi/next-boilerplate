import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT || 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  // Fail the run (and upload the report) well before the CI job timeout.
  globalTimeout: process.env.CI ? 10 * 60_000 : undefined,
  // In CI: per-test lines in the log, GitHub annotations, and an HTML report
  // that is written but never served (serving would wait for Ctrl+C).
  reporter: process.env.CI
    ? [["list"], ["github"], ["html", { open: "never" }]]
    : "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  webServer: {
    // CI runs against the production build (already built by the workflow
    // step before this), so it exercises the real bundle instead of the
    // Turbopack dev server.
    command: process.env.CI ? "pnpm start" : "pnpm dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
