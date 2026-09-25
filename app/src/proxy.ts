import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/learn(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api(.*)",
    "/trpc(.*)",
    "/__clerk(.*)"
  ]
};
