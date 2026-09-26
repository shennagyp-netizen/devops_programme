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
- client-forged tutor assistant roles.

The local terminal-agent red-team contract must verify:
- loopback-only binding;
- bearer pairing-token requirement;
- exact runtime task lookup;
- no shell execution;
- destructive-step rejection;
- bounded command output.

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
- local runtime-runner behavior
- execution of repository contract validators as real child processes
- the corrected Docker mapping D2.5/D2.6/D2.7 -> I-A1
- real PostgreSQL authentication/session behavior
- real PostgreSQL learner-progress idempotency
- real PostgreSQL assessment-attempt ownership and submission lifecycle
- browser-to-local-terminal pairing and machine-verification flow through the actual localhost agent

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

Runtime verification is now a real MVP path for published tasks, while manual execution remains the universal fallback.

- the browser polls the localhost terminal agent on 127.0.0.1:4317;
- the learner supplies the agent's separate pairing token;
- the browser submits only the exact catalog task ID and platform;
- the local agent executes catalog-defined non-destructive commands with shell execution disabled;
- the returned machine-verification envelope is validated against the same runtime task contract before evidence is recorded;
- CI starts the real terminal agent and exercises this path through Playwright;
- manual terminal execution remains available for every hands-on task;
- SSH/remote execution remains optional and separate from the browser-to-localhost MVP path.

Runtime contract validation continues to fail closed for malformed task definitions, identity mismatches, unsupported platforms, invalid step results, invalid timing and missing hashes.


## Current V3 MVP verified gate — 2026-09-26

Branch under review: `v3-real-user-e2e`

Authoritative latest commit: `6acc0b9ff3d64ab5be436495de1b406326f07be7`

Verified GitHub Actions gates for the current branch sequence:

- disposable PostgreSQL 16 service starts successfully;
- migrations/bootstrap complete successfully;
- full unit + integration suite: PASS (472 tests);
- TypeScript typecheck: PASS;
- Next.js production build: PASS;
- browser E2E: PASS (9/9 tests);
- browser E2E runs the real localhost terminal agent with the fixed CI pairing token;
- all browser authentication, assessment, gateway, terminal-pairing, tampering and concurrent-attempt scenarios pass.

The browser E2E command itself reported:

- 9 tests passed;
- total browser execution ~16 seconds after build and dependency setup.

This gate is stronger than a source-only contract check because the same CI workflow starts PostgreSQL, builds the application, starts the terminal agent, and drives the learner application through Chromium.

## Integration test architecture

The real-database integration suite is:

`app/tests/integration/database-real.integration.test.mjs`

It is enabled whenever `DATABASE_URL` is provided and runs against the disposable CI PostgreSQL database. It verifies:

- password hashing and hashed session persistence;
- session restoration through the HTTP-only session cookie;
- logout/login lifecycle;
- one completion-history row for repeated completion of the same learner item;
- assessment attempt ownership by authenticated user;
- one active assessment form per user/form;
- cross-user submission rejection;
- server-owned answer-key behavior;
- final submission state and stored answer JSON.

The suite intentionally mocks only Next.js cookie plumbing. Database access, schema constraints and server-domain functions remain real.

## Real-user browser coverage

The Playwright suite in `app/e2e/` now exercises:

- public programme page and anonymous /learn protection;
- account creation, sign-out and re-login;
- course and platform switching;
- Learn / Do / Recall / Design / Assessment mode navigation;
- assessment start, answer, mark-for-review, navigation and final submission;
- browser-originated assessment item injection rejection;
- second-tab concurrent assessment protection;
- localhost terminal-agent availability and pairing;
- actual machine-verification execution through the local agent;
- rendered learner terminal evidence returned by the agent.

Browser tests must use visible user-facing controls rather than implementation-detail clicks on hidden Mantine inputs. The product itself is tested for real interaction; `force` clicks are not used to hide UI blockers.

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
