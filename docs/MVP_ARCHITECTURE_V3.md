# DevOps Programme V3 — MVP Architecture and Security Boundary

**Status:** authoritative MVP architecture  
**Date:** 2026-09-26  
**Scope:** learner application, progress, mastery evidence and AI tutor

## Product boundary

V3 is intentionally a single React/Next.js learning application.

The MVP does **not** provide:

- accounts
- sign-in or sign-out
- password storage
- session cookies
- learner IDs
- pairing tokens
- cross-device progress
- server-authoritative mastery
- certification-grade assessment security
- machine-verification claims

A learner can open `/learn` directly.

## Learner state

Progress, exercise evidence and mastery-remediation attempt counts are browser-local `localStorage` state.

The browser is therefore the authority for **personal MVP learning state only**.

Clearing browser/site storage resets the local history. Another device has independent state.

This is acceptable because the MVP does not claim the state is a secure record, certificate, transcript or paid-entitlement ledger.

## Completion semantics

A lesson becomes locally complete only after the current hands-on evidence contract is validated in the browser.

The stored verification level is always:

`structured`

The browser must never create or store `machine-verified` completion.

Client-controlled local completion is not an authorization boundary.

## Hands-on execution

The MVP shows exact platform commands and validates learner-entered structured evidence.

The following are disabled in the application:

- local terminal-agent execution
- local pairing-token authentication
- remote JSON evidence import
- machine-verification claims

Runtime verification contracts and CLI runners may remain in the repository as future work, but they are not part of the MVP learner trust model.

## AI tutor

The tutor is a public curriculum assistant, not a private authenticated account service.

The server route:

- receives a lesson ID and user questions
- resolves the lesson only from the public authored curriculum
- never receives or trusts a learner identity
- accepts only user-role conversation turns
- caps request body size
- applies anonymous IP-based best-effort throttling
- uses the server-held AI Gateway credential when configured
- never stores tutor requests in the application database

The rate limiter is intentionally a cost-abuse control, not a security identity system. Production deployment should additionally enforce provider/API spending limits.

The tutor must not be described as private account-bound data.

## Evidence and mastery

Mastery remediation is an instructional mechanism, not a trusted credential.

A learner-entered result can influence:

- which remediation explanation is shown
- which local attempt count is displayed
- whether the current local exercise gate opens

It cannot establish an authoritative certification result.

## Security model

The MVP security model is:

`public application -> strict input contracts -> local browser state -> public curriculum tutor relay`

There is no authenticated learner trust boundary.

The main security goals are therefore:

- prevent arbitrary command execution
- prevent server-side prompt/context injection
- bound AI request size and rate
- avoid storing secrets in browser state
- prevent client-forged assistant roles
- fail closed on malformed authored/runtime contracts.

## Explicit non-goals

Do not add an account/session system merely to make local progress look authoritative.

When durable identity, paid entitlements, cross-device state, certification, or secure machine attestation become product requirements, design that as a separate architecture change with new threat modeling and tests.
