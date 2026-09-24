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

The workflow is now partially implemented: the learner selects an environment profile, completes authored prerequisite diagnostics for Beginner B-F1/B-F2/B-A1, Intermediate I-F1/I-F2, and Advanced A-F1, and receives a persisted recommendation to skip, condense, or remediate theory. Broader course coverage and full automatic remediation routing remain planned.

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

Examples:
- successful prerequisite exercise
- deliberate failure diagnosis
- hands-on repair
- project incident
- exam evidence

The eventual competency record should be explainable: what was demonstrated, under what conditions, and by which evidence.

## Mastery model

Recognition -> Explanation -> Prediction -> Operation -> Failure engineering -> Diagnosis/repair -> Design
