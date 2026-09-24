import { createHash } from "node:crypto";

export const REMOTE_RUNNER_VERSION = "0.1.0";
export const SUPPORTED_REMOTE_PLATFORMS = ["linux", "macos"];

export function shellQuotePosix(value) {
  return "'" + String(value).replaceAll("'", "'\\''") + "'";
}

export function remoteCommandForStep(task, step, platform) {
  const command = step.commands?.[platform];
  if (!command) {
    throw new Error(`No ${platform} command exists for step ${step.id}.`);
  }
  if (command.destructive) {
    throw new Error(
      `Task step ${step.id} is marked destructive and cannot run through the SSH runner.`
    );
  }

  return [command.program, ...command.args].map(shellQuotePosix).join(" ");
}

export function sshArguments({
  host,
  user,
  port,
  identity,
  knownHostsFile,
  task,
  step,
  platform
}) {
  const args = [
    "-o",
    "BatchMode=yes",
    "-o",
    "StrictHostKeyChecking=yes",
    "-o",
    "ConnectTimeout=15"
  ];

  if (knownHostsFile) {
    args.push("-o", `UserKnownHostsFile=${knownHostsFile}`);
  }

  if (identity) {
    args.push("-o", "IdentitiesOnly=yes", "-i", identity);
  }

  args.push("-p", String(port), `${user}@${host}`, remoteCommandForStep(task, step, platform));
  return args;
}

export function commandPlan(task, platform) {
  return task.steps.map((step) => {
    const command = step.commands?.[platform];
    if (!command) {
      throw new Error(`No ${platform} command exists for step ${step.id}.`);
    }
    if (command.destructive) {
      throw new Error(
        `Task step ${step.id} is marked destructive and cannot run through the SSH runner.`
      );
    }

    return {
      id: step.id,
      kind: step.kind,
      purpose: step.purpose,
      program: command.program,
      args: command.args,
      timeoutMs: command.timeoutMs,
      destructive: command.destructive
    };
  });
}

export function environmentFingerprint({ platform, arch, nodeVersion }) {
  return createHash("sha256")
    .update(JSON.stringify({ platform, arch, nodeMajor: nodeVersion.split(".")[0] }))
    .digest("hex");
}

export function parseRemoteArgs(argv) {
  const options = new Map();
  const valueOptions = new Set([
    "lesson",
    "host",
    "user",
    "port",
    "platform",
    "identity",
    "known-hosts",
    "output"
  ]);
  const flagOptions = new Set(["dry-run", "execute"]);

  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      throw new Error("Unexpected argument: " + token);
    }

    const key = token.slice(2);

    if (flagOptions.has(key)) {
      options.set(key, "true");
      continue;
    }

    if (!valueOptions.has(key)) {
      throw new Error("Unknown option: --" + key);
    }

    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error("Missing value for --" + key);
    }

    options.set(key, value);
    index += 1;
  }

  if (options.has("dry-run") && options.has("execute")) {
    throw new Error("Use either --dry-run or --execute, not both.");
  }

  const lessonId = options.get("lesson");
  const platform = options.get("platform");
  if (!lessonId) throw new Error("Missing required option: --lesson");
  if (!platform) throw new Error("Missing required option: --platform");

  if (!SUPPORTED_REMOTE_PLATFORMS.includes(platform)) {
    throw new Error(
      "SSH runner currently supports linux and macos targets only; Windows remains available through manual execution."
    );
  }

  const port = Number(options.get("port") ?? "22");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Invalid --port; expected an integer from 1 to 65535.");
  }

  const execute = options.has("execute");

  if (execute && (!options.get("host") || !options.get("user"))) {
    throw new Error("--host and --user are required with --execute.");
  }

  return {
    lessonId,
    platform,
    host: options.get("host"),
    user: options.get("user"),
    port,
    identity: options.get("identity"),
    knownHostsFile: options.get("known-hosts"),
    output: options.get("output"),
    dryRun: !execute
  };
}
