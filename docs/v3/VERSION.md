# Learning Framework V3

- **Framework version:** 3.2-verification-provider-authority
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

## V3.2 status

The provider-authority slice now contains:

- server-issued, short-lived verification challenges;
- trusted Ed25519 provider keys provisioned server-side;
- canonical signed attestation payloads;
- authenticated learner/provider/item/evidence binding;
- atomic one-time challenge consumption for replay resistance;
- persisted signature, provider-key, and verification-attempt provenance;
- strict browser request parsers and red-team tests.

The existing local-agent and SSH runners still produce the older unsigned runtime envelope. Those adapters cannot mint authoritative evidence until they are migrated to the signed provider protocol.

## Next milestone

**V3.2.1 — Signed runtime-provider adapters**

Migrate the local terminal agent and SSH runner to consume server challenges and return Ed25519-signed attestations, then connect the Learning Gateway to the server challenge/attestation actions.
