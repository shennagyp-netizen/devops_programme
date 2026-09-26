# Learner Progress Storage — V3 MVP

**Status:** authoritative for the V3 MVP.

## Application identity

The learner application uses simple first-party authentication: email/password registration, scrypt password hashing, opaque HTTP-only session cookie, and PostgreSQL-backed users and sessions.

There is no Clerk/OAuth/JWT learner identity system.

## Progress

The learner UI calls one Server Action. The server resolves the authenticated user from the session and stores completion in PostgreSQL.

The browser never supplies a trusted user ID.

The database uniqueness boundary is `user + item type + item ID`.

Duplicate completion is idempotent.

## Local terminal pairing

Terminal execution uses a second, deliberately separate credential: the local terminal-agent pairing token.

This token exists only to authorize the browser to call the learner's loopback terminal service. It is not an application login token.

The agent remains bound to `127.0.0.1` and accepts only runtime task IDs from `runtimeTasks.json`.

## Evidence

Manual learner evidence remains useful for instructional flow.

Machine evidence from the local agent is validated against the runtime task contract before it is recorded.

Neither browser-entered evidence nor a structurally valid runtime envelope should be presented as cryptographic certification.

## Machine execution

The learner can use the manual terminal path or install/run the local agent and pair the browser with its printed token.

The second path is part of V3 and must not be removed merely to simplify application authentication.
