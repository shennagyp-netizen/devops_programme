# Learning Framework V3

- **Framework version:** 3.0-architecture-foundation
- **Branch:** `v3/learning-framework`
- **Baseline:** `main`
- **Reference programme:** DevOps
- **Migration style:** additive, contract-first, trust-boundary-first

## V3 status

The repository is now explicitly being evolved as a reusable learning framework rather than only a DevOps course application.

The first v3 implementation seam is the server-policy boundary plus the server-side programme metadata boundary represented by:

- `app/src/framework/contracts.ts`
- `app/src/framework/authority.ts`
- `app/tests/unit/framework-authority.test.mjs`
- `app/src/framework/authorityRequest.ts`
- `app/src/lib/server/programmeAuthority.ts`
- `app/tests/unit/authoritative-completion-boundary.test.mjs`

This version marker does not claim that the full migration is complete.

## Stability rule

`main` remains the stable baseline until the v3 foundation and red-team migration gates are green.

## Next milestone

**V3.1 — Authoritative learner-state service**

Current V3.1 work establishes the authenticated command boundary and authoritative programme metadata lookup.

The remaining V3.1 work is to resolve verified evidence from persistent server state and make completion transactional through the pure authority policy.
