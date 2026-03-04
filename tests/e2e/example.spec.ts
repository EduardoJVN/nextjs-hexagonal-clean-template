import { test, expect } from "@playwright/test";

// Smoke test — verifies the page loads successfully.
// All feature-level tests live in todo.spec.ts.
test("page loads successfully", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Next\.js Hexagonal Template/);
});
