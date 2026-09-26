# V3 Learning Experience Runtime

## Why this layer exists

The framework authority answers whether a learning-state transition is valid. React should not have to answer that question.

The Learning Experience Runtime answers what the interface may show and which interactions it may request, given authoritative learner state, programme content, current item, environment and capabilities.

```text
Experience UI
      ↓ intents
Learning Experience Runtime
      ↓ commands / queries
Learning Framework Authority
      ↓ contracts
Programme + Providers
```

## Core rule

A UI control does not own business logic. A control emits an intent. The experience runtime turns that intent into an allowed command or local UI transition. The framework authority remains responsible for authoritative state changes.

## State taxonomy

### Authoritative state
learner identity, completion, mastery, assessment attempts/results, verified evidence, competency state, eligibility.

### Session state
selected programme, course, learning item, environment, learning mode, active evidence collection, current coaching/remediation phase.

### UI state
navigation open/closed, panel visibility, tabs, dialogs, toasts, audio position, animation position.

### Device/capability state
microphone, speech synthesis, local agent, platform, network, viewport and reduced-motion preference.

Device state influences experience but never grants authority.

## Intent model

Intents describe learner intent, not implementation:

```text
SELECT_COURSE
SELECT_ITEM
SELECT_ENVIRONMENT
SELECT_MODE
OPEN_REMEDIATION
BEGIN_EVIDENCE
SAVE_EVIDENCE_DRAFT
SUBMIT_EVIDENCE
REQUEST_RUNTIME_VERIFICATION
SUBMIT_ASSESSMENT
REQUEST_TUTOR_HELP
PLAY_AUDIO
PAUSE_AUDIO
OPEN_ANIMATION
COMPLETE_ITEM
```

Examples:
- SELECT_MODE is a local session transition.
- PLAY_AUDIO is a device/UI operation.
- SUBMIT_EVIDENCE is an authoritative command.
- COMPLETE_ITEM is an authority command.
- REQUEST_RUNTIME_VERIFICATION invokes a provider.
- REQUEST_TUTOR_HELP invokes governed coaching.

## Command model

Only commands may mutate authoritative state:

```text
Intent
  ↓
Experience policy
  ↓
Command
  ↓
Authority / Provider
  ↓
Authoritative result
  ↓
Updated experience model
```

React components must not call database functions or framework internals.

## Query/view model

Expose framework-neutral read models, not database rows:

```text
ProgrammeView
CourseView
LearningItemView
LearningSessionView
EvidenceView
AssessmentView
MasteryView
TutorView
EnvironmentView
```

This permits web, mobile, voice-first and accessibility-focused experiences over the same authority.

## Control model

A control should be representable as policy-derived data:

```text
LearningControl
  id
  intent
  label
  visibility
  availability
  reason
  confirmation
  busyLabel
  accessibility description
```

Examples:

```text
Mark complete
  locked
  reason: Required exercise evidence is not verified

Run verified exercise
  enabled

Assessment
  locked
  reason: Prerequisite competency is not satisfied
```

The UI renders these decisions; it does not invent them.

## Learning modes

Learn / Do / Recall / Design / Assessment are session modes, not unrelated tabs.

The runtime decides availability, recommendation, gating, remediation and retry transitions.

Example:

```text
DO
 ↓ failure
REMEDIATION
 ↓ checkpoint
GUIDED_RETRY
 ↓
DO
```

The React UI should not encode this graph manually.

## Progress

Represent progress as state rather than scattered percentage calculations:

```text
LearningProgress
  current item
  completed items
  eligible next items
  blocked items
  mastery summary
  next recommended action
```

The experience can present course, project, section and competency progress without deciding what completion means.

## Error model

Use semantic categories instead of exposing exceptions:

```text
AUTHENTICATION_REQUIRED
NOT_ELIGIBLE
EVIDENCE_REQUIRED
EVIDENCE_INVALID
VERIFICATION_UNAVAILABLE
ASSESSMENT_LOCKED
RATE_LIMITED
PROVIDER_UNAVAILABLE
CONFLICT
TEMPORARY_FAILURE
```

Map each to a learner-safe message and recovery action.

## UX invariants

- no control implies authority it does not have
- no authoritative success is shown before confirmation
- every blocked action has an explanation
- asynchronous actions show pending state and prevent duplicate submission
- learner evidence drafts survive failures
- retries are explicit and safe
- navigation does not silently destroy active evidence
- mobile and desktop dispatch the same intents
- important state is not communicated by color alone

## Preferred React architecture

```text
LearningGateway
├── ProgrammeSelector
├── CourseNavigator
├── LearningSessionHeader
├── ModeRail
├── LessonContent
├── EvidenceWorkspace
├── VerificationPanel
├── MasteryPanel
├── AssessmentPanel
├── TutorPanel
├── MediaControls
└── EnvironmentPanel
```

Components consume view models and dispatch intents.

They should not import PostgreSQL, repositories, authority internals, answer keys or provider implementations.

## Four-layer v3 architecture

```text
1. Learning Framework Core
   semantics, policies, authority, state

2. Programme
   domain curriculum and assessment content

3. Learning Experience Runtime
   session orchestration, control policy, view models, intents

4. Experience Adapters
   React, Mantine, audio, browser APIs, runtime providers
```

This is the preferred abstraction boundary for v3: enough abstraction to make the system reusable, without creating a generic enterprise framework full of interchangeable interfaces.