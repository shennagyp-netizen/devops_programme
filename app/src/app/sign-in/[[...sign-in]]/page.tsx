import { ClerkProvider, SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <ClerkProvider>
      <main className="auth-page">
        <SignIn fallbackRedirectUrl="/learn" />
      </main>
    </ClerkProvider>
  );
}
