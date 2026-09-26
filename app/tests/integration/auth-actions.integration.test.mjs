import { beforeEach, describe, expect, it, vi } from "vitest";

const createAccountMock = vi.fn();
const loginMock = vi.fn();
const logoutMock = vi.fn();
const redirectMock = vi.fn((path) => {
  const error = new Error("NEXT_REDIRECT:" + path);
  error.digest = "NEXT_REDIRECT";
  throw error;
});

vi.mock("../../src/lib/server/auth.ts", () => ({
  registerUserAndCreateSession: createAccountMock,
  loginUserAndCreateSession: loginMock,
  logoutCurrentSession: logoutMock,
  normalizeEmail: (value) => String(value).trim().toLowerCase(),
  validateRegistrationInput: (input) => ({
    ok: true,
    email: String(input.email).trim().toLowerCase()
  })
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock
}));

const {
  registerAction,
  loginAction,
  logoutAction
} = await import("../../src/app/actions/auth.ts");

function form(values) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("self-hosted authentication actions", () => {
  beforeEach(() => {
    createAccountMock.mockReset();
    loginMock.mockReset();
    logoutMock.mockReset();
    redirectMock.mockClear();
  });

  it("registers and redirects to the learner gateway", async () => {
    createAccountMock.mockResolvedValue({ id: "user_1", email: "alice@example.com" });

    await expect(registerAction(undefined, form({
      email: " Alice@Example.com ",
      password: "Correct-Horse-Battery-Staple-42",
      confirmPassword: "Correct-Horse-Battery-Staple-42"
    }))).rejects.toThrow("NEXT_REDIRECT:/learn");

    expect(createAccountMock).toHaveBeenCalledWith(
      "alice@example.com",
      "Correct-Horse-Battery-Staple-42"
    );
  });

  it("returns a safe error for duplicate registration", async () => {
    createAccountMock.mockRejectedValue(new Error("ACCOUNT_EXISTS"));

    await expect(registerAction(undefined, form({
      email: "alice@example.com",
      password: "Correct-Horse-Battery-Staple-42",
      confirmPassword: "Correct-Horse-Battery-Staple-42"
    }))).resolves.toEqual({
      error: "That account could not be created. Try signing in or use another email."
    });
  });

  it("logs a user in without accepting any client user id", async () => {
    loginMock.mockResolvedValue({ id: "user_9", email: "bob@example.com" });

    await expect(loginAction(undefined, form({
      email: "bob@example.com",
      password: "Correct-Horse-Battery-Staple-42",
      userId: "attacker"
    }))).rejects.toThrow("NEXT_REDIRECT:/learn");

    expect(loginMock).toHaveBeenCalledWith(
      "bob@example.com",
      "Correct-Horse-Battery-Staple-42"
    );
  });

  it("returns one generic login error for invalid credentials", async () => {
    loginMock.mockRejectedValue(new Error("INVALID_CREDENTIALS"));

    await expect(loginAction(undefined, form({
      email: "bob@example.com",
      password: "wrong-password-123456"
    }))).resolves.toEqual({
      error: "Invalid email or password."
    });
  });

  it("logs out through a server action and redirects home", async () => {
    await expect(logoutAction()).rejects.toThrow("NEXT_REDIRECT:/");
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
