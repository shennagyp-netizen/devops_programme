# Learner Progress Storage — V3 MVP

**Status:** authoritative for the V3 MVP.

## Architecture

The learner application is one React/Next.js application with a small first-party identity layer.

The progress path is:

```
Learner UI
   |
   v
Server Action
   |
   v
authenticated session
   |
   v
PostgreSQL / Drizzle
```

## Authentication

The MVP uses:

- email/password registration;
- scrypt password hashing;
- opaque HTTP-only session cookie;
- PostgreSQL-backed session records.

There is no Clerk, OAuth, JWT, or separate API-token scheme.

The browser never submits a trusted userId.

## Completion state

A completion record contains authenticated user identity, item type, item ID, course, project, verification level and completion time.

The database enforces one completion row per user + item type + item ID.

Duplicate completion is idempotent.

## Evidence

Hands-on evidence can remain locally structured for the immediate exercise experience.

The application must not present browser-entered evidence as cryptographic attestation or certification.

## API boundary

There is no custom progress REST API.

The browser uses the existing Server Action.

Input is parsed and bounded by progress-contract.ts.

## AI tutor

The tutor is integrated into the same application and does not introduce another learner authentication/token layer.

Its lesson context is resolved server-side from the authored curriculum.

## Machine execution

Terminal-agent pairing is intentionally outside the V3 MVP.

The MVP does not need a second token system just to preserve learner progress.

## Historical note

An earlier V3 simplification pass incorrectly removed authentication entirely. That was superseded.

The current V3 rule is: simple first-party authentication, no complex identity platform.
