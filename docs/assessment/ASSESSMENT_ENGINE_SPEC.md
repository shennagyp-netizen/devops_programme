# Assessment Engine Specification

## Purpose

The assessment engine is responsible for measuring demonstrated competency, not merely recalling course text.

The design follows widely used professional assessment principles: validity, reliability, fairness, standardization, accessibility, documented purpose, controlled administration, evidence-based scoring, and continuous quality review. AERA/APA/NCME's *Standards for Educational and Psychological Testing* and ISO 10667-1/-2 are reference frameworks for these principles. ISO 10667-1:2020 is currently under revision, so this project treats the published 2020 edition as a reference while tracking the revision rather than claiming compliance or certification.

## Assessment layers

Every curriculum section has three assessment families:

1. Conceptual assessment
   - measures mechanisms, models, trade-offs and prediction
   - avoids pure vocabulary recall
2. Diagnostic assessment
   - presents evidence and a failure state
   - measures hypothesis formation, evidence selection, isolation, diagnosis and mitigation
3. Hands-on assessment
   - gives the learner an actual environment and task
   - measures operation, verification, failure handling and evidence capture

These are not three fixed-difficulty quizzes. Every assessment form contains a controlled spread of difficulty.

## Difficulty model

Initial authoring uses four bands:

- Foundation: direct mechanism with limited ambiguity
- Applied: normal engineering application
- Difficult: multiple interacting causes or incomplete evidence
- Challenge: novel transfer, competing hypotheses, scale or failure interactions

Difficulty is a target at authoring time, not a permanent truth.

After pilot administrations, the item bank records empirical performance:

- p-value / proportion correct
- response-time distribution
- discrimination indicators appropriate to the item type
- distractor effectiveness for selected-response items
- common error patterns
- attempt and remediation history
- hands-on evidence quality

Empirical calibration supersedes informal author estimates when enough evidence exists.

## Assessment blueprint

Each exam form is generated from a blueprint containing:

- competency coverage
- cognitive/operational level
- item-type mix
- difficulty distribution
- expected testing time
- prerequisite restrictions
- hands-on environment requirements
- scoring method
- accessibility constraints
- security/reuse policy

The form generator must prevent accidental overrepresentation of one competency or one difficulty band.

## Form equivalence

Different forms for the same assessment purpose must be assembled from comparable blueprint cells.

The engine must not create a second form by simply randomizing questions.

Equivalent forms preserve, within configured tolerance:

- competency coverage
- difficulty profile
- task type distribution
- expected time
- scoring weight
- hands-on evidence burden

Question order may vary. Required scenario dependencies must remain coherent.

## Learning vs certification behavior

Learning is adaptive. Certification assessment is standardized.

During learning:
- known theory can be skipped
- exercises cannot be skipped
- failed exercises route to targeted remediation
- the system can select additional practice based on evidence

During a standardized exam:
- the blueprint controls the assessment
- remediation is unavailable unless the assessment specification explicitly permits it
- difficulty is controlled through form generation
- the learner receives equivalent opportunity and instructions
- scoring is based on predefined evidence and rubrics

Computerized adaptive testing may be introduced later after the item bank is sufficiently calibrated. The first implementation is blueprint-controlled forms, not naive 'wrong answer -> easier question' logic.

## Scoring

Scoring is criterion-based for hands-on work and blueprint-based for selected/constructed responses.

Each scored task has an explicit rubric.

Hands-on evidence can include:
- command output
- system state
- test result
- configuration state
- incident timeline
- diagnosis rationale
- recovery result
- post-change verification

The learner should not receive full credit merely for reaching the expected end state through an unverified shortcut.

## Competency evidence ledger

The learner's competency record references evidence rather than only a percentage:

- learning attempts
- prerequisite exercises
- deliberate failure tasks
- diagnostic tasks
- hands-on assessments
- project evidence
- final exam evidence
- remediation outcomes

The ledger supports auditing how a competency decision was reached.

## Quality controls

Before an item becomes eligible for standardized forms:

- objective alignment review
- technical correctness review
- ambiguity review
- accessibility review
- fairness review
- answer-key/rubric review
- security/reuse classification

After exposure:

- performance analysis
- unexpected distractor analysis
- timing review
- incident/error review
- retirement or revision decision

## Security

Exam items must be separable into:
- authoring
- pilot
- operational
- retired

The operational pool should not be identical to the learning-practice pool.

Hands-on environments should be resettable so that the same task does not require a permanently modified lab.

## Passing decisions

Passing thresholds are established per assessment purpose and blueprint, not by an arbitrary universal percentage.

A future implementation may support standard-setting procedures, but the repository must not hard-code claims such as '70% equals competent' across all competencies.

## Accessibility and fairness

Assessment design must support reasonable accessibility requirements without changing the competency being measured.

Time, interface, language and assistive-technology accommodations must be represented as assessment configuration where applicable.

The system must distinguish:
- accessibility accommodation
- learning adaptation
- exam difficulty
- competency standard

These are different concerns.

## Current implementation status

This specification defines the target architecture. It does not claim that psychometric calibration, formal standard setting, or certification-grade security is already implemented.


## Form generation implementation

The current application implementation uses deterministic blueprint-controlled forms.

Default form sizes are:
- Conceptual: 20 items, target 60 minutes
- Diagnostic: 12 items, target 45 minutes
- Hands-on: 8 tasks, target 90 minutes

The default difficulty mix is:

| Band | Target |
|---|---:|
| Foundation | 15% |
| Applied | 35% |
| Difficult | 35% |
| Challenge | 15% |

A different seed can choose different items from the same calibrated pool. The seed does not change:
- required competencies
- difficulty targets
- assessment family
- expected time limit
- scoring rules

The generator fails closed when:
- a difficulty band does not have enough eligible items
- a required competency is missing
- the selected form is too long

The current implementation is a deterministic form generator and pilot assessment architecture, not a completed certification system. Pilot banks now exist for all seven Beginner sections, all eight Intermediate sections, and all six Advanced sections. Item calibration, standard setting, secure delivery and operational item exposure controls still require further implementation and validation.

Form generation also requires the selected items to cover the blueprint's declared competencies and cognitive levels while remaining inside the difficulty distribution and time allowance.


## Current learner-runner implementation — 2026-09-26

The assessment architecture now has a learner-facing operational session runner layered over the existing 21 pilot banks / 840 authored items.

The runner:
- generates a form from the existing blueprint and item pool;
- creates an authenticated attempt record;
- keeps the answer key server-side during delivery;
- exposes only the public item representation to the browser;
- starts a server-derived assessment clock;
- supports navigation and mark-for-review;
- accepts one final submission;
- automatically scores objectively keyed selected-response items;
- stores open-ended/practical responses as review-required instead of fabricating a score;
- persists the attempt and result state.

The runner does not modify, regenerate, or rewrite authored question content.

This closes the learner-facing operational delivery gap. It does not claim formal certification-grade security, psychometric calibration, standard setting, secure operational item exposure, or formal reviewer workflow.
