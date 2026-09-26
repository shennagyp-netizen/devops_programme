export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import App from "../../App";
import { requireCurrentUser } from "../../lib/server/auth";
import { listCompletionHistoryForUser, listMasteryHistoryForUser } from "../../lib/server/progress";
import { listVerifiedEvidenceForUser } from "../../lib/server/evidenceAuthority";

export default async function LearnPage() {
  const user = await requireCurrentUser().catch((error) => {
    if (error instanceof Error && error.message === "Authentication required.") {
      return null;
    }
    throw error;
  });

  if (!user) {
    redirect("/sign-in");
  }

  const completionHistory = await listCompletionHistoryForUser(user.id);
  const masteryHistory = await listMasteryHistoryForUser(user.id);
  const verifiedEvidence = await listVerifiedEvidenceForUser(user.id);

  return (
    <App
      currentUser={{ email: user.email }}
      initialCompletionHistory={completionHistory}
      initialMasteryHistory={masteryHistory}
      initialVerifiedEvidence={verifiedEvidence}
    />
  );
}
