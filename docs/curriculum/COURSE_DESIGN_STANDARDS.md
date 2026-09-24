# Course Design Standards — DevOps Programme

## Status

This is the normative authoring standard for the three-course DevOps Programme. It defines the educational contracts that future content, assessments, projects, spoken lessons, diagnostics, hands-on tasks and runtime verification must preserve.

Current course model:
- Beginner — DevOps Through Problems
- Intermediate — DevOps Engineering
- Advanced — Large-Scale Distributed Systems

The programme is three distinct courses, not one course with three difficulty settings.

---

# 1. Non-negotiable learning principles

## 1.1 Teach from engineering problems

Preferred learning sequence:

problem -> competing hypotheses -> mental model -> prediction -> operation -> failure -> evidence -> diagnosis -> repair -> recall -> transfer/design

Tools are introduced because the learner needs them to solve the current problem. Do not create tool-first lessons that have no engineering reason.

## 1.2 Difficulty comes from engineering, not English

Technical vocabulary can remain exact. Language should remain understandable.

Do not make an item hard by:
- unnecessarily long prose
- rare vocabulary
- hidden instructions
- linguistic ambiguity
- academic language that does not measure the competency.

Make an item difficult through:
- incomplete evidence
- competing hypotheses
- interacting failures
- partial failure
- moving bottlenecks
- failure-domain reasoning
- recovery constraints
- scale
- trade-offs
- transfer to a new system.

## 1.3 Exercises are mandatory

Diagnostics can skip or condense introductory theory. They must never remove the exercise.

A required exercise includes actual operation, observation, a controlled change or deliberate failure where appropriate, recovery and verification.

## 1.4 Evidence is part of learning

Minimum hands-on evidence pattern:

before state -> controlled change -> resulting state/failure -> recovery -> verification

Structured evidence is not machine verification.

## 1.5 Failure is intentional curriculum

A failure exercise should be bounded, reversible, observable, diagnosable and resettable.

Never create a failure task that only asks the learner to make a system fail. The learner must also understand the expected signal and the recovery path.

---

# 2. Course contracts

## 2.1 Beginner — DevOps Through Problems

Audience:
- strong software/application fundamentals
- limited operational experience
- unfamiliar or partially familiar DevOps tooling.

Teaching strategy:
- start with a concrete operational problem
- introduce tools as solutions
- evolve one project continuously
- use short theory followed by operation and failure
- build confidence through explicit evidence.

Current sections:
1. B-F1 Linux and Process Foundations
2. B-F2 Networking Foundations
3. B-A1 Service Communication
4. B-A2 Containers
5. B-A3 CI/CD and Reproducible Delivery
6. B-A4 Observability and Recovery
7. B-A5 Queues, Retries and Failure

Current authored scope:
- 10 lessons
- 3 projects: B1, B2, B3
- 7 diagnostics
- 7 pilot banks
- 280 pilot items
- 10 spoken lessons.

Target capability:
- trace a request
- diagnose common process/network/application failures
- containerize and operate a service
- understand basic release flow
- use evidence for diagnosis
- recover a controlled failure
- reason about queues, retries and idempotency.

## 2.2 Intermediate — DevOps Engineering

Audience:
- software engineers with basic development tooling
- learner must become independently capable of production engineering.

Teaching strategy:
- deep theory
- visualized mechanisms
- long-form projects
- real failure labs
- increasingly ambiguous diagnostics
- explicit production trade-offs.

Current sections:
1. I-F1 Linux and Operating Systems
2. I-F2 Networking and Protocols
3. I-A1 Containers and Docker
4. I-A2 Kubernetes Control Loops
5. I-A3 Kubernetes Networking and Storage
6. I-A4 CI/CD and Infrastructure as Code
7. I-A5 Observability and SRE
8. I-A6 Distributed Systems and Recovery

Current authored scope:
- 32 lessons
- 3 projects: I1, I2, I3
- 8 diagnostics
- 8 pilot banks
- 320 pilot items.

Critical mapping invariant:
D2.5, D2.6 and D2.7 are I-A1 Docker/container lessons. A broad D2.* networking condition must never capture them first.

## 2.3 Advanced — Large-Scale Distributed Systems

Audience:
- engineers who already operate normal production systems.

Teaching strategy:
- scale as a constraint
- partial failure
- capacity and queueing
- failure domains
- global traffic
- distributed state
- controlled fault injection
- recovery and explicit trade-offs.

Current sections:
1. A-F1 Capacity and Queueing Foundations
2. A-F2 Distributed State Foundations
3. A-F3 Failure Domains
4. A-A1 Global Traffic and Multi-Region Systems
5. A-A2 Failure Engineering
6. A-A3 Massive-Scale Service Design

Current authored scope:
- 11 lessons
- 3 projects: A1, A2, A3
- 6 diagnostics
- 6 pilot banks
- 240 pilot items.

---

# 3. Section contract

Every section is a competency boundary.

A complete section must provide:
1. objectives
2. foundation links where applicable
3. teaching assets
4. mandatory exercise
5. deliberate failure opportunity
6. project connection
7. recall
8. design/transfer
9. conceptual assessment
10. diagnostic assessment
11. hands-on assessment
12. prerequisite diagnostic when authored
13. evidence path.

The section must answer: what can the learner now do reliably?

Do not close a section merely because several lessons were written.

---

# 4. Lesson contract

Each lesson should have:
- stable ID
- title
- section
- project
- objective
- human example
- lab/command entry point
- challenge
- recall prompts
- spoken asset
- platform-aware command behavior
- deliberate failure
- recovery
- evidence requirement.

Objectives should use observable verbs such as inspect, predict, trace, diagnose, operate, configure, recover or design.

The lesson should begin with a reason to act, then introduce the mental model.

Hands-on work must explain:
- what to run
- what to observe
- what the result means
- how to make one safe change
- how to recover.

---

# 5. Project contract

Projects are continuous operating environments, not final homework.

Each project needs:
- objective
- architecture
- environment
- milestones
- competency gates
- failure scenarios
- evidence requirements
- completion criteria
- change history
- incident history.

Project pattern:
baseline -> change -> failure -> diagnosis -> recovery -> harder failure -> redesign

Beginner: B1, B2, B3.
Intermediate: I1, I2, I3.
Advanced: A1, A2, A3.

---

# 6. Diagnostic standard

Diagnostics adapt theory; they do not replace exercises.

Current recommendation thresholds:
- score >= 0.90: skip theory
- score >= 0.70 and < 0.90: condense theory
- below 0.70: remediation.

Each authored diagnostic currently has:
- one section ID
- prerequisite lesson IDs
- remediation lesson IDs
- exactly four questions
- exactly four options per question
- valid answer indices
- stable question IDs.

Questions should test mechanism, prediction, evidence choice or diagnosis. Avoid trivia.

---

# 7. Assessment standard

Every section has three families:

Conceptual:
- mechanism
- application
- prediction
- design/trade-offs.

Diagnostic:
- evidence
- competing causes
- isolation
- diagnosis
- mitigation.

Hands-on:
- operation
- deliberate change/failure
- evidence
- recovery
- verification.

Current pilot form sizes:
- conceptual: 20
- diagnostic: 12
- hands-on: 8.

Current difficulty policy:
- Foundation: 15%
- Applied: 35%
- Difficult: 35%
- Challenge: 15%.

These are authoring targets, not calibrated psychometric truth.

A difficult item should gain difficulty from incomplete evidence, interactions, misleading healthy signals, changing bottlenecks or recovery trade-offs.

A challenge item should require transfer to a new system, scale or failure configuration.

Pilot banks are not certification pools.

Not yet complete as certification infrastructure:
- empirical item calibration
- standard setting
- operational security
- controlled item exposure.

---

# 8. Hands-on standard

Every lesson resolves to a hands-on task.

Verification levels:
- self-report
- structured
- machine-verified.

Current authored lesson evidence is primarily structured.

Structured verification means that evidence fields, minimum completeness and task metadata are validated locally. It does not prove the command was executed.

Default evidence fields:
- observation
- change
- failure
- recovery.

A task must define its success criteria and recovery/reset boundary.

---

# 9. Machine verification standard

The browser must never execute arbitrary learner shell text.

Intended flow:
React app -> exact task identity -> runtime runner -> allowlisted commands -> machine envelope -> validator -> evidence ledger

The runtime task catalog is the declarative source of truth:
app/src/data/runtimeTasks.json

TypeScript runtime verification is the validator/lookup layer:
app/src/data/runtimeVerification.ts

The runner is:
scripts/run-runtime-task.mjs

Runtime commands must be:
- platform-specific and explicit
- argument-separated
- shell-disabled
- timeout-bound
- marked destructive/non-destructive
- scoped to the task.

Machine envelopes contain:
- schema version
- task ID
- contract version
- lesson ID
- platform
- verification level
- runner version
- environment fingerprint
- timestamps
- step results
- output hashes
- reset state.

The first runner-ready task is B1.2 request-path observation. It is non-destructive and currently probes DNS resolution and HTTPS reachability.

This does not mean the entire B1.2 failure/recovery exercise is machine verified.

---

# 10. Podcast standard

The spoken lesson is two engineers working through a problem, not a narrated textbook.

Required style:
- natural contractions
- interruption/correction
- occasional disagreement
- exact technical language
- brief analogies followed by literal mechanisms
- occasional observational humour.

Avoid:
- perfect A/B alternation
- repeated 'great question'
- corporate transitions
- textbook definitions spoken unnaturally
- motivational filler
- fake spontaneity.

Target mix is approximately 75% technical and 25% human/contextual. The 25% is not 25% comedy.

Learning rhythm:
problem -> competing hypotheses -> mental model -> prediction -> operation -> failure -> evidence -> diagnosis -> repair -> recall -> transfer -> challenge

Audio timing must come from actual aligned audio. Never estimate timing from word count.

Current authored spoken content covers 53 lessons. Production aligned audio is not yet complete.

---

# 11. Platform standard

Supported profiles:
- macOS
- Linux
- Windows.

Platform differences should change command syntax, not learning objectives.

The current authored lesson set has Windows command coverage.

Do not turn a learning task into a shell-portability test unless portability itself is the competency.

---

# 12. Assessment and content quality gates

Every item should be checked for:
- technical correctness
- construct alignment
- evidence sufficiency
- difficulty source
- accessibility
- ambiguity quality
- scoring defensibility.

Every hands-on task should be checked for:
- reset safety
- controlled change
- meaningful failure signal
- recovery path
- evidence path.

Every spoken lesson should be checked for:
- technical fidelity
- believable speech
- prediction/lab/recall interaction
- absence of corporate narration
- absence of excessive short acknowledgements.

---

# 13. Testing standard

The project uses invariant-based testing.

Do not return to:
discover error -> patch error -> rerun -> discover next error.

Instead test whole architectural classes.

Unit tests should cover:
- course/section/project lookup
- diagnostic thresholds and references
- assessment blueprints
- evidence ledger
- hands-on task generation/validation
- podcast sync fail-closed behavior
- runtime envelope validation.

Integration tests should cover:
- 3 courses
- 21 sections
- 53 lessons
- 9 projects
- 21 diagnostics
- 21 assessment banks
- 840 assessment items
- platform coverage
- spoken content
- runtime catalog/runner.

Negative tests should mutate fixture copies and prove that known corruption is rejected.

Examples:
- missing bank
- wrong section ID
- duplicate item ID
- orphan diagnostic
- invalid remediation lesson
- wrong project mapping
- missing Windows adapter
- missing podcast
- invalid audio cue
- runtime task identity mismatch
- runtime contract version mismatch
- failed runtime step
- missing output hash.

---

# 14. Source-of-truth rules

One concept has one authoritative source.

Programme catalog: app/src/data/programme.ts

Intermediate lesson source: app/src/data/curriculum.ts

Normalized lesson metadata: app/src/data/courseLessons.ts

Hands-on task resolver: app/src/data/handsOn.ts

Runtime task catalog: app/src/data/runtimeTasks.json

Runtime validator: app/src/data/runtimeVerification.ts

Evidence ledger: app/src/data/evidence.ts

Assessment blueprint: app/src/data/assessment.ts

Pilot banks: exams/items/<course>/

Spoken assets: podcasts/

Never create a second parallel catalog just to make a local test easier.

---

# 15. Authored-course completion

A course is authored-core complete only when:
- every section exists
- every lesson is mapped
- every project is mapped
- every section has a prerequisite diagnostic
- every section has conceptual/diagnostic/hands-on assessment families
- every section has a 40-item pilot bank
- every lesson has hands-on coverage
- every lesson has spoken content
- platform coverage exists
- the course completeness validator passes.

Authored-core complete is not the same as production validated, certification-ready, machine verified or CI green.

---

# 16. Programme baseline

| Level | Sections | Lessons | Projects | Diagnostics | Pilot banks | Pilot items |
|---|---:|---:|---:|---:|---:|---:|
| Beginner | 7 | 10 | 3 | 7 | 7 | 280 |
| Intermediate | 8 | 32 | 3 | 8 | 8 | 320 |
| Advanced | 6 | 11 | 3 | 6 | 6 | 240 |
| Total | 21 | 53 | 9 | 21 | 21 | 840 |

Changes to these totals must update validators and documentation together.

---

# 17. Rule for future AI continuation

The next AI must read:
1. this document
2. docs/CONTINUATION_HANDOFF.md
3. docs/TESTING_ARCHITECTURE.md
4. the relevant current source and tests

Source code and current tests outrank historical assistant messages.

Do not ask the user to restate facts already present in these documents.

When implementation changes a learning contract, update implementation, tests and docs in the same slice.

Final rule:

**Teach the engineering decision, not the tool.**

The learner should be able to answer:
- What happened?
- What could explain it?
- What evidence separates those explanations?
- What is safe to change?
- What should happen after the change?
- How do I prove recovery?
- What changes when the same mechanism appears at larger scale?