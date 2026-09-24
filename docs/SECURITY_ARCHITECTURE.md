# Security Architecture and Red-Team Contract

## Scope

This document defines the security and integrity boundary for the learner-facing DevOps application.

The application has two different kinds of state:

1. Progress state — a learner request to record that a learning item is finished.
2. Execution evidence — evidence produced by manual, structured, local-machine or remote-machine work.

These are intentionally different. A progress row is not a certification record. A machine-verification envelope is not trusted merely because its JSON shape is correct.

## Identity authority

Clerk is the only learner identity authority.

The browser must never submit a learner ID as trusted data.

The Server Action:

1. obtains the current Clerk user ID
2. rejects unauthenticated requests
3. parses only the learning item type and item ID
4. resolves the item against canonical server-side programme data
5. derives course and project metadata
6. writes the authenticated user ID and derived metadata to PostgreSQL.

The browser cannot choose userId, course, projectId, or verificationLevel.

## Canonical learning-item authority

The authoritative resolver is app/src/lib/server/learning-item-catalog.ts.

It resolves:

- lessons from lessonsByCourse
- assignments from hands-on-<lessonId> identities
- projects from projects
- questions from the authored assessment bank ID contract.

Assessment question IDs are checked by the security contract against the actual exams/items/** source.

Current question identity rule:

- conceptual: 20 items per section
- diagnostic: 12 items per section
- hands-on: 8 items per section
- stable ID form is derived from section ID and family.

The build fails when an expected question ID is missing or when the authored question count is not the expected global total.

## Progress semantics

Persistent completion history uses authenticated user + item type + item ID.

PostgreSQL still enforces the unique identity and the allowed item types.

The server records verification_level = self-report for normal completion.

This is deliberate. The server knows that the authenticated user requested completion and that the learning item exists. The server does not know from the completion request that the learner actually performed the exercise.

The UI can require structured evidence before offering the completion button, but client-side state is not a security authority.

A user who directly invokes a valid Server Action can therefore record a real learning item as complete. This is treated as learner-owned progress, not trusted assessment grading.

Assessment scoring and certification must use a separate server-authoritative assessment path.

## Completion attack cases

The server must reject or neutralize:

- unauthenticated completion
- browser-supplied learner identity
- nonexistent lesson IDs
- nonexistent assignment IDs
- nonexistent project IDs
- nonexistent question IDs
- oversized item IDs
- client-selected course
- client-selected project
- client-selected verification level
- arbitrary terminal output
- arbitrary extra completion fields.

Database behavior remains append-once: user_id + item_type + item_id.

Duplicate completion is ignored. There is no browser-controlled delete or uncomplete operation.

## Runtime execution boundary

The browser can request only an exact runtime task ID.

The runtime catalog is app/src/data/runtimeTasks.json.

The local and remote runners:

- use shell: false
- execute catalog-defined programs and arguments
- reject destructive task steps
- enforce command timeouts
- bound captured stdout/stderr
- record exact task identity
- record step identity and order.

No browser input becomes shell text.

## Machine-evidence integrity

The runtime verifier now performs all of these checks:

- exact task identity
- exact contract version
- exact lesson identity
- supported platform
- source/execution-mode consistency
- target-type consistency
- SSH target identity
- strict SSH host-key policy
- runner identity presence
- environment fingerprint presence
- ordered execution window
- exact step count
- exact step order
- duplicate step rejection
- unknown step rejection
- bounded output
- valid SHA-256 encoding
- SHA-256 recomputation from captured stdout
- SHA-256 recomputation from captured stderr
- exit-code consistency
- pass-state consistency
- reset-state contract.

The reserved managed-runner source is rejected because no managed attestation service exists in the current system.

## Important trust limitation

Local and imported machine evidence is still not cryptographic remote attestation.

A learner who controls the machine and application runtime can fabricate a structurally valid report and recompute its hashes.

The current verifier therefore provides:

- strong contract validation
- tamper detection for edited captured output
- exact task consistency
- safer execution boundaries.

It does not provide:

- independent trusted execution
- secure remote attestation
- instructor-owned cryptographic signing
- an unforgeable proof that the learner personally performed the command.

A future managed runner must introduce an authenticated server-side evidence channel or a server-trusted attestation mechanism before machine evidence can be treated as independently authoritative.

## Local terminal pairing

The local terminal agent listens only on 127.0.0.1.

The browser pairing token is held in application memory and is not persisted in localStorage.

The local agent accepts CORS requests only from configured application origins.

Default development origins:

- http://localhost:3000
- http://127.0.0.1:3000

Additional origins must be explicitly configured with DEVOPS_TERMINAL_ALLOWED_ORIGINS.

A missing or untrusted Origin does not receive wildcard CORS headers.

The pairing token is still a bearer secret. XSS must therefore remain a critical security boundary.

## Browser hardening

The Next.js application disables the framework powered-by header and sends baseline browser security headers:

- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- X-Frame-Options: SAMEORIGIN
- Permissions-Policy
- X-DNS-Prefetch-Control: off.

A full production CSP is intentionally deferred until the Clerk and browser asset requirements are explicitly tested so that the security header does not accidentally block authentication or the learner experience.

## Assessment answer-key boundary

The learner client receives assessment blueprints, not authored answer keys.

The current AssessmentPanel renders:

- assessment family
- item count
- time budget
- cognitive levels
- difficulty distribution
- authoring/pilot status.

It does not import the exams/items/** answer-key content into the client.

Question authority remains server-side canonical data.

## CI security boundary

The GitHub workflow now:

- grants only contents: read
- uses actions/checkout
- does not construct an authenticated Git remote URL inside set -x
- runs the security architecture contract as an explicit gate.

Dependency reproducibility remains incomplete because the repository currently has no committed npm lockfile.

Do not claim deterministic dependency resolution until a real lockfile is committed and CI uses npm ci.

## Red-team test groups

### Identity

- missing Clerk user
- browser learner-ID injection
- user A cannot select user B
- whitespace and oversized identity fields
- unexpected object values.

### Authorization

- nonexistent learning item
- forged course
- forged project
- forged verification level
- question outside authored range
- assignment outside lesson set.

### Persistence

- SQL-shaped item IDs
- duplicate completion
- no overwrite of original completion time
- no terminal stdout/stderr persistence
- canonical metadata only.

### Runtime evidence

- wrong task
- wrong contract version
- wrong lesson
- wrong platform
- wrong execution mode
- wrong target kind
- managed-runner spoofing
- duplicate step
- unknown step
- reordered step
- missing required step
- fake SHA-256
- stale SHA-256 after output tampering
- invalid hash encoding
- timestamp inversion
- timestamp outside envelope
- non-zero exit reported as passed
- failed step accepted
- reset mismatch.

### Local terminal agent

- missing pairing token
- invalid pairing token
- disallowed Origin
- allowed Origin
- unknown task
- unsupported platform
- destructive task rejection
- shell injection attempts cannot become new process arguments.

### Browser state

- forged localStorage completion boolean
- malformed local evidence
- evidence revalidation after reload
- no persistent terminal pairing secret.

### CI

- security contract runs
- obsolete repository workspace paths absent
- credential-bearing remote checkout removed
- workflow permissions minimized.

## Security status

Implemented:

- authenticated learner identity
- server-authoritative item resolution
- derived trusted progress metadata
- self-report completion classification
- runtime output hash verification
- runtime step-order verification
- execution-window verification
- managed-runner fail-closed behavior
- local terminal CORS allowlist
- in-memory pairing token
- browser security headers
- security architecture contract
- extensive red-team unit/integration tests.

Not independently validated:

- hosted GitHub runner execution, because the observable runner currently fails before exposing workflow steps
- production Clerk configuration
- production database TLS and network policy
- production secret rotation
- independent machine attestation
- lockfile-based dependency reproducibility
## Local-agent cryptographic attestation

The direct browser-to-local-agent machine path now has an additional integrity boundary.

Before each execution the browser creates a fresh 32-byte random challenge.
The challenge is sent with the exact runtime task request.

The local agent generates an Ed25519 key pair for its process lifetime.
The private key never leaves the local agent process.
The execution envelope contains:

- the fresh browser challenge
- the exact runtime result
- the agent public key
- an Ed25519 signature over the canonical envelope payload.

The browser verifies the signature with Web Crypto before machine evidence can become `machine-verified`.

An old signed envelope cannot satisfy a new execution because the active browser challenge is different.

Changing stdout, stderr, task identity, platform, timestamps or other signed payload fields invalidates the signature.

Imported JSON and SSH-runner files remain `structured` / `imported-untrusted` and cannot become machine completion proof merely by passing structural validation.

## Evidence identity authority

The evidence recorder resolves the runtime task from the published runtime catalogue and resolves lesson/project identity from the canonical course data.

The browser cannot choose:

- runtime task identity
- course
- project
- manual verification level.

Manual evidence is always stored as `structured`.
Only the dedicated direct local-agent path can produce `machine-verified` evidence in the local ledger.
## Dependency security review — 2026-09-24

Public advisory review was performed against the pinned direct versions in `app/package.json`.

- Next.js 16.3.6 is at the patched version for the September 22, 2026 critical `next/og` ImageResponse RCE, and is newer than the 16.2.11 fixes for earlier 16.x advisories.
- `@clerk/nextjs` 7.9.4 is newer than the 7.2.1 and 7.2.4 patched boundaries in the 2026 Clerk middleware/authorization advisories reviewed.
- Drizzle ORM 0.45.3 is newer than the 0.45.2 SQL-identifier escaping fix.
- `pg` 8.23.0 currently reports no direct known vulnerabilities in the public database reviewed.
- Vitest 5.0.1 currently reports no direct known vulnerabilities in the public database reviewed.

Known limitation:

- the repository has no committed npm lockfile
- CI therefore installs a fresh dependency tree with `npm install`
- the CI security gate now runs `npm audit --audit-level=high`
- deterministic dependency resolution is not yet established.