# Learning Model

## Core model

Understand -> Predict -> Operate -> Break -> Diagnose -> Repair -> Recall -> Design

Each concept can be represented as:
textbook + podcast + co-teacher + motion + platform-specific lab + retrieval + deliberate failure + production design + assessment.

## Human-first teaching

Human-friendliness is a system requirement.

The learner should never feel they are being spoken at by a syllabus.

Explanations should begin from what a competent engineer is seeing or trying to fix. The system then introduces the minimum conceptual machinery needed to understand the behaviour, followed by an exercise that proves the learner can use it.

The spoken layer must sound like real human engineering conversation:
- natural speech
- different personalities
- real questions
- disagreement
- correction
- uncertainty before evidence
- occasional humour
- no corporate narration
- no robotic symmetry

The podcast prompt contains an explicit anti-robotic review contract.

## Adaptive theory

The workflow is now implemented across the authored Beginner and Intermediate cores and all six current Advanced sections: the learner selects an environment profile, completes authored prerequisite diagnostics, and receives a persisted recommendation to skip, condense, or remediate theory. Full automatic remediation routing and richer diagnostic item banks remain planned.

When a prerequisite is already demonstrated:
- introductory theory can be skipped or condensed
- the learner still performs the associated exercise

When a prerequisite is not demonstrated:
- the system routes to the smallest useful foundation/remediation node
- the learner returns to the application path after demonstrating the exercise

## Three courses

### Beginner

Problems create the need for each DevOps tool.

The learner sees a concrete system problem first and discovers why the tool exists.

### Intermediate

Deep engineering theory is distributed through projects, visual stories, labs, diagnosis and production transfer.

### Advanced

Scale, uncertainty and partial failure are the teaching constraints.

## Project spine

Every course contains three major projects. Projects begin before all content is mastered and evolve continuously.

The project loop is:
change -> predict -> operate -> break -> diagnose -> repair -> verify -> record evidence -> redesign

## Assessment

Every section has three assessment families:
- conceptual
- diagnostic
- hands-on

All three vary in difficulty.

Learning adaptation and standardized assessment are separate systems.

The assessment engine uses blueprints, item metadata, scoring rubrics, evidence requirements and form-equivalence rules. It is not a random quiz generator.

## Podcast/co-teacher

The podcast is an exercise-driven spoken lesson between two believable engineers.

The React co-teacher:
- obtains predictions before explanation
- frames pauses
- controls exercise/retrieval workflow
- exposes transcript as recovery support
- records local learning state
- links the learner back to the project

The transcript is a recovery aid, not a replacement for listening and operating.

## Evidence

The learner should accumulate an evidence ledger rather than only a completion percentage.

The current MVP persists local diagnostic and exercise evidence and associates it with the project.

Examples:
- successful prerequisite exercise
- deliberate failure diagnosis
- hands-on repair
- project incident
- exam evidence

The current ledger is local. Hands-on tasks now use structured evidence contracts and client-side schema validation, but this still does not prove command execution on the learner's environment. A future runtime adapter will add machine-verified evidence and stronger integrity controls.

The eventual competency record should be explainable: what was demonstrated, under what conditions, and by which evidence.

## Mastery model

Recognition -> Explanation -> Prediction -> Operation -> Failure engineering -> Diagnosis/repair -> Design
