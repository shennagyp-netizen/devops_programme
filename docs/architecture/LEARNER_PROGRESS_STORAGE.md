# Learner Progress History

## Purpose

The database stores learner completion history, not terminal history.

The learner is allowed to follow the programme in any order. The database therefore does not encode a required curriculum sequence.

One completion history row represents one learner completing one learning item.

## Stored row

The `learner_progress_history` table stores:

- learner identifier
- learning item type
- learning item identifier
- optional course and project context
- optional verification level
- server-generated completion time

The unique identity is:

`learner_id + item_type + item_id`

This guarantees at most one persistent history entry for the same learner and learning item.

## History order

The learner's real path is reconstructed from `completed_at`.

Example:

```text
10:12  D2.4
10:21  D1.3
10:46  D4.1
11:02  B1.2
```

The application does not assume that the curriculum was followed in its authored order.

The server returns history ordered by completion time.

## What is not stored

The progress database does not store:

- terminal stdout
- terminal stderr
- command history
- failed attempts
- retry history
- machine output dumps
- raw machine verification envelopes
- every intermediate interaction

Terminal output remains transient UI state. It is used to verify the current exercise and then discarded from persistent storage.

## Completion

Completion is append-once.

When the learner finishes an item, the website sends a completion event. The server performs an idempotent database upsert against the unique learner/item key.

A repeated completion does not create another history row and does not change the original `completed_at`.

The application therefore has:

```text
one learner
  +
one item
  =
one history entry
```

## Current identity boundary

The current application does not yet have authentication. The browser therefore keeps an anonymous learner UUID in local storage.

That UUID is only an identity key. It is not the progress store.

Once authentication is added, the same history model can use the authenticated learner ID without changing the learning-item model.

## API

Browser:

`GET /api/progress?learnerId=...`

`POST /api/progress`

The POST accepts only completion metadata. It does not accept or persist terminal output.

## Database

Database technology:

- PostgreSQL
- Drizzle ORM
- node-postgres

Environment:

`DATABASE_URL=postgresql://...`

Migration:

`app/drizzle/migrations/0000_learner_completions.sql`

The migration filename is retained for repository continuity; the created table is `learner_progress_history`.

