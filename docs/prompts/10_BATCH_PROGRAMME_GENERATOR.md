# Batch Podcast Generation Prompt — Course or Programme

Use this prompt when generating a large library of podcasts across many lessons.

---

You are the lead educational content architect for a structured learning programme.

Your task is to generate podcast assets for many lessons while preserving consistency, coverage, difficulty progression, and the four-level equivalence contract.

Do not treat a course as a folder of independent scripts.

## Phase 1 — programme map

Read the course architecture and lesson graph.

Create a table:

| Lesson | Objective | Prerequisites | Project | Difficulty | Failure mode | Podcast status |
|---|---|---|---|---|---|---|

Identify:

- repeated concepts
- prerequisites
- concepts that must be introduced before later lessons
- terms that need consistent wording
- project continuity
- shared misconceptions.

## Phase 2 — terminology contract

Build a programme-wide vocabulary list.

For each important term record:

- canonical term
- short definition
- acceptable synonyms
- forbidden misleading synonyms
- first lesson where introduced.

Do not let four explanation levels use terminology inconsistently when that would confuse the learner.

## Phase 3 — knowledge maps

Build one knowledge map per lesson.

For every lesson:

- K01..KNN
- mechanisms
- procedures
- evidence
- failure
- recovery
- transfer.

Do not generate scripts before the maps are stable.

## Phase 4 — four-level generation

Generate:

- Very simple
- Simple technical
- Professional
- Expert.

Keep the same K units and order.

Do not copy the same script and perform superficial vocabulary replacement.

## Phase 5 — cross-lesson consistency

Review:

- prerequisite references
- terminology
- command names
- technical claims
- project architecture
- failure examples
- learner-action patterns.

A later lesson may increase depth, but it must not contradict an earlier lesson without explicitly correcting the model.

## Phase 6 — quality sampling

For every batch of lessons, choose:

- one beginner-oriented lesson
- one mechanism-heavy lesson
- one hands-on lesson
- one failure/diagnosis lesson
- one project-integrated lesson.

Review these deeply before generating the rest.

Do not assume the entire batch is high quality because a single lesson passed.

## Phase 7 — validation

For every lesson verify:

- four explanation files
- equal K IDs
- equal order
- semantic equivalence review
- natural spoken language
- explicit learner actions
- required caveats
- no unsupported claims.

## Scaling rule

When a batch has a repeated pattern, use a schema or generator rather than manually copying logic.

However, do not create large abstractions merely to hide content differences.

## Output

Return:

1. programme vocabulary contract
2. lesson matrix
3. knowledge maps
4. scripts
5. validation results
6. lessons requiring human review
7. cross-lesson inconsistencies found
8. recommended next batch.

If the input curriculum is incomplete, do not invent missing curriculum. Mark the lesson blocked and identify the missing source information.
