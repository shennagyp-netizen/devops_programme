# Knowledge Map Generator Prompt

Use this prompt when the canonical information model for a podcast lesson has not yet been written.

---

Create the source-of-truth knowledge model for one educational podcast lesson.

The output will be used by another AI to generate four different explanations of the same lesson.

## Inputs

You will receive:

- lesson ID
- lesson title
- course
- section
- objective
- prerequisites
- source lesson text
- exercises
- project context
- visual context
- assessment context.

Read the repository contract before generating the map.

## Rule: no script writing

Do not write the podcast script yet.

Do not start with prose.

First model the information.

## Knowledge unit definition

A knowledge unit is the smallest useful semantic unit that must survive all four explanation levels.

Examples:

- a definition
- a causal relationship
- a boundary
- a procedure
- a diagnostic test
- a warning
- a recovery step
- a transfer principle.

Do not create a unit for a trivial sentence.

Do not merge unrelated concepts merely to reduce the number of IDs.

## For every K unit provide

| Field | Requirement |
|---|---|
| ID | Stable K01...KNN |
| Concept | Plain statement |
| Category | fact / mechanism / procedure / reasoning |
| Must-teach | Yes/no |
| Prerequisites | Required earlier ideas |
| Learner action | Exact action if any |
| Evidence | What the learner should observe |
| Failure signal | Expected symptom if applicable |
| Recovery | Expected repair if applicable |
| Caveat | Important limitation |
| Misconception | Likely wrong mental model |
| Transfer | Where the idea should apply later |

## Causal integrity

For mechanisms, explicitly capture:

cause
-> mechanism
-> observable effect.

For diagnosis:

symptom
-> hypothesis
-> evidence
-> test
-> result
-> diagnosis
-> repair
-> verification.

For procedures:

precondition
-> action
-> expected output
-> interpretation
-> recovery if needed.

## Ordering

The IDs must be in the teaching order.

Order should generally reflect dependencies.

Do not force chronological order when another order is pedagogically clearer, but explain the reason.

## Equivalence criteria

The map must allow a reviewer to answer:

"Did all four explanation levels really teach the same thing?"

Avoid vague units such as "understand containers."

Prefer specific units such as:

"K07 — A container is an isolated process view sharing the host kernel."

## Final validation

Before returning the map:

- ensure IDs are unique
- ensure every required objective maps to one or more units
- ensure every learner action maps to at least one unit
- identify units that are easy to accidentally omit
- identify semantic boundaries where a shorter explanation could become misleading.

Return JSON-like structured data plus a human-readable explanation of the high-risk units.
