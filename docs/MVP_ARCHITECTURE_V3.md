# DevOps Programme V3 — MVP Architecture and Security Boundary

**Status:** authoritative MVP architecture
**Date:** 2026-09-26
**Scope:** learner application, simple authentication, local terminal integration, progress and AI tutor

## Product boundary

V3 is one React/Next.js application with a deliberately small first-party account layer.

Authentication uses email/password, scrypt password hashing, one opaque HTTP-only session cookie, and PostgreSQL users/sessions/progress.

There is no Clerk, OAuth, JWT or separate learner API-token system.

## Local terminal integration

The MVP also supports the existing local-terminal workflow.

From the project root run `npm run terminal-agent`.

The agent listens only on `127.0.0.1`, prints a random pairing token, accepts only catalog-defined runtime task IDs, validates the selected platform against the actual host platform, executes allowlisted commands with `shell: false`, and returns structured machine-verification evidence.

The browser checks `http://127.0.0.1:4317/health`, lets the learner paste the pairing token, stores that pairing token only in browser local storage, and sends only `taskId`, `platform` and the Bearer pairing token to the loopback agent.

The browser never sends arbitrary shell commands.

The terminal pairing token is a local-machine execution credential, not the learner account/session credential.

## Progress

Saved course completion remains bound to the authenticated account.

The browser never supplies a trusted learner ID. The server derives the learner from the application session and writes progress through the existing Server Action.

Completion uniqueness is `user + item type + item ID`; duplicate completion is idempotent.

## Hands-on verification

The learner has two paths: manual platform-specific terminal execution with structured evidence, or verified local terminal-agent execution for published runtime tasks.

Machine verification is only available for catalog-defined tasks whose runtime contract declares `machine-verified`.

The runtime envelope is structurally validated before evidence is recorded.

Structural validation is not cryptographic attestation.

## Security model

`public programme -> simple account session -> learner app -> progress`

and separately:

`learner browser -> loopback agent + pairing token -> allowlisted runtime task`

These are two different trust boundaries. Do not replace the local terminal pairing token with the learner account session.

## Explicit non-goals

Do not add Clerk, social login, OAuth, JWT access/refresh infrastructure, or a general API-token identity system merely for the MVP.

Do not allow arbitrary shell commands from the browser.
