# Learning Framework V3

- **Framework version:** 3.3-authoritative-mastery
- **Branch:** `v3/learning-framework`
- **Baseline:** `main`
- **Reference programme:** DevOps
- **Migration style:** additive, contract-first, trust-boundary-first

## V3 status

The repository is now explicitly being evolved as a reusable learning framework rather than only a DevOps course application.

The 3.1 implementation establishes an authoritative completion/evidence boundary represented by:

- `app/src/framework/contracts.ts`
- `app/src/framework/authority.ts`
- `app/src/framework/authorityRequest.ts`
- `app/src/data/programmeLearningItems.ts`
- `app/src/lib/server/evidenceAuthority.ts`
- `app/src/lib/server/learningAuthority.ts`
- `app/src/lib/server/schema.ts`
- `app/tests/unit/learning-authority.test.mjs`
- `app/tests/unit/evidence-authority.test.mjs`
- `app/tests/unit/authoritative-completion-boundary.test.mjs`

The V3.2 implementation now includes a real signed provider path for both the local terminal agent and SSH runner. Authoritative machine evidence is created only after server-side challenge validation, provider-key verification, signature verification, freshness checks, and one-time challenge consumption.

This version marker does not claim that assessment authority or tutor trust migration is complete.

## Stability rule

`main` remains the stable baseline until the v3 foundation and red-team migration gates are green.

## V3.2 status

The provider-authority slice now contains:

- server-issued, short-lived verification challenges;
- trusted Ed25519 provider keys provisioned server-side;
- exact provider-key binding across the challenge lifecycle;
- canonical signed attestation payloads;
- authenticated learner/provider/item/target/evidence binding;
- atomic one-time challenge consumption for replay resistance;
- persisted signature, provider-key, and verification-attempt provenance;
- strict browser request parsers and red-team tests;
- signed local-terminal and SSH provider adapters;
- rejection of legacy unsigned machine-evidence imports.

The operational trust boundary is therefore complete for the signed provider path. Provider-key enrollment remains an explicit deployment/provisioning operation rather than a browser action.

## V3.3 status

The mastery boundary is now authoritative for outcome and attempt identity:

- browser requests cannot submit an outcome, lesson identity, task identity, or learner identity as trusted mastery state;
- the server resolves the lesson and hands-on task from the programme registry;
- the server resolves evidence only for the authenticated learner;
- mastery outcome is derived from the same authoritative evidence policy used for completion;
- attempt numbers are server-generated and collision-safe;
- coaching stage is restricted to the published mastery stage set;
- learner summaries remain learner-authored notes, not authoritative outcomes.

## Next milestone

**V3.4 — Authoritative assessment**

Move operational assessment instances, scoring, and pass state behind server-owned question/rubric authority.
