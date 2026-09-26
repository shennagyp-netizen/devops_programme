# DevOps Programme V3 — MVP Architecture and Security Boundary

**Status:** authoritative MVP architecture
**Date:** 2026-09-26
**Scope:** learner application, simple authentication, progress, mastery evidence and AI tutor

## Product boundary

V3 is one React/Next.js application.

The MVP uses deliberately simple first-party authentication:

- email + password;
- passwords hashed with scrypt;
- one opaque HTTP-only session cookie;
- PostgreSQL stores users, sessions and learning progress;
- no Clerk;
- no OAuth provider;
- no JWT;
- no API authentication tokens;
- no terminal pairing tokens.

This is authentication, but not a large identity platform.

## Learner gateway

The public marketing site is public.

The /learn gateway requires the simple first-party session.

The browser never supplies a trusted learner ID. The server derives the learner identity from the session.

## Progress

Learner progress is server-authoritative per authenticated account.

Completion writes use one Server Action.

The uniqueness boundary is user + item type + item ID.

Repeated completion of the same item is idempotent.

Progress does not expose a custom REST API.

## Mastery

Mastery remediation may use browser-local state for immediate instructional flow, while authenticated mastery-attempt history can be recorded server-side when the application uses the existing progress action contract.

Neither mechanism is a certification authority.

## Hands-on verification

The MVP learner flow is intentionally simple:

1. show the platform-specific command;
2. learner runs it manually;
3. learner enters the structured evidence;
4. browser validates the learning contract.

The MVP does not need terminal-agent pairing to support the core learning experience.

Local terminal-agent execution and remote machine-verification infrastructure are outside the authentication design and should not be added merely for MVP progress.

## AI tutor

The tutor is part of the same Next.js application.

Its server route derives lesson context from authored curriculum, treats learner messages as untrusted content, keeps the AI Gateway credential server-side, bounds request size, applies best-effort abuse throttling, and does not require a second authentication/token system.

The authenticated session may identify the learner at the application boundary, but the tutor does not need a separate tutor token.

## Security model

public marketing -> simple session -> authenticated learning app -> server progress

The security goals are:

- protect learner accounts and saved progress;
- never trust client-supplied learner IDs;
- never store plaintext passwords;
- keep the session cookie HTTP-only;
- use same-site cookie protection;
- avoid unnecessary authentication schemes;
- prevent arbitrary shell execution;
- keep provider credentials server-side;
- validate all Server Action inputs.

## Explicit non-goals

Do not add:

- Clerk;
- social login;
- OAuth infrastructure;
- JWT access/refresh token systems;
- API-key-based learner authentication;
- terminal pairing tokens.

When paid entitlements, instructor roles, certification, admin access or multi-service API clients become real requirements, extend this architecture deliberately rather than adding another parallel auth system.
