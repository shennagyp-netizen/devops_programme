import { describe, expect, it } from "vitest";
import {
  shouldRetryTutorStatus,
  tutorRetryDelayMs
} from "../../src/components/FloatingLLMAssistant/retry.ts";

describe("tutor retry policy", () => {
  it("retries only transient upstream failures", () => {
    expect(shouldRetryTutorStatus(502)).toBe(true);
    expect(shouldRetryTutorStatus(503)).toBe(true);
    expect(shouldRetryTutorStatus(400)).toBe(false);
    expect(shouldRetryTutorStatus(401)).toBe(false);
    expect(shouldRetryTutorStatus(429)).toBe(false);
  });

  it("uses bounded exponential-style delays", () => {
    expect(tutorRetryDelayMs(0)).toBe(250);
    expect(tutorRetryDelayMs(1)).toBe(750);
  });
});
