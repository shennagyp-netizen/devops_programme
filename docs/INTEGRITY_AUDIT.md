# Project Integrity Audit

**Audit date:** 2026-09-26
**Scope:** V3 MVP learner identity, progress, tutor and hands-on boundaries.

## Current architecture

V3 is a single React/Next.js learning application with simple first-party authentication.

The application uses:

- email/password;
- scrypt password hashing;
- an opaque HTTP-only session cookie;
- PostgreSQL/Drizzle for users, sessions and progress.

It does not use Clerk, OAuth, JWT or a separate API-token identity system.

## Important security boundary

The browser cannot choose the learner identity used for saved progress.

The server obtains the learner from the authenticated session.

Completion writes validate their input and bind the record to that server-derived user.

## Complexity deliberately removed

- external identity provider;
- OAuth/social login;
- JWT access/refresh infrastructure;
- custom progress REST API;
- terminal pairing-token authentication;
- a second auth system for the tutor.

## Remaining MVP limitations

- account recovery is not yet a product feature;
- email verification is not required for the MVP;
- there is no role/admin system;
- session management is intentionally small;
- browser-entered hands-on evidence is not machine attestation.

These are explicit MVP boundaries.

## Red-team rules

The tests must reject:

- client-supplied learner IDs;
- plaintext password storage;
- insecure session cookies;
- cross-user progress access;
- unauthenticated access to /learn;
- forged progress records;
- arbitrary shell execution through the learner UI.

The tutor must also:

- derive lesson context server-side;
- reject malformed/oversized requests;
- keep provider credentials server-side.

## Validation expectation

The repository gate must pass:

- content and curriculum contracts;
- authenticated progress architecture contract;
- unit/integration tests;
- TypeScript;
- Next.js production build.

Authentication is part of the MVP security boundary. Removing it is not a security improvement; it would remove the learner identity required for persistent progress.
