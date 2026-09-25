import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

const hasClerkConfiguration = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
);

const protectedMiddleware = hasClerkConfiguration ? clerkMiddleware() : null;

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!hasClerkConfiguration) {
    if (request.nextUrl.pathname.startsWith("/visual-audit")) {
      return NextResponse.next();
    }

    return new NextResponse("Authentication configuration is missing.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }

  return protectedMiddleware!(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)"
  ]
};
