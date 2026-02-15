import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("landing page shows auth buttons", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Next.js 15 Boilerplate" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign Up" })).toBeVisible();
  });

  test("can navigate to login page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Sign In" }).click();

    await expect(page).toHaveURL("/auth/login");
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });

  test("can navigate to register page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Sign Up" }).click();

    await expect(page).toHaveURL("/auth/register");
    await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();
  });

  test("login form validation", async ({ page }) => {
    await page.goto("/auth/login");

    // Click submit without filling form
    await page.getByRole("button", { name: "Sign In" }).click();

    // Should show validation errors
    await expect(page.getByText("Invalid email address")).toBeVisible();
  });

  test("register form validation", async ({ page }) => {
    await page.goto("/auth/register");

    // Fill form with mismatched passwords
    await page.getByLabel("Name").fill("Test User");
    await page.getByLabel("Email").fill("test@example.com");
    await page.locator('input[type="password"]').first().fill("Password123");
    await page.locator('input[type="password"]').last().fill("Different123");

    await page.getByRole("button", { name: "Create Account" }).click();

    // Should show password mismatch error
    await expect(page.getByText("Passwords don't match")).toBeVisible();
  });

  test("forgot password link is present", async ({ page }) => {
    await page.goto("/auth/login");

    await expect(page.getByRole("link", { name: "Forgot password?" })).toBeVisible();
  });

  test("can navigate to forgot password page", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("link", { name: "Forgot password?" }).click();

    await expect(page).toHaveURL("/auth/forgot-password");
    await expect(page.getByRole("heading", { name: "Reset Password" })).toBeVisible();
  });

  test("forgot password form validation", async ({ page }) => {
    await page.goto("/auth/forgot-password");

    // Submit with invalid email
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByRole("button", { name: "Send Reset Link" }).click();

    // Should show validation error
    await expect(page.getByText("Invalid email address")).toBeVisible();
  });

  test("register and login links are interconnected", async ({ page }) => {
    await page.goto("/auth/login");

    // Should have link to register
    await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();

    // Navigate to register
    await page.getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL("/auth/register");

    // Should have link back to login
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });

  test("protected dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard");

    // Should redirect to login
    await expect(page).toHaveURL("/auth/login");
  });
});
