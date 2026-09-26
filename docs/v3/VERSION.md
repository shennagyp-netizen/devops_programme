# Learning Framework V3

- **Framework version:** 3.1-authoritative-completion
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

The current CI gate is green for tests, typecheck, and production build.

This version marker does not claim that machine attestation, mastery authority, assessment authority, or tutor trust migration is complete.

## Stability rule

`main` remains the stable baseline until the v3 foundation and red-team migration gates are green.

## Next milestone

**V3.2 — Verification-provider attestation boundary**

Formalize verification-provider challenges, attestations, provenance/freshness/replay protections, and trusted local-agent/SSH integration without allowing browser claims to mint authoritative evidence.
