
# V3 Red-Team Ledger

## Current target

The canonical V3 framework target is:

~~~text
framework/
~~~

The framework red-team focus is now independence and semantic integrity.

The existing DevOps application retains its own separate security ledger.

## Framework findings

| ID | Finding | Severity | Status |
|---|---|---:|---|
| FW-RT-01 | DevOps/domain dependency leaks into framework source. | High | Mitigated |
| FW-RT-02 | Database/Next.js/application dependency leaks into framework source. | High | Mitigated |
| FW-RT-03 | React component becomes authority rather than policy projection. | High | Mitigated for current MVP |
| FW-RT-04 | Demo-programme assumptions become framework concepts. | Medium | Open |
| FW-RT-05 | Runtime bypasses generic completion policy. | Medium | Mitigated for current MVP |
| FW-RT-06 | Provider implementation leaks into framework core. | High | Mitigated for current MVP |
| FW-RT-07 | Framework API becomes prematurely large. | Medium | Open by design |

## FW-RT-01 — domain leakage

A dedicated framework source-boundary test rejects known domain/infrastructure tokens such as:

- DevOps;
- Docker;
- Kubernetes;
- database implementation;
- Next.js;
- application-server paths.

## FW-RT-02 — infrastructure leakage

The framework package has its own build/test configuration and no database/server imports.

Persistence and authentication remain consumer concerns.

## FW-RT-03 — UI authority leakage

The React application consumes runtime state and dispatches semantic intents.

Completion is derived by the framework authority, not by component-local completion flags.

## FW-RT-04 — demo leakage

The neutral demo is intentionally small.

This remains open until a second materially different neutral programme proves that no demo-specific assumption has leaked into framework semantics.

Closure:

- add second programme fixture;
- run the same runtime/React tests against both;
- keep framework source unchanged.

## FW-RT-05 — runtime policy bypass

Current runtime transitions use framework authority before changing completion state.

Coverage verifies:

- missing evidence keeps completion locked;
- valid evidence unlocks it;
- completion changes derived progress.

## FW-RT-06 — provider leakage

Provider implementations remain outside core.

Framework core does not implement:

- terminal;
- SSH;
- AI;
- database;
- domain assessment scoring.

## FW-RT-07 — abstraction bloat

Do not add interfaces merely for theoretical extensibility.

An abstraction is justified only when it removes domain knowledge from framework core or supports a real reusable capability.

## Framework exit rule

Before the first DevOps integration:

- boundary test green;
- TDD green;
- typecheck green;
- production build green;
- second neutral programme covered;
- no domain-specific provider code in framework.
