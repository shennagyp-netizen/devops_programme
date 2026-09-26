# V3 Red-Team Ledger

This document records security findings against the v3 learning-framework boundary. It distinguishes mitigated, partially mitigated, and open findings.

## Scope

Threat model:
- attacker controls browser JavaScript and request payloads
- attacker controls local storage and lesson navigation
- attacker can forge machine-verification claims

Security objective:

> Browser-controlled claims must never become authoritative learner state without server-controlled validation and provenance.

## Findings

| ID | Finding | Severity | Status |
|---|---|---:|---|
| V3-RT-01 | Completion accepted browser-selected item metadata. | Medium | **Mitigated** |
| V3-RT-02 | Completion can still reach legacy persistence without authoritative evidence resolution. | High | **Open** |
| V3-RT-03 | Browser-produced machine-verification envelopes are not server-attested. | High | **Open** |
| V3-RT-04 | Mastery attempt content/outcome remains client-supplied. | Medium | **Open** |
| V3-RT-05 | Assessment authority remains client-exposed. | Medium | **Open** |
| V3-RT-06 | Tutor rate limiting remains process-local. | Medium | **Open** |
| V3-RT-07 | Client-supplied assistant history remains possible. | Medium | **Open** |

## V3-RT-01 — completion metadata injection

The completion action now:
- accepts only itemId plus optional evidence references;
- derives item type/course/project from programmeAuthority;
- rejects unknown learning items;
- rejects unsupported browser trust assertions;
- does not persist a browser-selected verification level.

Covered by:
- app/tests/unit/authoritative-completion-boundary.test.mjs
- app/tests/integration/progress-action.test.mjs

## V3-RT-02 — legacy completion authority

The current learner_progress_history persistence API still represents completion as a direct insert and does not resolve verified evidence from a server-owned evidence ledger.

Therefore:

> An authenticated caller can still obtain completion for a known learning item without proving the required evidence.

This remains **open**.

Required next implementation:

```text
authenticated user
    -> authoritative item registry
    -> server evidence store
    -> evidence policy evaluation
    -> transactional completion write
```

The pure policy already exists in app/src/framework/authority.ts; persistent authority wiring is still missing.

## V3-RT-03 — machine evidence provenance

runtimeVerification.ts validates structure, task identity and timestamps, but hashes and envelope fields remain claims unless a trusted verifier or cryptographically authenticated attestation proves provenance.

Do not treat machine-verified as authoritative until trusted provider/attestation validation exists.

## V3-RT-04 — mastery forgery

The mastery action still accepts learner-controlled lessonId, taskId, outcome, stage and summary.

Attempt numbering is server generated, but semantic outcome is not.

Next red-team test: prove that a client cannot manufacture mastered without a server-owned evaluation result.

## V3-RT-05 — assessment authority

Operational assessment answer keys must not be authoritative client data.

Next implementation:
1. issue an assessment instance server-side;
2. send only learner-safe question data;
3. score against server-owned answer/rubric state;
4. persist attempt and outcome transactionally.

## V3-RT-06 — tutor rate limiting

The current tutor limiter is process-local. Multi-instance/serverless deployment can therefore split counters across instances.

Next implementation:
- shared durable rate-limit state;
- per-user and per-IP controls;
- bounded request/body/history sizes;
- cost-aware model limits.

## V3-RT-07 — forged assistant history

Client-supplied assistant messages must not become trusted conversation state.

Next implementation should reconstruct assistant history from server persistence or explicitly classify prior assistant text as untrusted context.

## Exit rule

The red-team gate is green only when a malicious browser cannot:
- mark a learning item complete by payload manipulation;
- forge machine verification into authoritative evidence;
- manufacture mastery outcomes;
- manufacture assessment passes;
- bypass expensive-endpoint rate limits through instance splitting;
- create trusted assistant history from arbitrary client text.