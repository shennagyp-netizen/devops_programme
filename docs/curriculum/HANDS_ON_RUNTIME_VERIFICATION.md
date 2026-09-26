# Hands-On Runtime Verification — V3 MVP Boundary

## Current MVP

The learner application supports **manual execution plus structured evidence**.

For every hands-on task:

1. the learner selects the platform;
2. the app shows the platform-specific command;
3. the learner runs the command in their own terminal;
4. the learner records observations, changes, failure and recovery;
5. the browser validates the evidence structure;
6. the browser stores that evidence locally.

The browser does not execute arbitrary learner shell commands.

## Machine verification is deferred

The V3 MVP intentionally does not expose:

- a local terminal agent
- pairing tokens
- browser-to-laptop authenticated execution
- remote evidence JSON import
- machine-verified completion.

The previous local-agent design required a pairing token and introduced a second trust boundary. That complexity is outside the MVP.

## Runtime catalog remains future infrastructure

`app/src/data/runtimeTasks.json` remains the canonical catalog for future machine-verification work.

`app/src/data/runtimeVerification.ts` remains the contract/validator for future execution adapters.

These files do not authorize learner completion by themselves.

A runtime envelope validated only for shape must never be described as cryptographic attestation.

## Future execution boundary

When machine verification becomes a product requirement, the execution service must:

- resolve an exact task identity;
- accept only catalog-defined operations;
- never accept arbitrary shell text;
- enforce platform, timeout and destructive-operation policy;
- authenticate execution provenance;
- verify reset state where required;
- bind the resulting evidence to the actual learner task attempt.

That future feature is an explicit architecture change, not part of V3.
