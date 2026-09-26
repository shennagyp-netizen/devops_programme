import { test, expect } from "@playwright/test";
import { e2eEmail, openAssessment, signUp } from "./helpers";

test.describe("real-user learning gateway journey", () => {
  test("learner can switch course, platform, lesson mode and reach assessment without losing the gateway", async ({
    page
  }, testInfo) => {
    const email = e2eEmail(testInfo.title, testInfo.workerIndex, testInfo.retry);
    await signUp(page, email, "gateway-entry");

    await expect(page.getByRole("heading", { name: "DevOps Engineering", exact: true })).toBeVisible();

    await page.getByText("Windows", { exact: true }).click();
    await expect(page.getByText("Environment: Windows · PowerShell", { exact: true })).toBeVisible();

    await page.getByText("DevOps Through Problems", { exact: true }).click();
    await expect(page.getByRole("heading", { name: "DevOps Through Problems" })).toBeVisible();
    await expect(page.getByText("Environment: Windows · PowerShell", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "do", exact: true }).click();
    await expect(page.getByText(/Operate on windows/i)).toBeVisible();

    await page.getByRole("button", { name: "recall", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Retrieval" })).toBeVisible();

    await page.getByRole("button", { name: "design", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Production design" })).toBeVisible();

    await openAssessment(page, "Conceptual");
    await expect(page.getByText("SECTION ASSESSMENT", { exact: true })).toBeVisible();
  });

  test("learner sees the local-terminal path in Do mode and can switch back to Learn", async ({
    page
  }, testInfo) => {
    const email = e2eEmail(testInfo.title, testInfo.workerIndex, testInfo.retry);
    await signUp(page, email, "gateway-terminal");

    await page.getByText("DevOps Through Problems", { exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "The App Is Slow — Where Do We Look?", exact: true })
    ).toBeVisible();

    await page.getByText("Linux", { exact: true }).click();
    await expect(page.getByText("Environment: Linux · bash", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "do", exact: true }).click();
    await expect(page.getByText("VERIFIED LAPTOP TERMINAL", { exact: true })).toBeVisible();
    await expect(page.getByText("npm run terminal-agent", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "learn", exact: true }).click();
    await expect(page.getByText("THEORY ADAPTATION", { exact: true })).toBeVisible();
    await expect(page.getByText("Mental model", { exact: true })).toBeVisible();
  });
  test("learner can pair the browser with the local terminal agent and receive machine verification", async ({
    page
  }, testInfo) => {
    const email = e2eEmail(testInfo.title, testInfo.workerIndex, testInfo.retry);
    await signUp(page, email, "gateway-terminal-verified");

    await page.getByText("DevOps Through Problems", { exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "The App Is Slow — Where Do We Look?", exact: true })
    ).toBeVisible();
    await page.getByText("Linux", { exact: true }).click();
    await expect(page.getByText("Environment: Linux · bash", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "do", exact: true }).click();
    await expect(page.getByText("VERIFIED LAPTOP TERMINAL", { exact: true })).toBeVisible();
    await expect(page.getByText(/Connected · linux · agent/)).toBeVisible();

    await page.getByLabel("Pair this browser with the local agent").fill("e2e-terminal-token");
    await page.getByRole("button", { name: "Run verified exercise on this laptop" }).click();

    await expect(
      page.getByText("Laptop terminal execution verified for this session.", { exact: true })
    ).toBeVisible();
    await expect(page.getByText("LAPTOP TERMINAL RESULTS", { exact: true })).toBeVisible();
    await expect(page.getByText(/processes · passed · exit 0/)).toBeVisible();
  });

});
