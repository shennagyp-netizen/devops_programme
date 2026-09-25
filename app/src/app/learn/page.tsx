import { redirect } from "next/navigation";
import App from "../../App";
import { requireCurrentUser } from "../../lib/server/auth";
import { listCompletionHistoryForUser } from "../../lib/server/progress";

export default async function LearnPage() {
  const user = await requireCurrentUser().catch(() => null);

  if (!user) {
    redirect("/sign-in");
  }

  const completionHistory = await listCompletionHistoryForUser(user.id);

  return (
    <App
      currentUser={user}
      initialCompletionHistory={completionHistory}
    />
  );
}
