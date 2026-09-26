# Test Architecture

## Purpose

The programme uses invariant-based unit and integration testing instead of sequential manual debugging.

The governing rule is:

> Test the architecture as a system, not the latest error as an isolated bug.

## Current authored programme graph

- 3 courses
- 21 sections
- 53 lessons
- 9 projects
- 21 prerequisite diagnostics
- 21 pilot assessment banks
- 840 pilot assessment items

## Unit coverage

Current unit suites cover:

- assessment blueprint invariants
- diagnostic definitions and thresholds
- evidence-ledger storage, filtering, idempotency and verification metadata
- hands-on task selection and evidence validation
- podcast synchronization fail-closed behavior
- runtime task lookup and machine-verification envelope validation

## Integration coverage

Current integration suites cover:

- the full three-course programme graph
- all 21 sections
- all 53 authored lessons
- all 9 projects
- all 21 diagnostics
- all 21 pilot banks
- global assessment-item uniqueness
- 15% / 35% / 35% / 15% difficulty distribution
- hands-on assessment evidence contracts
- Windows platform coverage
- spoken lesson coverage and cue parsing
- runtime task catalog consistency
- local runtime-runner dry-run behavior
- execution of repository contract validators as real child processes
- the corrected Docker mapping D2.5/D2.6/D2.7 -> I-A1

## Negative-test doctrine

Tests should reject classes of corruption, not merely reproduce known bugs.

Priority mutation cases include:

- missing section
- missing lesson
- wrong section-to-lesson mapping
- wrong project mapping
- orphan diagnostic
- invalid remediation reference
- missing assessment bank
- wrong bank section identity
- duplicate assessment ID
- invalid difficulty distribution
- missing spoken asset
- missing platform adapter
- malformed podcast manifest
- runtime task identity mismatch
- runtime contract-version mismatch
- missing runtime step
- failed runtime step
- missing machine-output hashes

Fixture mutations are preferred over destructive edits to the main source.



## 4.1 Curriculum-to-illustration binding tests

The curriculum-to-illustration relationship is an architectural contract and must be tested as a graph, not only as isolated animation components.

Minimum coverage for the binding layer:

- lesson content item resolves to an existing illustration binding
- illustration binding resolves to an existing animation capability
- every binding voice cue exists in the lesson's authored voice timeline
- every binding animation event exists in the referenced animation
- interactive lesson items resolve every interaction capability
- required interaction steps are unique and ordered
- required steps have reachable success/completion conditions
- invalid bindings fail closed rather than falling back to a generic illustration
- the same reusable animation may be bound by multiple lessons without lesson IDs entering the reusable animation definition
- curriculum order remains authoritative over animation capability order.

Red-team mutations should include missing bindings, stale animation IDs, unknown cue/event/interaction IDs, duplicate interaction order, bypassable required steps, impossible transitions and silent fallback attempts.

Visual/browser validation remains separate from contract correctness. Passing binding and animation tests does not constitute browser visual validation.

## Runtime verification

The canonical runtime task source is:

app/src/data/runtimeTasks.json

Runtime types, lookup and validation are:

app/src/data/runtimeVerification.ts

The local runner is:

scripts/run-runtime-task.mjs

The browser must never execute arbitrary learner shell commands.

## Build policy

The build runs, in order:

1. podcast synchronization
2. content validation
3. assessment validation
4. diagnostic validation
5. project validation
6. platform validation
7. hands-on contract validation
8. Beginner completeness
9. Intermediate completeness
10. Advanced completeness
11. global programme completeness
12. runtime contract validation
13. unit tests
14. integration tests
15. TypeScript compilation
16. Next.js production build

A failure in an invariant test blocks the build.

## CI interpretation

The current GitHub Actions runner is not considered green because the connector exposes no workflow steps or artifacts for the latest failed build.

Do not infer which application stage failed when the runner does not expose that evidence.

Temporary runner-isolation probes were used previously and removed after they established that the environment could fail before useful application diagnostics became observable.

## Future testing requirement

When adding a feature, add:

1. unit tests for pure logic
2. integration tests for cross-module contracts
3. negative tests for the failure modes that could corrupt the architecture
4. documentation updates for the affected contract

Do not return to one-error-at-a-time debugging.


## Four explanation-level podcast TTS versions — 2026-09-26

The fixed podcast contract is one authored podcast concept with four complete explanations of the same information:
1. Very simple
2. Simple technical
3. Professional
4. Expert

Every explanation must cover the same information-unit set in the same order. B1.4 uses 12 authored information units and a build-time equivalence checker.

Speech speed is an independent presentation control: 1×, 1.25×, 1.5×, and 2×.

Required tests:
- reject bundles missing one explanation level
- reject duplicate or mismatched explanation identities
- preserve independent script hashes
- verify all four scripts declare the same information-unit IDs in the same order
- verify TTS speaks the selected authored text
- verify 1×, 1.25×, 1.5×, and 2× change only speech rate
- verify speed changes never select, skip, reorder, or shorten learning content
- verify changing speed during speech restarts the current authored turn rather than skipping it
- verify unsupported rates are rejected by the pure domain contract
- verify transcript fallback when browser TTS is unavailable
- verify no MP3, WAV, audio URL, or recording manifest is part of podcast generation
- verify the private LLM tutor remains outside podcast generation
