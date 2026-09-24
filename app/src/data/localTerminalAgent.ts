import type { MachineVerificationEnvelope } from "./runtimeVerification";

export type LocalTerminalAgentStatus =
  | {
      available: true;
      version: string;
      platform: string;
      attestationPublicKey: string;
    }
  | { available: false; reason: string };

const AGENT_URL = "http://127.0.0.1:4317";

let pairingToken = "";

export function getLocalTerminalToken() {
  return pairingToken;
}

export function setLocalTerminalToken(token: string) {
  pairingToken = token.trim();
}

export function createExecutionChallenge() {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Secure browser randomness is unavailable.");
  }

  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function localTerminalAgentStatus(): Promise<LocalTerminalAgentStatus> {
  try {
    const request = new Request(`${AGENT_URL}/health`, {
      method: "GET",
      mode: "cors",
      targetAddressSpace: "loopback"
    } as RequestInit & { targetAddressSpace: "loopback" });

    const response = await fetch(request);
    if (!response.ok) {
      return { available: false, reason: `Agent returned HTTP ${response.status}.` };
    }

    const body = await response.json();
    const attestationPublicKey = String(body.attestation?.publicKey ?? "");

    if (!attestationPublicKey) {
      return {
        available: false,
        reason: "Local terminal agent did not publish an attestation public key."
      };
    }

    return {
      available: true,
      version: String(body.version ?? "unknown"),
      platform: String(body.platform ?? "unknown"),
      attestationPublicKey
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
  challenge: string;
}): Promise<MachineVerificationEnvelope> {
  if (!input.token.trim()) {
    throw new Error("Enter the local terminal agent pairing token first.");
  }

  if (!/^[a-f0-9]{64}$/i.test(input.challenge)) {
    throw new Error("A valid execution challenge is required.");
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
      platform: input.platform,
      challenge: input.challenge
    }),
    targetAddressSpace: "loopback"
  } as RequestInit & { targetAddressSpace: "loopback" });

  const response = await fetch(request);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(String(body.error ?? `Local terminal agent returned HTTP ${response.status}.`));
  }

  return body as MachineVerificationEnvelope;
}
