import { test, expect } from "@playwright/test";
import {
  answerCurrentAssessmentItem,
  e2eEmail,
  openAssessment,
  signUp
} from "./helpers";

test.describe("real-user assessment session", () => {
  test("learner can start, answer, review, navigate and submit a real assessment", async ({
    page
  }, testInfo) => {
    const email = e2eEmail(testInfo.title, testInfo.workerIndex, testInfo.retry);
    await signUp(page, email, "assessment-entry");
    await openAssessment(page, "Conceptual");

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/assessment/start") && response.request().method() === "POST"
    );

    await page.getByRole("button", { name: "Start Conceptual assessment" }).click();
    const startResponse = await responsePromise;
    expect(startResponse.ok()).toBeTruthy();

    const startPayload = await startResponse.json();
    const flattened = JSON.stringify(startPayload);
    expect(flattened).not.toContain("correctOption");
    expect(startPayload.attemptId).toEqual(expect.any(String));
    expect(startPayload.items.length).toBeGreaterThan(0);

    await expect(page.getByText(/TIME REMAINING/)).toBeVisible();
    await expect(page.getByText(/ITEM 1 OF/)).toBeVisible();

    const answer = await answerCurrentAssessmentItem(page);

    await page.getByRole("button", { name: "Mark for review" }).click();
    await expect(
        page.getByRole("button", { name: "Marked for review", exact: true })
      ).toBeVisible();

    await page.getByRole("button", { name: "Save and next" }).click();
    await expect(page.getByText(/ITEM 2 OF/)).toBeVisible();

    await page.getByRole("button", { name: "Previous" }).click();
    await expect(page.getByText(/ITEM 1 OF/)).toBeVisible();

    if (answer.kind === "radio") {
      await expect(
        page
          .getByRole("radiogroup", { name: "Assessment response", exact: true })
          .locator('input[type="radio"]:checked')
      ).toHaveCount(1);
    } else {
      await expect(page.getByLabel(/Response \/ evidence/i)).toHaveValue(
        "Evidence recorded during the user journey."
      );
    }

    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      await dialog.accept();
    });

    await page.getByRole("button", { name: "Submit assessment" }).click();
    await expect(page.getByRole("heading", { name: "Assessment submitted" })).toBeVisible();
    await expect(
      page.getByText(/answered./, { exact: false })
    ).toBeVisible();

    await page.screenshot({
      path: "test-results/assessment-submitted.png",
      fullPage: true
    });
  });


  test("browser-originated tampering cannot inject an assessment item", async ({
    page
  }, testInfo) => {
    const email = e2eEmail(testInfo.title, testInfo.workerIndex, testInfo.retry);
    await signUp(page, email, "assessment-redteam");

    await openAssessment(page, "Conceptual");
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/assessment/start") &&
        response.request().method() === "POST"
    );

    await page.getByRole("button", { name: "Start Conceptual assessment" }).click();
    const startResponse = await responsePromise;
    const payload = await startResponse.json();

    const submitResponse = await page.evaluate(async (attemptId) => {
      const response = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers: [{ itemId: "attacker-injected-item", value: 0 }]
        })
      });

      return {
        status: response.status,
        body: await response.json()
      };
    }, payload.attemptId);

    expect(submitResponse.status).toBe(400);
    expect(submitResponse.body.error).toBe("Unknown assessment item.");
  });

  test("a second browser tab cannot start the same assessment form while the first attempt is active", async ({
    context,
    page
  }, testInfo) => {
    const email = e2eEmail(testInfo.title, testInfo.workerIndex, testInfo.retry);
    await signUp(page, email, "assessment-concurrency");

    await openAssessment(page, "Diagnostic");
    await page.getByRole("button", { name: "Start Diagnostic assessment" }).click();
    await expect(page.getByText(/TIME REMAINING/)).toBeVisible();

    const secondPage = await context.newPage();
    await secondPage.goto("/learn");
    await expect(secondPage).toHaveURL(/\/learn$/);
    await openAssessment(secondPage, "Diagnostic");

    await secondPage.getByRole("button", { name: "Start Diagnostic assessment" }).click();
    await expect(secondPage.getByText(
      "An assessment attempt is already in progress for this form.",
      { exact: true }
    )).toBeVisible();

    await secondPage.screenshot({
      path: "test-results/assessment-concurrency-blocked.png",
      fullPage: true
    });

    await secondPage.close();
  });
});
