"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthActionState } from "../app/actions/auth";

type AuthMode = "sign-in" | "sign-up";

type AuthFormProps = {
  mode: AuthMode;
  action: (
    previousState: AuthActionState | undefined,
    formData: FormData
  ) => Promise<AuthActionState>;
};

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const signUp = mode === "sign-up";

  return (
    <form className="auth-card" action={formAction}>
      <div className="auth-card-head">
        <span className="eyebrow">DEVOPS PROGRAMME</span>
        <h1>{signUp ? "Create your account" : "Welcome back"}</h1>
        <p>
          {signUp
            ? "Create one account. Your learning progress stays attached to it."
            : "Sign in to continue your saved learning history."}
        </p>
      </div>

      <label>
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={320}
          placeholder="you@example.com"
        />
      </label>

      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete={signUp ? "new-password" : "current-password"}
          required
          minLength={12}
          maxLength={200}
          placeholder="At least 12 characters"
        />
      </label>

      {signUp ? (
        <label>
          Confirm password
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={200}
          />
        </label>
      ) : null}

      {state?.error ? (
        <p className="auth-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button className="primary auth-submit" type="submit" disabled={pending}>
        {pending ? "Please wait…" : signUp ? "Create account" : "Sign in"}
      </button>

      <p className="auth-switch">
        {signUp ? "Already have an account?" : "New to the programme?"}{" "}
        <Link href={signUp ? "/sign-in" : "/sign-up"}>
          {signUp ? "Sign in" : "Create an account"}
        </Link>
      </p>

      <Link className="auth-home-link" href="/">
        ← Back to programme
      </Link>
    </form>
  );
}
