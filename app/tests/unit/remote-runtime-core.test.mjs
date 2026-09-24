import { describe, expect, it } from "vitest";
import {
  remoteCommandForStep,
  shellQuotePosix,
  sshArguments
} from "../../scripts/remote-runtime-core.mjs";
import { runtimeTaskForLesson } from "../../src/data/runtimeVerification.ts";

describe("remote runtime core", () => {
  it("quotes POSIX arguments so task data cannot become shell syntax", () => {
    expect(shellQuotePosix("hello; rm -rf /")).toBe("'hello; rm -rf /'");
    expect(shellQuotePosix("it's safe")).toBe("'it'\\''s safe'");
  });

  it("rejects SSH user values that could be parsed as command-line options", () => {
    const task = runtimeTaskForLesson("B1.2");
    const step = task.steps[0];

    expect(() =>
      sshArguments({
        host: "vm.example",
        user: "-oProxyCommand=touch /tmp/pwned",
        port: 22,
        task,
        step,
        platform: "linux"
      })
    ).toThrow("Invalid SSH user.");
  });

  it("rejects SSH host values containing command-line injection syntax", () => {
    const task = runtimeTaskForLesson("B1.2");
    const step = task.steps[0];

    expect(() =>
      sshArguments({
        host: "-oProxyCommand=touch /tmp/pwned",
        user: "student",
        port: 22,
        task,
        step,
        platform: "linux"
      })
    ).toThrow("Invalid SSH host.");
  });

  it("builds SSH arguments with strict host-key checking", () => {
    const task = runtimeTaskForLesson("B1.2");
    const step = task.steps[0];

    const args = sshArguments({
      host: "vm.example",
      user: "student",
      port: 22,
      identity: "/tmp/id_ed25519",
      knownHostsFile: "/tmp/known_hosts",
      task,
      step,
      platform: "linux"
    });

    expect(args).toContain("StrictHostKeyChecking=yes");
    expect(args).toContain("BatchMode=yes");
    expect(args).toContain("UserKnownHostsFile=/tmp/known_hosts");
    expect(args).toContain("IdentitiesOnly=yes");
    expect(args).toContain("/tmp/id_ed25519");
    expect(args.at(-1)).toBe(
      remoteCommandForStep(task, step, "linux")
    );
  });
});
