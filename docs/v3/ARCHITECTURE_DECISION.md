# V3 Architecture Decision — Preferred Abstraction

## Decision

The preferred v3 architecture is a **four-layer learning system** with a domain-neutral framework core and a headless learning-experience runtime.

```text
1. Framework Core
   learning semantics + authoritative policies

2. Programme
   curriculum + domain competencies + assessment content

3. Learning Experience Runtime
   session state + intents + control policy + view models

4. Experience/Provider Adapters
   React/Mantine + browser APIs + AI + terminal/SSH + database
```

## Why the earlier three-layer model was insufficient

The previous model separated framework, programme and adapters but left UI orchestration implicit.

That would cause application components to slowly absorb:
- mode-transition rules
- evidence gating
- remediation transitions
- provider selection
- loading/error logic
- progress interpretation
- control availability
- responsive behavior decisions

Those rules belong in a headless experience runtime.

## Important semantic refinement

`LearningItem` remains a useful transport-level umbrella, but it should not become the entire conceptual model.

The long-term domain model should distinguish:

```text
Curriculum Node
  course / section / lesson / project

Competency
  what the learner is expected to understand or demonstrate

Activity
  practice / evidence / assessment / design / reflection

Evidence
  what was observed or submitted

Learner State
  mastery / completion / eligibility / attempts

Experience Session
  what the learner is currently doing
```

A project is primarily a curriculum container, while an exercise or assessment is an activity. This prevents every object from being treated as a generic completable item.

## UI/UX architecture

`App.tsx` and `LessonPanel.tsx` currently combine multiple responsibilities. V3 should converge toward:

```text
Page / Shell
  ↓
Experience Runtime hook/adapter
  ↓
Experience View Model
  ├── session
  ├── controls
  ├── progress
  ├── content
  ├── evidence
  ├── mastery
  └── capabilities
  ↓
Presentational components
```

React components should primarily:
- render view models
- dispatch semantic intents
- manage ephemeral presentation state
- expose accessible interaction

They should not:
- decide completion
- calculate authoritative progress
- choose a verification trust level
- construct database mutations
- interpret assessment authority
- invent remediation policy

## Control logic

Every important control is policy-derived.

Control state is structured:

```text
enabled
busy
disabled
locked
unavailable
```

Blocked states carry machine-readable reason codes and, where useful, a resolution intent.

This is better than a boolean `disabled` plus arbitrary text because:
- the same policy can render different UI across desktop/mobile/voice
- accessibility text can be generated consistently
- localization can map reason codes to language
- telemetry can count blocked reasons
- tests can assert exact control behavior
- recovery actions can be deterministic

## Responsive UX rule

Responsive design changes presentation, never learning semantics.

```text
SELECT_MODE intent
  desktop → mode rail
  tablet  → segmented control
  mobile  → menu
  voice   → spoken command
```

## State ownership rule

### Server
authority and durable learning truth.

### Experience runtime
session orchestration and policy-derived view state.

### React component
ephemeral visual state.

### Browser storage
draft/offline convenience only.

Local storage must never be the source of authoritative completion, mastery or assessment state.

## State-machine strategy

Use small explicit pure transition functions for learning/session policy before introducing a state-machine dependency.

Add a state-machine library only if the number of independent orthogonal states becomes large enough that handwritten transitions become difficult to audit.

For v3 foundation, explicit discriminated unions and pure policy functions provide the smaller and more testable mechanism.

## Abstraction quality rule

An abstraction is accepted only when it removes domain knowledge from a lower layer.

Examples:

```text
Good:
VerificationProvider
Bad:
DevOpsDockerVerificationProvider inside framework core

Good:
REQUEST_RUNTIME_VERIFICATION
Bad:
onClick={() => runB1_2DockerCommand()}

Good:
PREREQUISITE_REQUIRED
Bad:
if (lesson.id === 'D3.3') disable button
```

## Final v3 target

The final framework should make it possible to replace the DevOps programme with another domain without rewriting:

- learner state
- evidence
- assessment authority
- mastery logic
- UI control semantics
- session orchestration
- accessibility semantics
- responsive interaction patterns
- provider contracts

Only the programme definitions and their domain-specific providers/content should change.

## Standalone Framework MVP correction

The framework is now an explicit top-level product boundary under `framework/`.

Its dependency direction is:

```
Programme definition/provider adapters
                ↓
      Learning Framework React App
                ↓
      Learning Experience Runtime
                ↓
        Framework Core Authority
                ↓
        Generic Provider APIs
```

The framework package contains its own React application, tests, TypeScript build, Vite build, and CI workflow.

The existing `app/src/framework` code is treated as the current DevOps application's compatibility implementation. It is not the standalone framework MVP and should not gain additional domain-neutral features. Future DevOps integration will consume the standalone framework; that migration is intentionally deferred so framework MVP work is not blocked by application migration.

This removes the critical architectural coupling: framework source has a boundary test that rejects DevOps, database, and Next.js dependencies.
