import { test, expect } from "@playwright/test";
import { e2eEmail, e2ePassword, signIn, signOut, signUp } from "./helpers";

test.describe("real-user public and authentication journey", () => {
  test("public visitor can understand the programme and anonymous learning access is blocked", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", {
      name: "Learn DevOps by operating systems, breaking them, and recovering them."
    })).toBeVisible();
    await expect(page.getByRole("link", { name: "Learning gateway" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create account" })).toBeVisible();

    await page.goto("/learn");
    await expect(page).toHaveURL(/\/sign-in\?*/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("learner can create an account, leave the gateway, and sign back in", async ({
    page
  }, testInfo) => {
    const email = e2eEmail(testInfo.title, testInfo.workerIndex, testInfo.retry);

    await signUp(page, email, "auth-signup");

    await expect(page.getByText("intermediate", { exact: true })).toBeVisible();
    await signOut(page);

    await page.goto("/learn");
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Learn DevOps by operating systems, breaking them, and recovering them." })).toBeVisible();
    await signIn(page, email, "auth-resignin");

    await expect(page.getByText("Operational mastery", { exact: true })).toBeVisible();
  });

  test("invalid login stays on the authentication surface instead of entering the gateway", async ({
    page
  }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByLabel("Password").fill(e2ePassword());
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid email or password.", { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in$/);
  });
});
