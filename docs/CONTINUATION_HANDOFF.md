# Continuation Handoff — DevOps Programme Clearance

## 0. Purpose of this handoff

This document is the authoritative continuation point for the next implementation session on the branch:

- repository: `shennagyp-netizen/devops_programme`
- branch: `clearance/learning-assessment-architecture`
- current branch head at handoff: `aa5e04cdb5e9dbafb4014131ba1a706e19e53e81`
- branch comparison at handoff: **397 commits ahead of main, 6 commits behind main**
- current pull request: **PR #9**
- current visible GitHub Actions run: **#597**
- run conclusion: **failure**
- visible job: `build`
- connector-visible job steps: **none**
- connector-visible artifacts: **none**
- therefore: CI is **not green** and its exact runner failure remains unobservable through the available GitHub connector.

Do not restart the project from an older plan. Continue from the actual source state described below.

---

# 1. Executive state

The authored curriculum is now complete across all three courses.

## Beginner

Authored core is complete:

- 7 sections:
  - B-F1 Linux and Process Foundations
  - B-F2 Networking Foundations
  - B-A1 Service Communication
  - B-A2 Containers
  - B-A3 CI/CD and Reproducible Delivery
  - B-A4 Observability and Recovery
  - B-A5 Queues, Retries and Failure
- 10 authored lessons
- 3 projects: B1, B2, B3
- 7 prerequisite diagnostics
- 7 pilot assessment banks
- 280 pilot assessment items
- structured hands-on task coverage
- 10 Beginner podcast scripts
- Windows command coverage for the authored lesson set
- Beginner completeness validator

## Intermediate

Authored core is complete:

- 8 sections:
  - I-F1 Linux and Operating Systems
  - I-F2 Networking and Protocols
  - I-A1 Containers and Docker
  - I-A2 Kubernetes Control Loops
  - I-A3 Kubernetes Networking and Storage
  - I-A4 CI/CD and Infrastructure as Code
  - I-A5 Observability and SRE
  - I-A6 Distributed Systems and Recovery
- 32 lessons
- 3 projects: I1, I2, I3
- 8 prerequisite diagnostics
- 8 pilot assessment banks
- 320 pilot assessment items
- structured hands-on task coverage
- five-day spoken library as the Intermediate source
- Windows lesson command coverage
- Intermediate completeness validator

Important correction already made:
- D2.5, D2.6 and D2.7 are explicitly mapped to I-A1.
- The earlier mapping bug caused every D2.* lesson to fall into I-F2 because an overly broad condition executed before the I-A1 condition.
- This has already been corrected and is covered by integration tests.

## Advanced

Authored core is complete:

- 6 sections:
  - A-F1 Capacity and Queueing Foundations
  - A-F2 Distributed State Foundations
  - A-F3 Failure Domains
  - A-A1 Global Traffic and Multi-Region Systems
  - A-A2 Failure Engineering
  - A-A3 Massive-Scale Service Design
- 11 lessons
- 3 projects: A1, A2, A3
- 6 prerequisite diagnostics
- 6 pilot assessment banks
- 240 pilot assessment items
- structured hands-on task coverage
- 11 Advanced podcast scripts
- Advanced completeness validator

## Global authored-programme totals

The source currently resolves to:

- **21 sections**
- **53 lessons**
- **9 projects**
- **21 prerequisite diagnostics**
- **21 pilot assessment banks**
- **840 pilot assessment items**

A global completeness validator now checks these totals.

These numbers are authored-content counts, not claims of certification readiness.

---

# 2. Learning architecture that must not regress

The programme is three courses, not one difficulty-scaled course.

### Beginner — DevOps Through Problems

Teaching mechanism:
problem -> reason to learn tool -> operate -> fail -> diagnose -> repair

### Intermediate — DevOps Engineering

Teaching mechanism:
deep production theory distributed through projects, visualization, failure labs, diagnosis and architecture transfer.

### Advanced — Large-Scale Distributed Systems

Teaching mechanism:
scale, partial failure, capacity, failure domains, regional behavior, recovery and explicit trade-offs.

Core learning loop remains:

**Understand -> Predict -> Operate -> Break -> Diagnose -> Repair -> Recall -> Design**

Foundations are reusable competency nodes, not one mandatory block.

Diagnostic rule remains:

- known theory can be skipped or condensed
- mandatory exercises may NEVER be skipped
- failed prerequisite evidence should route toward remediation
- projects continuously carry the learner forward

Do not weaken the exercise requirement in order to improve diagnostic UX.

---

# 3. Assessment state

Every authored section has three assessment families:

1. conceptual
2. diagnostic
3. hands-on

Every authored section currently has a 40-item pilot bank.

Default family sizes:

- conceptual: 20
- diagnostic: 12
- hands-on: 8

Difficulty target:

- foundation: 15%
- applied: 35%
- difficult: 35%
- challenge: 15%

Across all authored sections:

- 21 banks
- 840 items
- no duplicate item IDs across the programme
- each family contains the expected 15/35/35/15 distribution

Current assessment state is **pilot architecture**, not certification.

Not yet complete:

- empirical item calibration
- standard setting
- secure operational item exposure
- certification-grade delivery
- psychometric replacement of author-time difficulty estimates

Do not describe the current pilot banks as calibrated or certification-ready.

---

# 4. Podcast state

There are 53 authored spoken lessons:

- 10 Beginner
- 32 Intermediate
- 11 Advanced

Global spoken-library review already performed:

- 0 banned-word hits in the reviewed source
- 0 episodes above the 97% strict-alternation warning
- 0 episodes above the 45% three-word-turn warning

The required spoken style is:

- two believable engineers
- contractions and natural speech
- interruption/correction/disagreement
- technical precision
- approximately 75% technical / 25% human context
- no corporate narrator voice
- no forced humour
- no perfect A/B symmetry
- no generic motivation

Important architecture rule:

**Audio timing must come from actual aligned audio.**

Never estimate timing from word count.

The current audio-manifest architecture fails closed when the manifest is malformed or stale.

Production aligned audio is still incomplete.

---

# 5. Evidence model

The evidence ledger exists and is local.

Evidence kinds include:

- diagnostic
- exercise
- failure
- recovery
- assessment
- design

Hands-on evidence now stores:

- taskId
- verificationLevel
- structured evidence payload

Verification levels are explicitly separated:

- self-report
- structured
- machine-verified

Current normal lesson behavior uses **structured** evidence.

Structured verification means:

- required fields exist
- minimum evidence length/completeness is checked
- evidence is attached to a task and project
- repeated identical evidence submissions are idempotent

It does NOT mean the learner actually executed the command.

Do not change language so that structured evidence appears machine-verified.

---

# 6. Hands-on runtime verification architecture

A runtime-verification protocol has now been introduced.

The intended separation is:

**Browser / React app**
-> requests a specific task
-> does not execute arbitrary shell commands

**Runtime runner**
-> resolves an allowlisted task
-> selects platform-specific commands
-> enforces timeout
-> executes only declared commands
-> captures output
-> hashes stdout/stderr
-> records environment fingerprint
-> records timing
-> returns machine-verification envelope

The current machine-verification envelope contains:

- schemaVersion
- taskId
- lessonId
- platform
- verificationLevel
- runnerVersion
- environmentFingerprint
- startedAt
- completedAt
- stepResults
- resetPerformed

The runtime protocol is fail-closed.

The current runner is intentionally narrow and safe.

---

# 7. IMPORTANT CURRENT RUNTIME INCONSISTENCY

There are currently **two sources of runtime task truth**, which is exactly the kind of architecture drift that the new integration tests are supposed to catch.

Source 1:

`app/src/data/runtimeVerification.ts`

It currently contains an inline `runtimeTasks` definition.

For B1.2 the inline task currently uses:

- taskId: `hands-on-B1.2`

Source 2:

`app/src/data/runtimeTasks.json`

For B1.2 the JSON catalog currently uses:

- taskId: `runtime-probe-B1.2`
- contractVersion: 1
- scope: `probe`

The runtime runner script:

`scripts/run-runtime-task.mjs`

loads:

`app/src/data/runtimeTasks.json`

The integration test:

`app/tests/integration/runtime-runner.integration.test.mjs`

intentionally asserts that:

- the TypeScript runtime catalog equals the JSON catalog
- B1.2 resolves to `runtime-probe-B1.2`

Therefore this is a deterministic test target.

### Required architectural decision

Do NOT patch individual assertions to hide this mismatch.

Choose one authoritative runtime catalog.

Preferred direction:

- JSON/task data is the serializable task catalog
- TypeScript code contains validation/types/runtime helpers
- there is ONE task identity
- `contractVersion` is represented consistently
- `scope` is represented consistently
- all consumers use the same task catalog

Then make the test prove there is only one effective source of truth.

This is a high-priority fix.

---

# 8. Current test architecture

Unit and integration testing is now explicitly part of the build.

`app/package.json` contains:

- `test:unit`
- `test:integration`
- `test`
- `check:runtime`
- `hands-on:run`
- `runtime:run`

The build now executes:

1. podcast sync
2. content validation
3. assessment validation
4. diagnostic validation
5. project validation
6. platform validation
7. hands-on contract validation
8. Beginner completeness
9. Intermediate completeness
10. Advanced completeness
11. global programme completeness
12. runtime verification contract validation
13. unit tests
14. integration tests
15. TypeScript build
16. Vite build

The CI workflow exposes separate stages for:

- unit_tests
- integration_tests

This is deliberate.

Do not collapse them back into an opaque single test command.

---

# 9. Existing unit tests

Current unit suites include:

`app/tests/unit/assessment.test.mjs`

Coverage:
- 63 assessment family blueprints
- 21 sections
- shared difficulty mix
- family sizes
- time budgets
- three families per section

`app/tests/unit/diagnostics.test.mjs`

Coverage:
- exactly 21 diagnostic definitions
- uniqueness of diagnostic sections
- four questions per diagnostic
- four options per question
- valid answer indices
- remediation/prerequisite lesson IDs
- recommendation thresholds

`app/tests/unit/evidence.test.mjs`

Coverage:
- storage/list behavior
- project filtering
- idempotency
- verification metadata
- clearing the ledger

`app/tests/unit/handsOn.test.mjs`

Coverage:
- authored override selection
- default task generation
- incomplete evidence rejection
- complete evidence acceptance

`app/tests/unit/podcastSync.test.mjs`

Coverage:
- malformed manifest rejection
- valid manifest acceptance
- cue/turn lookup
- network-error fail-closed behavior

`app/tests/unit/runtimeVerification.test.mjs`

Coverage:
- B1.2 runtime task resolution
- task identity mismatch rejection
- required-step omission rejection
- valid machine-verification envelope acceptance

These are good foundations, but they are not yet an exhaustive domain test suite.

---

# 10. Existing integration tests

Current integration suites include:

`app/tests/integration/assessment-banks.integration.test.mjs`

Coverage:
- one bank for every authored section
- 40 items per bank
- no duplicate IDs globally
- 15/35/35/15 difficulty contract
- hands-on evidence contract fields

`app/tests/integration/contract-validators.integration.test.mjs`

Coverage:
- executes the repository validators as child processes
- currently covers the programme/course validation scripts collectively

`app/tests/integration/platform-and-content.integration.test.mjs`

Coverage:
- Windows adapter coverage
- script-ready status for all 53 lessons
- all 53 spoken episodes
- spoken turn parsing
- prediction/lab/recall cue presence

`app/tests/integration/programme.integration.test.mjs`

Coverage:
- 3 courses
- 21 sections
- 53 lessons
- real section/project mappings
- all 9 projects
- project competency gates
- diagnostics for every section
- all three assessment families
- corrected Docker D2.5-D2.7 -> I-A1 mapping

`app/tests/integration/runtime-runner.integration.test.mjs`

Coverage:
- runtime JSON catalog vs TypeScript catalog
- B1.2 dry-run behavior
- unsupported lesson rejection

The last suite is currently especially valuable because it is catching the runtime source-of-truth inconsistency described above.

---

# 11. Test strategy for the next continuation

Do NOT return to the old pattern:

> discover error -> patch error -> rerun -> discover next error

Instead, use a test matrix and make whole classes of regressions fail together.

## Unit layer

Add broad pure-function coverage for:

### Course/programme mapping
- section lookup
- project lookup
- foundation/application classification
- all 53 lesson IDs
- all mapping branches
- unknown lesson behavior

### Diagnostics
- boundary scores
- malformed score inputs
- every section
- duplicate IDs
- invalid remediation references
- diagnostic-to-course alignment
- diagnostic-to-section alignment

### Assessment
- blueprint generation
- competency coverage
- difficulty distribution
- expected time
- pilot status
- family cardinality
- invalid blueprint rejection

### Hands-on
- every lesson gets a task
- every authored override is reachable
- default fallback behavior
- required evidence fields
- minimum lengths
- invalid payloads
- empty payloads
- extra payload fields
- verification-level preservation

### Evidence ledger
- idempotency
- same task/different summary
- same summary/different task
- project isolation
- serialization failure handling
- malformed localStorage handling
- metadata persistence

### Podcast sync
- stale manifest
- malformed timestamps
- overlapping turns
- out-of-bounds cues
- wrong episode ID
- stale script version
- cue-to-turn mismatches
- time exactly at start/end boundaries

### Runtime verification
- schema version
- task identity
- lesson identity
- platform identity
- timestamps
- missing steps
- extra steps
- duplicate steps
- failed step
- not-run step
- output hash presence
- environment fingerprint
- reset requirement
- contract version
- catalog identity

### Platform adapters
- every lesson
- macOS/Linux/Windows
- no missing adapters
- no accidental generic placeholder
- Windows command semantics
- unsupported platform behavior

---

# 12. Integration layer to add next

The next integration suite should test the entire authored programme as a graph.

Required assertions:

### Programme graph
- every section belongs to exactly one course
- every lesson belongs to exactly one section
- every lesson belongs to exactly one project
- every project belongs to exactly one course
- every project gate resolves to a real section
- every diagnostic resolves to a real section
- every diagnostic lesson reference resolves
- every section has all three assessment families
- every section has a pilot bank

### Content graph
- every lesson has a podcast
- every lesson has a lab
- every lesson has a hands-on task
- every lesson has platform command coverage
- every project has evidence requirements
- every project has completion criteria

### Assessment graph
- bank IDs unique globally
- bank sections match programme sections
- every family has expected counts
- every family has valid difficulty distribution
- every hands-on assessment item has environment/reset/evidence/recovery fields

### Adaptive-learning graph
- every section diagnostic recommendation points to a valid path
- skip/condense never removes exercise
- remediation target always exists
- project evidence is preserved through adaptation

### Runtime graph
- runtime task ID maps to exact hands-on task ID
- runtime task lesson exists
- runtime task platform commands exist
- runtime contract version is consistent
- JSON catalog and typed catalog cannot diverge
- runner and verifier consume the same contract

### Spoken graph
- every lesson -> exactly one episode
- episode ID matches lesson ID
- script is parseable
- prediction/lab/recall cues are present where required
- no stale episode IDs

---

# 13. Integration tests for failure behavior

Do not test only happy paths.

At minimum add negative integration cases for:

- deleting one assessment bank
- changing one bank section ID
- removing one diagnostic
- pointing one remediation lesson at a non-existent lesson
- remapping Docker back to I-F2
- removing a Windows command
- removing one podcast episode
- making one podcast manifest cue invalid
- corrupting one hands-on contract
- changing one runtime task ID
- changing one runtime contract version
- duplicating one runtime step ID
- reporting a machine-verified envelope for the wrong task
- reporting machine verification without hashes
- claiming reset when reset was not performed

The tests should mutate fixture copies where practical rather than mutate the main source tree.

The goal is:

**prove that a known class of architectural corruption is rejected.**

---

# 14. Runtime runner tests must be expanded

Current runner integration tests are only a beginning.

Add:

### CLI argument tests
- missing lesson
- unknown flag
- missing flag value
- dry-run
- explicit output path

### execution boundary tests
- arbitrary shell syntax cannot be injected
- `shell: false`
- command arguments remain separate
- destructive commands are rejected
- unsupported platform commands are rejected
- timeout is enforced
- required-step failure stops subsequent execution
- remaining steps are recorded as not-run

### evidence tests
- output hashes always present
- environment fingerprint present
- timestamps monotonic
- task identity matches contract
- platform identity matches host
- reset state is correct
- failed task returns non-zero process status

### determinism tests
Given the same task contract:

- dry-run command list is stable
- step ordering is stable
- task ID is stable
- contract version is stable

---

# 15. Critical runtime architecture improvement

The current runtime system has a duplicate source of truth:

- TypeScript inline task definition
- JSON runtime task catalog

This should become:

**one canonical runtime-task catalog**

and:

**pure TypeScript verification/execution helpers**

not two separate task definitions.

The test should enforce identity, not merely compare two accidentally synchronized structures.

Preferred future structure:

- `runtimeTasks.json`: canonical declarative task catalog
- `runtimeVerification.ts`: types + validation + lookup adapter
- `run-runtime-task.mjs`: runner
- integration tests: contract between all three

Do not allow the runner to reinterpret arbitrary user-provided shell strings.

---

# 16. CI interpretation

Latest known run:

- run #597
- conclusion: failure
- job: build
- no steps available through connector
- no artifacts available through connector

Therefore:

- do NOT say unit tests pass
- do NOT say integration tests pass
- do NOT say TypeScript passes
- do NOT say Vite build passes
- do NOT infer the failing stage from the missing connector data

The workflow was deliberately changed so unit and integration tests are separate named stages. This is correct architecture even though the runner result is still opaque.

The previous bare-runner isolation showed that a minimal shell probe failed before useful application-level conclusions could be made. Temporary probes were removed.

Do not add more random probe jobs unless they provide a specific new isolation layer.

---

# 17. Current CI workflow stages

The authoritative workflow currently executes:

1. install
2. sync_podcasts
3. check_content
4. check_assessment
5. check_diagnostics
6. check_projects
7. check_platforms
8. check_hands_on
9. check_beginner
10. check_intermediate
11. check_advanced
12. check_programme
13. check_runtime
14. unit_tests
15. integration_tests
16. TypeScript
17. Vite build
18. warning-only podcast review

It also attempts to upload the CI diagnostic report.

Because GitHub connector access is not exposing the steps or artifacts, the workflow's stage isolation cannot currently be observed from this interface.

---

# 18. What is actually complete versus not complete

## Complete

- three-course authored curriculum
- all section definitions
- all authored lessons
- all projects
- all diagnostics
- all pilot banks
- global programme completeness contract
- platform adapters for current lesson set
- spoken-library authoring/review
- structured hands-on evidence
- evidence ledger
- assessment blueprint architecture
- runtime verification data model
- runtime verification validator
- first runner-ready B1.2 task contract
- unit/integration test framework
- course-level and global validator scripts
- CI stage separation for unit/integration testing

## Not complete

- machine-verified coverage across all 53 lessons
- runtime adapters for Docker/Kubernetes/Terraform/load testing/etc.
- production audio timing manifests
- empirical assessment calibration
- formal standard setting
- certification-grade assessment security
- fully automatic remediation routing
- full runtime execution infrastructure beyond the narrow first task
- observable green CI

## Known defect to resolve immediately

Runtime catalog duplication:

`runtimeVerification.ts` and `runtimeTasks.json` currently disagree on the B1.2 task identity and shape.

Do not bypass the failing test. Unify the catalog.

---

# 19. Recommended continuation sequence

### Phase 1 — Test integrity before more features

1. Fix runtime task single-source-of-truth.
2. Make the runtime integration test authoritative.
3. Add exhaustive unit tests for:
   - course mapping
   - diagnostics
   - assessment
   - hands-on
   - evidence
   - runtime verification
   - podcast sync
   - platform adapters
4. Add negative integration tests for contract corruption.
5. Add global graph invariants.

### Phase 2 — Execute the test suite locally if a real workspace is available

Run:

```bash
cd app
npm install
npm test
npm run test:unit
npm run test:integration
npm run check:content
npm run check:assessment
npm run check:diagnostics
npm run check:projects
npm run check:platforms
npm run check:hands-on
npm run check:beginner
npm run check:intermediate
npm run check:advanced
npm run check:programme
npm run check:runtime
npx tsc -b
npm run build
```

Do not rely on only `npm run build` once the test suite becomes large; preserve explicit unit/integration output.

### Phase 3 — Runtime runner expansion

Once the catalog is unified:

- make B1.2 genuinely machine-verified in a controlled environment
- add one safe runtime task from each layer:
  - Linux/process
  - networking
  - Docker
  - Kubernetes
  - Terraform
  - observability
  - distributed failure
- do not jump directly to destructive tasks
- every runner task gets:
  - allowlist
  - timeout
  - reset strategy
  - evidence envelope
  - integration test

### Phase 4 — Broaden machine verification

Only after the protocol is stable:

- expand task coverage
- add environment adapters
- add reset automation
- add authenticated evidence envelopes
- connect machine evidence to the learner ledger

### Phase 5 — Assessment maturation

After content stability:

- pilot performance collection
- calibration
- timing analysis
- distractor analysis
- revision/retirement
- standard setting
- operational pool separation

---

# 20. What NOT to do in the next session

Do not:

- rewrite the curriculum
- create another alternative assessment architecture
- create a second learning engine
- duplicate runtime task catalogs
- bypass failing tests
- claim CI green from source inspection
- call structured evidence machine-verified
- add random CI probes without an explicit isolation hypothesis
- reintroduce broad regex validators that misunderstand generated lesson data
- change the 15/35/35/15 assessment policy casually
- mark pilot banks as certification-ready
- estimate podcast timing from word count
- remove exercises when diagnostics say theory can be skipped
- use arbitrary shell strings from the browser

---

# 21. Exit criteria for the next milestone

The next milestone should not be considered complete until:

### Test architecture
- unit and integration suites cover every core pure module
- global graph invariants are tested
- negative contract tests exist
- runtime catalog has one source of truth

### Runtime
- at least one runtime task runs end-to-end
- machine envelope is validated
- command allowlisting is enforced
- timeout/failure/reset semantics are tested
- runner and verifier consume the same catalog

### CI
- exact failure stage is observable
- unit test stage is observable
- integration test stage is observable
- diagnostics/artifacts are actually retrievable
- then, and only then, green CI may be claimed

### Curriculum
- no section/lesson/project drift
- no diagnostic orphan
- no assessment-bank orphan
- no spoken-script orphan
- no platform-adapter orphan

---

# 22. Immediate first task

The next engineer/agent should begin with this exact sequence:

1. Inspect the runtime catalog mismatch:
   - `app/src/data/runtimeVerification.ts`
   - `app/src/data/runtimeTasks.json`
   - `scripts/run-runtime-task.mjs`
   - `app/tests/integration/runtime-runner.integration.test.mjs`

2. Choose one canonical catalog.

3. Make the integration test pass because the architecture is correct, not because the test is weakened.

4. Expand the test matrix around the corrected contract.

5. Run the full suite locally if possible.

6. Only after tests are trustworthy, continue adding machine-verification task coverage.

The governing principle for the next phase is:

**Test the architecture as a system, not the latest error as an isolated bug.**

---

# 23. Final truth statement

At this handoff point, the important distinction is:

**The authored learning programme is complete.**

The remaining engineering work is primarily:

**validation depth + machine verification + operational assessment maturity + CI observability.**

The repository must not be described as fully validated until those layers have independent evidence.
