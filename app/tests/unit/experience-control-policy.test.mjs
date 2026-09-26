import { describe, expect, it } from "vitest";
import { deriveExperienceView } from "../../src/framework/experience/index.ts";

const base = {
  itemId: "B1.2",
  mode: "do",
  completionConfirmed: false,
  requiredEvidenceVerified: false,
  assessmentEligible: false,
  remediationAvailable: false,
  remediationActive: false,
  providerBusy: false,
  completionBusy: false
};

describe("v3 experience control policy", () => {
  it("locks completion until required evidence is verified", () => {
    const view = deriveExperienceView(base);
    const control = view.controls.find((item) => item.id === "complete");
    expect(control.availability).toBe("locked");
    expect(control.reason).toContain("verification");
  });

  it("enables completion only after evidence is verified", () => {
    const view = deriveExperienceView({ ...base, requiredEvidenceVerified: true });
    const control = view.controls.find((item) => item.id === "complete");
    expect(control.availability).toBe("enabled");
  });

  it("never hides the reason for a locked assessment", () => {
    const view = deriveExperienceView(base);
    const control = view.controls.find((item) => item.id === "mode:assessment");
    expect(control.availability).toBe("locked");
    expect(control.reason).toBeTruthy();
  });

  it("represents provider execution as busy without claiming success", () => {
    const view = deriveExperienceView({ ...base, providerBusy: true });
    const verify = view.controls.find((item) => item.id === "verify");
    expect(verify.availability).toBe("busy");
    expect(verify.busyLabel).toBe("Verifying…");
  });

  it("changes the recommended action from evidence collection to completion", () => {
    expect(deriveExperienceView(base).recommendedAction).toContain("required exercise");
    expect(deriveExperienceView({ ...base, requiredEvidenceVerified: true }).recommendedAction)
      .toContain("mark the learning item complete");
  });
});