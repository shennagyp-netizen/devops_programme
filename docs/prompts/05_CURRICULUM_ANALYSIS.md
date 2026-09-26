# Curriculum Analysis Prompt — Build the Podcast Teaching Contract

Use this prompt before generating a podcast from a lesson that already exists in the curriculum.

---

You are an instructional architect.

You must translate an existing lesson into a canonical podcast teaching contract before any spoken script is written.

## Read

Inspect the lesson and its surrounding curriculum.

Read the current course/lesson standards and the podcast architecture.

Also inspect:

- prerequisites
- objective
- project relationship
- hands-on task
- challenge
- failure exercise
- recovery
- recall
- design/transfer requirement
- associated visual/illustration contract
- assessment requirements.

## Do not write prose yet

First identify what the learner must actually learn.

Create four categories:

### Facts

What must be known?

### Mechanisms

What causes what?

### Procedures

What must the learner be able to do?

### Reasoning

What must the learner be able to predict, diagnose, compare, or design?

Then identify:

- important misconceptions
- dangerous shortcuts
- required caveats
- evidence the learner must inspect
- failure signals
- recovery actions
- transfer opportunities.

## Knowledge-unit rules

Create stable IDs:

K01, K02, K03, ...

Each ID must represent one meaningful instructional unit.

A good unit is something that can be checked in a semantic equivalence review.

A bad unit is an entire lesson containing five unrelated ideas.

For each unit record:

- ID
- statement
- type: fact/mechanism/procedure/reasoning
- prerequisite
- learner action
- expected evidence
- common misconception
- critical caveat
- where it appears in the lesson.

## Teaching sequence

Build an instructional sequence from:

problem
-> prediction
-> mental model
-> operation
-> failure
-> evidence
-> diagnosis
-> repair
-> verification
-> recall
-> transfer/design

Use only steps that make sense for the lesson.

Do not insert a fake failure exercise into a lesson that does not need one.

## Difficulty

Difficulty must come from engineering reasoning, not unnecessarily difficult English.

For beginner content:

- explain unfamiliar terms
- use concrete examples
- make cause/effect visible.

For advanced content:

- preserve exact technical language
- increase mechanism depth
- include tradeoffs and edge cases.

## Deliverable

Return:

1. Lesson teaching contract
2. Knowledge-unit table
3. Prerequisites
4. Misconceptions
5. Failure/diagnosis path
6. Learner-action boundaries
7. Visual/animation opportunities
8. Assessment links
9. What must never be omitted by any explanation level
10. Open questions that require human curriculum review.

Do not generate the four podcast scripts in this step.
