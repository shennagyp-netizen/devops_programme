"use server";

import { redirect } from "next/navigation";
import {
  loginUserAndCreateSession,
  logoutCurrentSession,
  registerUserAndCreateSession,
  validateRegistrationInput
} from "../../lib/server/auth";

export type AuthActionState = {
  error?: string;
};

export async function registerAction(
  _previousState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  const validation = validateRegistrationInput({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? "")
  });

  if (!validation.ok) return { error: validation.error };

  try {
    await registerUserAndCreateSession(
      validation.email,
      String(formData.get("password") ?? "")
    );
  } catch (error) {
    if (error instanceof Error && error.message === "ACCOUNT_EXISTS") {
      return {
        error: "That account could not be created. Try signing in or use another email."
      };
    }
    return { error: "We could not create the account. Please try again." };
  }

  redirect("/learn");
}

export async function loginAction(
  _previousState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (
    !email ||
    password.length === 0 ||
    email.length > 320 ||
    password.length > 200
  ) {
    return { error: "Invalid email or password." };
  }

  try {
    await loginUserAndCreateSession(email, password);
  } catch {
    return { error: "Invalid email or password." };
  }

  redirect("/learn");
}

export async function logoutAction() {
  await logoutCurrentSession();
  redirect("/");
}
