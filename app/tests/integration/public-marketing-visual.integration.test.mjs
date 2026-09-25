import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

describe("public marketing visual contract", () => {
  it("places a purpose-built systems illustration in the hero", async () => {
    const page = await source("../../src/app/page.tsx");

    expect(page).toContain("<MarketingHeroIllustration />");
    expect(illustration).toContain('aria-label="DevOps learning system illustration"');
    expect(illustration).toContain('className="marketing-hero-illustration"');
  });

  it("uses motion to explain the operating loop rather than as decoration only", async () => {
    const illustration = await source("../../src/components/MarketingHeroIllustration.tsx");

    expect(illustration).toContain("Understand");
    expect(illustration).toContain("Diagnose");
    expect(illustration).toContain("Repair");
    expect(illustration).toContain("marketing-packet-static");
    expect(illustration).toContain("marketing-packet");
  });

  it("keeps hero animation accessible when reduced motion is requested", async () => {
    const styles = await source("../../src/styles.css");

    expect(styles).toContain(".marketing-packet");
    expect(styles).toContain("@keyframes marketingPacketTravel");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain(".marketing-hero-illustration");
  });
});
