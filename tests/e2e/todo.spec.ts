import { test, expect } from "@playwright/test";

test.describe("Todo App", () => {
  test("shows empty state when no todos", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("No todos yet")).toBeVisible();
  });

  test("can create a new todo", async ({ page }) => {
    await page.goto("/");

    const input = page.getByPlaceholder("What needs to be done?");
    await input.fill("Buy groceries");
    await page.getByRole("button", { name: "Add Todo" }).click();

    await expect(page.getByText("Buy groceries")).toBeVisible();
  });

  test("can complete a todo", async ({ page }) => {
    await page.goto("/");

    // Create a todo first
    const input = page.getByPlaceholder("What needs to be done?");
    await input.fill("Walk the dog");
    await page.getByRole("button", { name: "Add Todo" }).click();
    await expect(page.getByText("Walk the dog")).toBeVisible();

    // Complete it
    await page.getByRole("button", { name: "Complete" }).first().click();

    // The "Completed" badge should appear
    await expect(page.getByText("Completed")).toBeVisible();
  });

  test("shows validation error for empty title — submit button is disabled", async ({
    page,
  }) => {
    await page.goto("/");

    const submitButton = page.getByRole("button", { name: "Add Todo" });

    // Button must be disabled when input is empty
    await expect(submitButton).toBeDisabled();
  });

  test("dark mode toggle works", async ({ page }) => {
    await page.goto("/");

    // Click the dark mode toggle button
    await page.getByRole("button", { name: "Toggle dark mode" }).click();

    // html element should have the "dark" class applied by next-themes
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
