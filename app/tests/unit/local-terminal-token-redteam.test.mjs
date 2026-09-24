import { describe, expect, it } from "vitest";

describe("local terminal pairing secret", () => {
  it("does not recover a pairing token from persistent localStorage", async () => {
    globalThis.localStorage = {
      getItem: () => "stolen-persistent-token",
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0
    };

    const module = await import("../../src/data/localTerminalAgent.ts?security-redteam=1");
    expect(module.getLocalTerminalToken()).toBe("");
  });

  it("keeps the pairing token only in process memory", async () => {
    const module = await import("../../src/data/localTerminalAgent.ts?security-redteam=2");
    module.setLocalTerminalToken(" short-lived-token ");
    expect(module.getLocalTerminalToken()).toBe("short-lived-token");
  });
});


describe("local terminal agent attestation discovery", () => {
  it("fails closed when the agent health response has no attestation key", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({
        version: "test",
        platform: "linux"
      })
    });

    try {
      const module = await import("../../src/data/localTerminalAgent.ts?missing-attestation-key=1");
      await expect(module.localTerminalAgentStatus()).resolves.toEqual({
        available: false,
        reason: "Local terminal agent did not publish an attestation public key."
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
