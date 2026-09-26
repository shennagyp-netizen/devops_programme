# Project Integrity Audit

**Audit date:** 2026-09-26  
**Scope:** V3 MVP repository documents, application contracts, learner-state boundary, tutor boundary and executable validation.

## Current architecture

V3 is a single React/Next.js learner application.

The public learning gateway does not require an account.

Learner completion, hands-on evidence and mastery-remediation attempts are browser-local state. They are intentionally non-authoritative.

The application does not use learner sessions, learner IDs or terminal-agent pairing tokens.

The AI tutor is a same-application server relay over public curriculum data. It uses strict request parsing, user-only message roles, bounded request size and best-effort anonymous rate limiting.

## Security boundary

The MVP makes a deliberate distinction between:

**Learning state**
- browser-controlled
- useful for continuity during local use
- resettable by clearing site storage
- not suitable as a certificate, transcript or entitlement record.

**Execution evidence**
- manual learner execution
- structured browser validation
- no machine-verification claim.

**Authored curriculum**
- repository-controlled
- server-resolved by lesson ID for tutor context
- not mutated by the tutor.

## Vulnerabilities removed

1. **Self-hosted account/session authority removed.** The previous password/session/database learner identity path is no longer reachable from the application and its source layer has been removed.
2. **Forged server mastery removed.** There is no Server Action accepting learner-supplied `mastered` results.
3. **Forged machine-verification completion removed.** The learner app stores only `structured` completion evidence.
4. **Local terminal pairing-token authority removed.** The browser no longer stores or submits a terminal-agent token.
5. **Remote machine evidence import removed.** JSON evidence cannot be promoted to learner completion through the UI.
6. **Client-forged tutor assistant roles rejected.** The tutor contract accepts only user messages.
7. **Tutor request size is bounded and anonymous rate limiting is applied.** The limiter is intentionally best-effort because the MVP has no authenticated identity.
8. **Tutor context is server-derived from authored lesson data.** Client-provided lesson title, objective or domain are not trusted.
9. **Completion is explicitly local/non-authoritative.** This removes the false security promise of a server-backed progress transcript from the MVP.

## Accepted MVP limitations

- Browser local storage can be modified by the learner.
- Progress does not synchronize between devices.
- The public tutor can be abused by distributed clients; deployment/provider spending limits remain necessary.
- The tutor is not a private personal-data service.
- Assessment item pools remain pilot content and are not a certification delivery system.
- Machine verification is deferred.

These are product boundaries, not hidden security assumptions.

## Validation expectation

The authoritative gate for this branch must confirm:

- curriculum/content contracts
- assessment/diagnostic/project contracts
- local MVP architecture contract
- tutor red-team contracts
- unit/integration tests
- TypeScript
- Next.js production build.

A green test suite must not be interpreted as secure certification infrastructure.

## Future architecture trigger

Introduce authenticated durable state only when at least one of these becomes a real requirement:

- paid entitlement
- cross-device history
- certification
- secure learner transcript
- instructor/admin access
- trusted machine attestation.

That future change requires a new threat model rather than restoring the removed V3 account code.
