# Learning Model

## Core model

Understand -> Predict -> Operate -> Break -> Diagnose -> Repair -> Recall -> Design

Each concept can be represented as:
ordered lesson content feed + podcast + co-teacher + motion + platform-specific lab + retrieval + deliberate failure + production design + assessment.

The lesson content feed can interleave written explanation, visual/illustration blocks and video. Video is optional supporting content; the written lesson remains the complete mechanism explanation. The feed is separate from podcast timing and the audio synchronization contract.

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

The spoken co-teacher is a continuous lesson layer. It is not a separate lesson mode.

The co-teacher remains attached to the active lesson while the learner reads, watches visual content, watches video, operates the terminal, diagnoses a failure, recalls concepts, designs a solution or reviews an assessment.

The normal sequence is:
- voice explains and prompts
- the authored audio reaches a learner-action cue
- voice pauses deliberately
- the learner performs the required action in the learner interface
- the same voice session resumes

The React co-teacher:
- stays present throughout the lesson
- obtains predictions before explanation when authored
- pauses at authored prediction/lab/recall boundaries
- keeps the transcript synchronized with the real audio clock
- exposes transcript as recovery support
- resumes without requiring a mode switch
- links the learner back to the project

The learner may explicitly pause or seek the audio. Browser autoplay restrictions may require the first user gesture. Once started, changing between Learn, Do, Recall, Design and Assessment does not turn off the co-teacher.

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

## Mastery remediation

The programme must not treat a failed assignment as a request to repeat the same lesson.

A failed assignment creates a structured remediation event:
failure -> classify the failure -> re-explain -> micro-task -> reattempt -> verify -> escalate to a different explanation path when needed.

The remediation engine currently supports six explanation methods:
1. plain-language explanation
2. analogy followed by a literal technical mapping
3. mechanism-level explanation
4. worked example
5. counterexample showing what the evidence does not prove
6. visual/mechanism tracing

Attempt progression is deliberate:
- first failure: plain-language + analogy
- second failure: mechanism + worked example
- third failure: counterexample + visual
- repeated failure: cycle through mechanism/counterexample/visual rather than repeating the same explanation.

A remediation step is not itself a mastery decision. It prepares the learner for another attempt. The original assignment's evidence contract remains authoritative.

The learner must not be shown only "try again". The system should identify the failure class, explain the relevant concept from another angle, require a small intermediate task, and then return the learner to the original task.

Current MVP persistence for remediation attempts is local. A future server-side mastery ledger must persist:
- lesson/task identity
- attempt number
- failure class
- remediation methods shown
- micro-task completion
- reattempt result
- final evidence.

## Mastery model

Recognition -> Explanation -> Prediction -> Operation -> Failure engineering -> Diagnosis/repair -> Design
