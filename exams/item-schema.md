# Assessment Item Schema

## Bank wrapper

Each JSON bank contains:

```
schemaVersion
sectionId
purpose
items[]
```

The current pilot banks are section-scoped. Course identity is derived from the bank path and section ID.

## Core item metadata

Every item defines:

```
id
family
difficulty
cognitiveLevel
itemType
expectedMinutes
competencyId
prompt
```

The current pilot uses one primary `competencyId` per item. The blueprint selects the competency required for the assessment family.

Optional learner/scoring fields include:

```
options
correctOption
expectedElements
scoring
scoringNote
```

## Hands-on items

Hands-on items additionally define:

```
environment
initialState
allowedOperations
success
evidence
failureConditions
recoveryRequirements
resetStrategy
```

The environment must be disposable or resettable.

A final state alone is not enough. The rubric can require:
- commands or actions taken
- observations
- diagnosis
- safe mitigation
- repair
- verification

## Item lifecycle

Recommended lifecycle:

```
authoring
-> technical-review
-> language-review
-> fairness-review
-> pilot
-> calibrated
-> operational
-> retired
```

An item must not enter an operational exam pool before its required reviews are complete.

## Difficulty

`difficulty` is an authoring target at first.

Observed difficulty should be stored separately after pilot use and may later replace the initial estimate when enough evidence exists.

The four authoring bands are:

- foundation
- applied
- difficult
- challenge

## Current pilot banks

The repository currently contains nine 40-item pilot banks:

Beginner:
- `B-F1` — Linux and Process Foundations
- `B-F2` — Networking Foundations
- `B-A1` — Service Communication
- `B-A2` — Containers
- `B-A3` — CI/CD and Reproducible Delivery
- `B-A4` — Observability and Recovery
- `B-A5` — Queues, Retries and Failure

Intermediate:
- `I-F1` — Linux and Operating Systems
- `I-F2` — Networking and Protocols
- `I-A1` — Containers and Docker
- `I-A2` — Kubernetes Control Loops
- `I-A3` — Kubernetes Networking and Storage
- `I-A4` — CI/CD and Infrastructure as Code
- `I-A5` — Observability and SRE
- `I-A6` — Distributed Systems and Recovery

Each bank contains:
- 20 conceptual items
- 12 diagnostic items
- 8 hands-on items

Each family follows:
15% foundation / 35% applied / 35% difficult / 15% challenge.

These pilot banks are not certification pools. They exist to validate the assessment architecture and item-writing contract before broader authoring and calibration.
