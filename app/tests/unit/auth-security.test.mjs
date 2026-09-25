import { describe, expect, it } from "vitest";
import {
  hashPassword,
  verifyPassword,
  normalizeEmail,
  validateRegistrationInput
} from "../../src/lib/server/auth.ts";

describe("self-hosted authentication security", () => {
  it("normalizes email identifiers consistently", () => {
    expect(normalizeEmail("  Alice@Example.COM ")).toBe("alice@example.com");
  });

  it("rejects malformed registration input", () => {
    expect(validateRegistrationInput({
      email: "not-an-email",
      password: "short",
      confirmPassword: "short"
    })).toEqual({ ok: false, error: "Enter a valid email and a stronger password." });
  });

  it("rejects mismatched passwords", () => {
    expect(validateRegistrationInput({
      email: "alice@example.com",
      password: "correct horse battery staple",
      confirmPassword: "different password"
    })).toEqual({ ok: false, error: "Passwords do not match." });
  });

  it("hashes passwords without storing the plaintext", async () => {
    const password = "Correct-Horse-Battery-Staple-42";
    const encoded = await hashPassword(password);

    expect(encoded).not.toContain(password);
    expect(encoded).toMatch(/^scrypt\$N=\d+\$r=\d+\$p=\d+\$[0-9a-f]+\$[0-9a-f]+$/);
    expect(await verifyPassword(password, encoded)).toBe(true);
    expect(await verifyPassword("wrong-password", encoded)).toBe(false);
  });

  it("uses a different salt for equal passwords", async () => {
    const first = await hashPassword("same-password-123456");
    const second = await hashPassword("same-password-123456");

    expect(first).not.toBe(second);
    expect(await verifyPassword("same-password-123456", first)).toBe(true);
    expect(await verifyPassword("same-password-123456", second)).toBe(true);
  });

  it("fails closed on malformed stored password hashes", async () => {
    await expect(verifyPassword("anything", "not-a-hash")).resolves.toBe(false);
    await expect(
      verifyPassword("anything", "scrypt$N=15$r=8$p=1$00$")
    ).resolves.toBe(false);
  });
});
