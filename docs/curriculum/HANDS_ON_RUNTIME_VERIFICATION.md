# Hands-On Runtime Verification — V3

## Learner paths

Every hands-on task supports the normal manual path. Published machine-verifiable tasks may additionally use the local terminal agent.

### Manual path

1. choose the learner platform;
2. read the exact command;
3. run it in the learner terminal;
4. record observation/change/failure/recovery evidence;
5. validate the evidence structure in the browser.

### Local terminal-agent path

Run `npm run terminal-agent` from the project root.

The agent listens on `http://127.0.0.1:4317`.

The browser detects the agent, asks for the printed pairing token, sends the published taskId and selected platform, receives the structured machine-verification envelope, and validates the envelope against the same runtime task catalog.

The browser never sends arbitrary shell text.

## Agent execution boundary

The local agent loads `app/src/data/runtimeTasks.json`, resolves an exact task ID, verifies machine-verification status, rejects destructive steps, uses `shell: false`, enforces per-command timeouts, bounds stdout/stderr while streaming, validates the actual host platform, and produces hashes plus an environment fingerprint.

## Pairing token

The pairing token is a local execution credential. It is separate from the application account/session and must not be reused as an application login secret or sent to the Next.js server.

## Remote execution

The existing remote runtime tooling remains available for VM/SSH scenarios.

## Important distinction

A structurally valid machine-verification envelope is contract validation, not cryptographic attestation of physical execution.
