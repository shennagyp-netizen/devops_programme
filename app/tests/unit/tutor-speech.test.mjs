import { describe, expect, it } from "vitest";
import { splitTutorSpeech } from "../../src/components/FloatingLLMAssistant/speech.ts";

describe("tutor speech segmentation", () => {
  it("splits long responses into natural spoken units", () => {
    expect(
      splitTutorSpeech(
        "First, check DNS. Then check the transport port. Finally, inspect HTTP."
      )
    ).toEqual([
      "First, check DNS.",
      "Then check the transport port.",
      "Finally, inspect HTTP."
    ]);
  });

  it("returns an empty list for whitespace-only content", () => {
    expect(splitTutorSpeech("   ")).toEqual([]);
  });
});
