import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

export default function LearnLayout({ children }: { children: ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
