import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("landing page loads successfully", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Next Boilerplate/);
    await expect(page.getByText("Auth, email, payments and docs in one monorepo")).toBeVisible();
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

    // globals.css paints <body> with the --background theme channels
    const [bodyBackground, tokenBackground] = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.backgroundColor = "hsl(var(--background))";
      document.body.appendChild(probe);
      const token = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return [getComputedStyle(document.body).backgroundColor, token];
    });
    expect(bodyBackground).not.toBe("rgba(0, 0, 0, 0)");
    expect(bodyBackground).toBe(tokenBackground);
  });
});
