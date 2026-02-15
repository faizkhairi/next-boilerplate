import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("landing page loads successfully", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Next Boilerplate/);
    await expect(page.getByText("Production-ready with zero external dependencies")).toBeVisible();
  });

  test("all auth pages are accessible", async ({ page }) => {
    const pages = [
      { path: "/auth/login", heading: "Sign In" },
      { path: "/auth/register", heading: "Create Account" },
      { path: "/auth/forgot-password", heading: "Reset Password" },
    ];

    for (const { path, heading } of pages) {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
  });

  test("pages have consistent branding", async ({ page }) => {
    await page.goto("/");

    // Check for consistent theme
    const body = page.locator("body");
    await expect(body).toHaveClass(/bg-background/);
  });
});
