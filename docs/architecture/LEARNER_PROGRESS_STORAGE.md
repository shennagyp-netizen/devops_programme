# Learner Progress Storage

## Purpose

The database stores learner state, not terminal history.

A completion row means that one learner completed one learning item.

Supported learning item types:

- lesson
- assignment
- question
- project

## Stored data

The learner_completions table stores:

- learner identifier
- learning item type and identifier
- optional course/project context
- optional verification level
- server-generated completion timestamp

It does not store:

- terminal stdout
- terminal stderr
- command history
- failed attempts
- individual retries
- machine environment dumps
- evidence transcripts

Terminal output remains a transient UI result used to decide whether the required exercise passed.

## Flow

Browser -> /api/progress -> Drizzle ORM -> PostgreSQL.

The browser keeps only an anonymous learner identifier in local storage. The database is the authoritative source for completion state.

## Completion rule

A learner is complete for an item when a row exists for the tuple:

learner_id + item_type + item_id

The database enforces this with a unique index and the API uses an idempotent upsert.

## Current identity boundary

The current application has no authentication system. Therefore the learner identifier is an anonymous UUID stored in the browser.

This is appropriate for persistent progress for the same browser installation, but it is not an authenticated identity. Account login can later replace this identifier without changing the completion table's logical model.

## Database setup

Set DATABASE_URL=postgresql://...

Then from app/:

npm run db:migrate

The migration creates learner_completions.

The API is app/api/progress.ts.