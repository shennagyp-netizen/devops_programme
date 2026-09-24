import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config.ts";

describe("security headers", () => {
  it("declares baseline browser hardening headers", async () => {
    const headers = await nextConfig.headers?.();
    const wildcard = headers?.find((entry) => entry.source === "/:path*");
    expect(wildcard).toBeDefined();

    const values = Object.fromEntries(
      wildcard?.headers.map((header) => [header.key, header.value]) ?? []
    );

    expect(values["X-Content-Type-Options"]).toBe("nosniff");
    expect(values["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(values["X-Frame-Options"]).toBe("SAMEORIGIN");
    expect(values["Permissions-Policy"]).toContain("camera=()");
    expect(values["X-DNS-Prefetch-Control"]).toBe("off");
  });
});
