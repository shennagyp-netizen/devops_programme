# V3 Continuation Handoff

## Current branch

```text
v3/learning-framework
```

Base:

```text
main
```

V3 is intentionally additive. Main has not been replaced.

## Completed in this branch

- Established the reusable v3 learning-framework framing.
- Added the framework authority contracts and pure policy.
- Added a strict completion command boundary with browser trust fields rejected.
- Added a shared immutable programme registry with explicit evidence completion policies.
- Added server-owned verified evidence persistence with attestation-digest validation.
- Added transactional completion authority with proof links and legacy-row normalization.
- Removed the legacy direct completion writer from the progress service.
- Filtered progress reads to authoritative completions only.
- Gated the UI completion control on server-verified evidence.
- Added TDD and red-team coverage for the new trust boundary.
- Signed-provider milestone is green: provider challenges, exact provider-key binding, signed local/SSH attestations, authoritative evidence, red-team replay/key-substitution coverage, unit/integration tests, typecheck, and production build pass.
- Added the framework attestation contract in `app/src/framework/verification.ts` with TDD coverage for binding, freshness, expiry, and digest validation.
- Added exact provider-key binding to the challenge lifecycle and red-team coverage for key substitution/revocation.
- Added authoritative mastery recording with server-derived outcome and attempt number.
- Restricted mastery commands to the published coaching stage set and added server-action boundary coverage.
- Added a dedicated `check:framework-security` CI gate to prevent trust-boundary regressions.
- Migrated the local terminal agent and SSH runner to signed challenge-bound provider attestations.
- Rejected unsigned machine-evidence imports at the Learning Gateway.


## Important architectural decision

Do not immediately rewrite existing progress code.

First create the authoritative policy boundary, then migrate current persistence and UI flows behind it.

## Latest TDD and red-team work

The completion and signed-provider boundaries are complete for these slices. The current open trust boundary is **assessment authority**, followed by tutor trust/rate-limit hardening.

### Immediate next work

### A. Verification-provider authority

Implemented in V3.2:

- strict verification challenge and attestation contracts;
- server-side provider-key provisioning boundary;
- short-lived persisted verification attempts;
- Ed25519 signature verification;
- nonce/hash integrity checks;
- atomic replay-safe challenge consumption;
- provenance retained on authoritative evidence.

### A.1 Signed runtime-provider adapters

Implemented:

1. local terminal agent receives a server-issued challenge and signs the exact execution envelope;
2. SSH runner consumes a challenge file and produces the same signed attestation shape;
3. both providers bind the challenge to the exact runtime task and provider key;
4. the Learning Gateway accepts only server-validated attestation evidence.

### A.2 Local terminal provider enrollment

The local agent now generates a persistent Ed25519 provider keypair and exposes its public key through `/health`.

The public key is not accepted from the browser. A trusted server/deployment operator must register it with:

```text
DATABASE_URL=... node scripts/register-local-terminal-provider.mjs \
  --learner-id <authenticated-user-id> \
  --provider-id <agent-provider-id> \
  --key-id <agent-key-id> \
  --public-key-file <path-to-provider-public-key.pem>
```

For a deployed learning gateway, set:

```text
DEVOPS_TERMINAL_ALLOWED_ORIGINS=https://<learning-gateway-origin>
```

The local agent no longer reflects arbitrary browser origins. Preflight requests from unapproved origins are rejected.
### B. Machine verification migration

The signed provider boundary is now the authoritative machine-verification path.

The server must verify:

- task identity and contract version
- learner binding
- challenge/reference identity
- attestation digest
- issued-at / expiry / replay protection
- provider identity
- execution-mode constraints

### C. Mastery migration

Implemented in V3.3. Keep browser remediation UX non-authoritative.

### D. Assessment migration

Next: issue server-owned assessment instances and score them against server-owned keys/rubrics.

### E. Tutor migration

Reconstruct trusted assistant history server-side and add shared distributed rate limiting.

### F. Quality hardening

Add a security regression gate that proves:

- authoritative completion requires an evidence proof link;
- browser/localStorage evidence cannot become server-authoritative;
- old forged metadata is normalized or ignored;
- new migrations preserve referential integrity.

## V3 quality gate

A feature is not complete until:

```text
TDD
+
security red-team
+
server-authority test
+
integration test
+
documentation
+
CI green
```


### D. Mastery migration

Move mastery attempt counting and mastery state behind the same authority.

The browser may retain temporary remediation UX state, but authoritative attempt numbering comes from the server.

### E. Assessment migration

Create a server-owned assessment instance and attempt model.

Do not expose authoritative answer keys through client runtime data for operational assessments.

### F. Tutor migration

Reconstruct assistant history server-side or mark client-supplied assistant text as untrusted.

Add shared distributed rate limiting.

### G. Verification providers

Implemented for the current machine providers:

1. structured human evidence remains a future explicit provider;
2. local terminal agent uses signed challenge-bound attestations;
3. SSH uses the same signed attestation SPI;
4. managed runtime remains a future provider.

## V3 quality gate

A feature is not complete until:

```text
TDD
+
security red-team
+
server-authority test
+
integration test
+
documentation
```

For security-sensitive transitions, browser-only tests are insufficient.

## Deliberate non-goals

Do not:

- split repositories
- introduce microservices
- publish packages prematurely
- rewrite all UI components
- replace working DevOps content
- treat localStorage as authoritative learner state

## Exit criterion for the current V3.1 slice

This slice is complete when:

- browser completion payloads cannot mint completion;
- completion requires server-verified evidence;
- legacy completion metadata is not trusted as authoritative;
- evidence proof links are transactional;
- programme metadata is server/registry authoritative;
- TDD, red-team, typecheck, and production build are green.

## Exit criterion for the broader V3 foundation

The broader framework is ready for broader migration when:

- completion cannot be forged through a browser payload
- evidence provenance is server-verifiable
- assessment state is authoritative
- mastery state is authoritative
- tutor requests cannot manufacture authoritative conversation state
- shared rate limiting protects expensive endpoints
- existing DevOps content continues to pass its programme gates
