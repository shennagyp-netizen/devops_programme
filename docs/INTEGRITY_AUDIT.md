# Project Integrity Audit

**Audit date:** 2026-09-26

## Current architecture

V3 has two intentionally separate security boundaries.

### 1. Application account

Simple first-party email/password authentication with scrypt, HTTP-only session cookie, and PostgreSQL progress.

### 2. Local terminal execution

The learner may install a loopback terminal agent. It uses a separate random pairing token for browser-to-local-agent authorization.

The token is not interchangeable with the account session.

The agent listens only on 127.0.0.1 and resolves execution from the authored runtime task catalog.

## Security requirements

The application must reject client-supplied learner IDs, insecure password handling, insecure session cookies, unauthenticated learner progress access, and arbitrary browser-supplied shell commands.

The local agent must reject missing/incorrect pairing tokens, unknown runtime task IDs, unsupported platform values, platform mismatch, destructive runtime commands, and malformed request bodies.

Its stdout/stderr are bounded while streaming so a verbose command cannot grow without limit.

## Accepted MVP limitations

Email verification and account recovery are not yet implemented. There is no role/admin system. The local pairing token is intentionally a local execution credential. Browser-entered evidence is not cryptographic attestation.

## Key design rule

Do not conflate application authentication with local terminal authentication.

The application session protects the learner account. The terminal pairing token protects the localhost execution bridge.
