# Learner Progress Storage — V3 MVP

**Status:** authoritative for the V3 MVP.

V3 intentionally removes the account, session and database-backed learner-progress architecture.

## Architecture

The learner application is one React/Next.js application.

The progress path is:

```
Learner UI
   |
   v
browser-local state
   |
   v
localStorage
```

There is no learner identity authority.

There is no:

- account
- password
- session cookie
- learner UUID
- Server Action for progress
- progress REST API
- database progress record.

## Completion state

The browser stores lesson completion records under the local MVP progress key.

A completion record contains only learning metadata:

- item type
- item ID
- course
- project
- completion time
- `verificationLevel = structured`.

The browser never stores `machine-verified` completion.

Duplicate local completion of the same lesson is idempotent.

## Evidence

Hands-on evidence is also local browser state.

The current evidence validator checks:

- required fields
- minimum evidence lengths
- lesson/task structure.

It does not prove that commands were executed.

That distinction is intentional.

## Authentication

There is no authentication in the V3 MVP.

The learner gateway is public.

This is not an omission to be hidden: cross-device identity, paid entitlements, certification and secure transcripts are outside the MVP.

## AI tutor

The AI tutor is a same-application route backed by the configured AI Gateway.

The tutor does not use learner identity.

It receives only:

- selected lesson ID
- learning mode
- recent user questions.

The server reconstructs lesson context from authored curriculum data rather than trusting client-provided lesson metadata.

The client cannot submit assistant-role messages as authoritative conversation history.

Anonymous request throttling is a best-effort cost-abuse control, not authentication.

## Machine verification

Machine verification is not part of the V3 learner trust model.

The browser does not:

- pair with a local agent
- send a pairing token
- import remote machine evidence
- mark an exercise machine-verified.

Runtime verification contracts remain available as future engineering infrastructure but are not exposed as secure learner evidence.

## Migration note

Older documents described Clerk, first-party sessions, PostgreSQL progress and Server Actions. Those designs are superseded by `docs/MVP_ARCHITECTURE_V3.md`.

Do not reintroduce the old account architecture into V3 without an explicit product requirement and a new security review.
