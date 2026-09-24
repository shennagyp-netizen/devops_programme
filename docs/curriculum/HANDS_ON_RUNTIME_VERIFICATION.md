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

The repository now contains the transport-neutral runtime task contract and fail-closed envelope validator.

The current implementation does not claim that a runtime runner is deployed or that any learner command has already been machine-verified.

The first runner-ready task is the request-path observation for B1.2. It is intentionally non-destructive: DNS resolution and an HTTPS connectivity check.

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
