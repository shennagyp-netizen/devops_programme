# V3 Quality Gate

## Current validated state

Branch:

`v3/learning-framework`

Baseline:

`main`

Latest validated GitHub Actions run:

- Run: `36240413922`
- Commit: `75fec892001e231d3e6c5b1728dc66e9076f4dd0`
- Result: **success**
- Test files: **68 passed**
- Tests: **496 passed**
- TypeScript typecheck: **passed**
- Next.js production build: **passed**
- Framework security architecture contract: **passed**
- All existing programme/content/runtime contract gates: **passed**

Branch relation to main at this checkpoint:

- 102 commits ahead
- 0 commits behind
- main remains untouched

## Security properties established

The current completion-authority slice guarantees:

1. Browser completion commands cannot supply learner identity, item type, course, project, or verification level.
2. Completion metadata comes from the immutable programme registry.
3. Completion requires server-owned verified evidence satisfying the item policy.
4. Completion and evidence proof links are written transactionally.
5. Legacy completion rows are not authoritative until successfully proven by server evidence.
6. Legacy metadata is normalized from authoritative programme state before the row is treated as authoritative.
7. Ordinary completion reads expose only `authoritative-evidence` rows.
8. LocalStorage/browser evidence cannot directly mint a server-authoritative evidence record.
9. Evidence records require a canonical SHA-256 attestation digest and a real learning-item reference.
10. Verification attestations are bound to challenge, learner, item, evidence kind, provider and time window at the framework contract layer.

## Red-team state

### Mitigated

- Completion metadata injection.
- Evidence-free browser completion.
- Legacy completion metadata becoming authoritative without proof.

### Partially mitigated

- Machine-verification provenance.

The framework now has structural attestation validation, but cryptographic/provider authentication and persistent replay protection are intentionally not claimed complete.

### Open

- Trusted local-agent / SSH provider attestation.
- Server-authoritative mastery outcomes.
- Server-authoritative assessment instances/scoring.
- Distributed tutor rate limiting.
- Trusted assistant-history reconstruction.

## Merge rule

Do not merge the branch to `main` merely because CI is green.

Merge only after the intended V3 milestone is explicitly satisfied and its red-team findings are closed or deliberately accepted/documented.
