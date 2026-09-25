import { redirect } from "next/navigation";
import { AuthForm } from "../../../components/AuthForm";
import { getCurrentUser } from "../../../lib/server/auth";
import { registerAction } from "../../actions/auth";

export default async function SignUpPage() {
  if (await getCurrentUser()) {
    redirect("/learn");
  }

  return (
    <main className="auth-page">
      <AuthForm mode="sign-up" action={registerAction} />
    </main>
  );
}
