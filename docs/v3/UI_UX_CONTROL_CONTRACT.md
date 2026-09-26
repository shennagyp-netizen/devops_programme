# V3 UI/UX Control Contract

## Principle

A control is a projection of policy, not a source of policy.

The control tells the learner what is possible, whether it is possible, why it is unavailable, and what happens after activation.

## Control contract

```text
LearningControl
  id
  intent
  label
  availability: enabled | disabled | busy | locked
  visibility: visible | hidden | contextual
  reason
  confirmation
  busyLabel
  ariaDescription
```

## Rules

### Client disabled state is UX only

A React disabled button is not an authorization boundary. Every authoritative command is validated on the server.

### Never show unconfirmed success

Use:

```text
unknown → checking → confirmed / rejected
```

for completion, mastery, assessment and machine verification.

### Preserve learner work

When an async operation fails, keep the learner's draft evidence and show a recoverable error.

### Explain blocked controls

A blocked control should expose:

```text
Blocked
Reason
Next action
```

Example:

> Complete the required runtime verification before marking this lesson complete.

## Semantic control groups

Navigation: programme, course, project, section, lesson, mode.

Learning action: start, explain, remediate, retry.

Evidence: begin, save draft, validate, submit.

Verification: pair agent, run verification, connect SSH, use managed runtime.

Assessment: start attempt, answer, submit, review.

Coaching: ask tutor, request hint, request another explanation.

Media: play, pause, seek, replay, open animation.

Environment: choose platform, inspect capability, configure runtime.

Account: sign in, sign out, manage session.

## Async state

Authoritative controls must model at least:

```text
idle
pending
success
failure
```

Conflict-sensitive operations may additionally expose stale/conflict.

Duplicate activation must be harmless. Use command idempotency where an operation can be retried across the network.

## Learning-mode controls

Learn, Do, Recall, Design and Assessment should share one semantic intent model.

Desktop, tablet and mobile may present the same intent as different controls:

```text
desktop  → mode rail
tablet   → segmented control
mobile   → compact menu
```

Presentation changes; learning semantics do not.

## Accessibility

Controls expose semantic state through native or ARIA mechanisms:

- selected
- expanded
- current
- disabled
- busy
- invalid
- described-by reason

Important learning state must never depend on color or iconography alone.

## Recommended learner interaction model

Each primary screen should answer these questions visibly:

1. Where am I?
2. What am I trying to learn or prove?
3. What can I do now?
4. What is blocked?
5. Why is it blocked?
6. What evidence is required?
7. What will happen next?

## Completion UX

The completion button is the final step of an authority-backed flow, not the place where completion is decided.

```text
Exercise not verified
  → Complete = locked

Verification running
  → Complete = busy/locked

Evidence verified
  → Complete = enabled

Completion submitted
  → Complete = pending

Completion confirmed
  → status = completed
```

## Error recovery

Map errors to an actionable recovery:

```text
AUTHENTICATION_REQUIRED → sign in
EVIDENCE_REQUIRED        → complete evidence
EVIDENCE_INVALID         → edit/retry
VERIFICATION_UNAVAILABLE → choose another provider
ASSESSMENT_LOCKED        → open prerequisite
RATE_LIMITED             → explain cooldown
CONFLICT                 → refresh state
TEMPORARY_FAILURE        → retry
```

Raw provider errors and stack traces should not become learner-facing UI.

## UI implementation rule

React components should receive:

```text
viewModel
controls
dispatch(intent)
```

rather than directly receiving database results plus mutation callbacks.

This keeps UI/UX logic testable independently of persistence and deployment infrastructure.