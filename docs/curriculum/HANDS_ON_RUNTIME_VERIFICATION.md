# Hands-on Runtime Verification

## Boundary

The browser application does not execute learner shell commands directly.

A separate local or managed runner is responsible for executing an allowlisted task protocol and returning a machine-verification envelope.

The envelope contains:
- stable task and lesson identity
- platform
- runner version
- environment fingerprint
- start/end timestamps
- per-step exit/result state
- stdout and stderr hashes
- reset completion when the task requires it

The application accepts machine-verified evidence only when the envelope is structurally valid for the exact task contract.

## Current state

The repository contains:
- the transport-neutral runtime task contract
- the fail-closed machine-verification envelope validator
- a local runner for B1.2

The local runner defaults to dry-run. Actual execution requires explicit --execute.

From the app directory, the runner can be invoked as:

npm run hands-on:run -- --execute --task=hands-on-B1.2

The B1.2 task is intentionally non-destructive: DNS resolution and an HTTPS connectivity check.

Running the command on a learner machine can produce machine-verification evidence for those two observations. The repository does not claim that a learner has already run it merely because the runner exists.

## Safety

Runtime tasks use an explicit command allowlist. Destructive operations are represented explicitly in the task model rather than accepting arbitrary shell text.

A future runner must:
1. resolve the exact task ID
2. select the platform command definition
3. enforce timeout and scope
4. execute only the allowlisted operation
5. hash captured output
6. return a signed or otherwise authenticated envelope
7. perform and report required reset operations

No browser-side feature should bypass this boundary and execute arbitrary commands.
