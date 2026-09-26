# Test Architecture

## Purpose

The programme uses invariant-based unit and integration testing instead of sequential manual debugging.

The governing rule is:

> Test the architecture as a system, not the latest error as an isolated bug.

## V3 MVP security architecture

The current learner trust model is intentionally simple first-party authentication.

Security/integrity tests must reject:

- client-supplied learner IDs;
- plaintext password storage;
- insecure session cookies;
- cross-user progress access;
- unauthenticated access to /learn;
- terminal pairing-token authentication;
- client-forged tutor assistant roles.

The tutor server remains responsible for:

- strict request parsing
- server-derived curriculum context
- bounded request size
- same-origin protection
- best-effort anonymous throttling
- keeping the AI Gateway credential server-side.

Learner completion is server-authoritative for the authenticated account. Hands-on evidence remains educational evidence and must not be described as machine attestation unless a future verified execution adapter is actually enabled.


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

The runtime catalog remains future infrastructure.

The learner UI does not invoke machine verification in V3. Manual terminal execution plus structured evidence is the current learner path.

Contract validation must still fail closed for malformed runtime task definitions and envelopes because those contracts will support future execution adapters.

## CI interpretation

The authoritative CI result is the GitHub Actions workflow run for the exact commit under review.

For the 2026-09-26 Kiro → Podcast V2 merge:
- run 36233862079 passed;
- curriculum/programme contracts passed;
- full unit + integration tests passed;
- TypeScript typecheck passed;
- Next.js production build passed.

Temporary runner-isolation probes may be used only as diagnostic tooling and must be removed after the failure mode is understood. A probe is never a substitute for the canonical programme gate.

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


## Current verified gate — 2026-09-26

Merged PR #116:
- main merge commit: `29f3b276caea6d6b17d9d8e04d790ebe030d8115`
- GitHub Actions run: `36233862079`
- final gate: PASS
- 459 tests verified across the corrected V2 sequence
- TypeScript: PASS
- Next.js production build: PASS

Vercel status is tracked separately. The current merged-main production deployment reports BUILD_UTILS_SPAWN_1 with "npm run build" exited with 1; the connector session does not expose the underlying Vercel build log. GitHub CI for the same application state is green, including the production build.
