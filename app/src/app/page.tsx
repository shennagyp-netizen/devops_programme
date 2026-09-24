import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import App from "../App";
import { listCompletionHistoryForUser } from "../lib/server/progress";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const completionHistory = await listCompletionHistoryForUser(userId);

  return <App initialCompletionHistory={completionHistory} />;
}
