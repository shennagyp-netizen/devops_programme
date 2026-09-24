import type { MachineVerificationEnvelope } from "./runtimeVerification";

export type LocalTerminalAgentStatus =
  | { available: true; version: string; platform: string }
  | { available: false; reason: string };

const AGENT_URL = "http://127.0.0.1:4317";
const TOKEN_KEY = "devops-programme-terminal-agent-token";

export function getLocalTerminalToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setLocalTerminalToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token.trim());
  } catch {
    // Best-effort local preference.
  }
}

export async function localTerminalAgentStatus(): Promise<LocalTerminalAgentStatus> {
  try {
    const request = new Request(`${AGENT_URL}/health`, {
      method: "GET",
      mode: "cors"
    } as RequestInit & { targetAddressSpace?: "loopback" });
    (request as Request & { targetAddressSpace?: "loopback" }).targetAddressSpace =
      "loopback";

    const response = await fetch(request);
    if (!response.ok) {
      return { available: false, reason: `Agent returned HTTP ${response.status}.` };
    }

    const body = await response.json();
    return {
      available: true,
      version: String(body.version ?? "unknown"),
      platform: String(body.platform ?? "unknown")
    };
  } catch {
    return {
      available: false,
      reason: "Local terminal agent is not running or browser local-network access is not available."
    };
  }
}

export async function runLocalTerminalTask(input: {
  taskId: string;
  platform: string;
  token: string;
}): Promise<MachineVerificationEnvelope> {
  if (!input.token.trim()) {
    throw new Error("Enter the local terminal agent pairing token first.");
  }

  const request = new Request(`${AGENT_URL}/execute`, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.token.trim()}`
    },
    body: JSON.stringify({
      taskId: input.taskId,
      platform: input.platform
    })
  } as RequestInit & { targetAddressSpace?: "loopback" });
  (request as Request & { targetAddressSpace?: "loopback" }).targetAddressSpace =
    "loopback";

  const response = await fetch(request);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(String(body.error ?? `Local terminal agent returned HTTP ${response.status}.`));
  }

  return body as MachineVerificationEnvelope;
}
