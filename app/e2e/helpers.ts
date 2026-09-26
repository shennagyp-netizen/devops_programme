import { expect, type Page } from "@playwright/test";

const password = "DevOpsE2E!2026Secure";

export function e2ePassword() {
  return password;
}

export function e2eEmail(testName: string, workerIndex = 0) {
  const run = process.env.GITHUB_RUN_ID ?? "local";
  const safe = testName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `e2e+${safe}-${run}-${workerIndex}@example.com`;
}

export async function signUp(
  page: Page,
  email: string,
  testName = "e2e",
  passwordValue = password
) {
  await page.goto("/sign-up");
  await expect(page).toHaveURL(/\/sign-up/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(passwordValue);
  await page.getByLabel("Confirm password").fill(passwordValue);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByRole("heading", { name: "Operational mastery" })).toBeVisible();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await page.screenshot({
    path: `test-results/${testName}-authenticated-gateway.png`,
    fullPage: true
  });
}

export async function signOut(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/$/);
}

export async function signIn(page: Page, email: string, testName = "e2e") {
  await page.goto("/sign-in");
  await expect(page).toHaveURL(/\/sign-in/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByRole("heading", { name: "Operational mastery" })).toBeVisible();
  await page.screenshot({
    path: `test-results/${testName}-signed-in.png`,
    fullPage: true
  });
}

export async function openAssessment(page: Page, family = "Conceptual") {
  await page.getByRole("button", { name: "assessment", exact: true }).click();
  await expect(page.getByText("Standardized assessment session", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: new RegExp(`Start ${family} assessment`) })
  ).toBeVisible();
}

export async function answerCurrentAssessmentItem(page: Page) {
  const radios = page.getByRole("radio");
  if (await radios.count()) {
    await radios.first().check();
    return { kind: "radio" as const };
  }

  const responseField = page.getByLabel(/Response \/ evidence/i);
  await expect(responseField).toBeVisible();
  await responseField.fill("Evidence recorded during the user journey.");
  return { kind: "text" as const };
}
