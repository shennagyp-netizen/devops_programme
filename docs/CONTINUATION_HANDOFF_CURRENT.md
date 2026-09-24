# Current Continuation Handoff — DevOps Programme

Status snapshot: 2026-09-24

Repository: shennagyp-netizen/devops_programme
Branch: clearance/learning-assessment-architecture
Pull request: #9
Current branch comparison when this document was written: 398 commits ahead of main, 6 commits behind main.
Refresh branch ancestry at the beginning of the next session. Do not treat a historical SHA or ahead/behind count as permanent.

Latest observable GitHub Actions run at this snapshot: #490.
Conclusion: failure.
Job: build.
Connector-visible workflow steps: none.
Connector-visible artifacts: none.
CI is therefore not green and the exact failing stage is not currently observable through the connector.

AUTHORITATIVE READING ORDER
1. docs/curriculum/COURSE_DESIGN_STANDARDS.md
2. this document
3. docs/TESTING_ARCHITECTURE.md
4. docs/curriculum/COURSE_ARCHITECTURE.md
5. docs/LEARNING_MODEL.md
6. docs/assessment/ASSESSMENT_ENGINE_SPEC.md
7. actual source and tests relevant to the current task.

SOURCE + TESTS + CURRENT DOCS ARE AUTHORITATIVE. Historical assistant messages are not.

============================================================
1. PROGRAMME BASELINE
============================================================

The authored curriculum is complete across all three courses.

Beginner:
- 7 sections
- 10 lessons
- 3 projects: B1, B2, B3
- 7 prerequisite diagnostics
- 7 pilot assessment banks
- 280 pilot assessment items
- 10 spoken lesson scripts

Beginner sections:
- B-F1 Linux and Process Foundations
- B-F2 Networking Foundations
- B-A1 Service Communication
- B-A2 Containers
- B-A3 CI/CD and Reproducible Delivery
- B-A4 Observability and Recovery
- B-A5 Queues, Retries and Failure

Intermediate:
- 8 sections
- 32 lessons
- 3 projects: I1, I2, I3
- 8 prerequisite diagnostics
- 8 pilot assessment banks
- 320 pilot assessment items
- five-day spoken source library

Intermediate sections:
- I-F1 Linux and Operating Systems
- I-F2 Networking and Protocols
- I-A1 Containers and Docker
- I-A2 Kubernetes Control Loops
- I-A3 Kubernetes Networking and Storage
- I-A4 CI/CD and Infrastructure as Code
- I-A5 Observability and SRE
- I-A6 Distributed Systems and Recovery

Critical Intermediate mapping invariant:
D2.5, D2.6 and D2.7 are I-A1 Docker/container lessons. They must never be captured by a broad D2.* -> I-F2 rule.

Advanced:
- 6 sections
- 11 lessons
- 3 projects: A1, A2, A3
- 6 prerequisite diagnostics
- 6 pilot assessment banks
- 240 pilot assessment items
- 11 spoken lesson scripts

Advanced sections:
- A-F1 Capacity and Queueing Foundations
- A-F2 Distributed State Foundations
- A-F3 Failure Domains
- A-A1 Global Traffic and Multi-Region Systems
- A-A2 Failure Engineering
- A-A3 Massive-Scale Service Design

GLOBAL AUTHORED TOTALS:
- 21 sections
- 53 lessons
- 9 projects
- 21 diagnostics
- 21 pilot banks
- 840 pilot items

A global completeness validator enforces these totals.

These counts describe authored curriculum completeness. They do not mean certification readiness, production audio completion, machine verification of every lab, or green CI.

============================================================
2. COURSE DESIGN LAW
============================================================

Full normative authoring rules are in docs/curriculum/COURSE_DESIGN_STANDARDS.md.

Core teaching loop:
Understand -> Predict -> Operate -> Break -> Diagnose -> Repair -> Recall -> Design

Core curriculum progression:
problem -> competing hypotheses -> mental model -> prediction -> operation -> failure -> evidence -> diagnosis -> repair -> recall -> transfer/design

Three course identities:

Beginner:
Start from concrete operational problems and introduce tools as solutions. Difficulty should be approachable in language and clear in mechanism.

Intermediate:
Build independent production engineering depth. Use deep mechanisms, failure labs, projects, diagnostics and production trade-offs.

Advanced:
Use scale, uncertainty, partial failure, capacity, distributed state, failure domains and recovery as the main constraints.

Mandatory invariant:
Diagnostics may skip or condense introductory theory. They must never remove a required hands-on exercise.

Difficulty must come from engineering reasoning, not intentionally difficult English.

Analogy rule:
analogy -> literal technical mechanism

Never allow an analogy to replace the real explanation.

============================================================
3. SECTION CONTRACT
============================================================

A section is a competency boundary.

A complete section needs:
- objectives
- foundation links where applicable
- teaching assets
- mandatory exercise
- deliberate failure
- project connection
- recall
- design/transfer
- conceptual assessment
- diagnostic assessment
- hands-on assessment
- prerequisite diagnostic when authored
- evidence path.

Do not declare a section complete because its text exists.

============================================================
4. LESSON CONTRACT
============================================================

Each lesson needs stable identity and an observable goal.

Expected lesson ingredients:
- stable lesson ID
- section ID
- project ID
- objective
- human example
- lab/command entry point
- challenge
- recall
- spoken asset
- platform-aware command
- deliberate failure where applicable
- recovery path
- evidence requirement.

Good objectives use observable verbs:
inspect, predict, trace, diagnose, operate, configure, recover, design.

Bad objective style:
learn Docker, understand Kubernetes, know networking.

Those concepts may appear in prose, but the assessed objective must be observable.

Every hands-on lesson should make clear:
- what to run
- what to observe
- why the observation matters
- what controlled change to make
- how to recover
- what proves recovery.

============================================================
5. PROJECT CONTRACT
============================================================

Projects are continuous environments, not end-of-course assignments.

Each project needs:
- objective
- environment
- milestones
- competency gates
- failure scenarios
- evidence requirements
- completion criteria
- change history
- incident history.

Project progression:
baseline -> change -> failure -> diagnosis -> recovery -> harder failure -> redesign

Current projects:
Beginner: B1, B2, B3
Intermediate: I1, I2, I3
Advanced: A1, A2, A3

============================================================
6. DIAGNOSTIC CONTRACT
============================================================

Current authored diagnostics cover all 21 sections.

Thresholds currently implemented:
- score >= 0.90 -> skip theory
- score >= 0.70 and < 0.90 -> condense theory
- below 0.70 -> remediation.

Current diagnostic shape:
- stable section ID
- prerequisite lesson IDs
- remediation lesson IDs
- four questions
- four options per question
- valid correct-option index
- unique question IDs.

Diagnostic questions should measure:
- mechanism
- prediction
- evidence interpretation
- diagnosis boundaries.

Do not turn diagnostics into vocabulary trivia.

============================================================
7. ASSESSMENT CONTRACT
============================================================

Every section has three assessment families:
- conceptual
- diagnostic
- hands-on.

Current pilot sizes:
- conceptual: 20 items
- diagnostic: 12 items
- hands-on: 8 tasks.

Current difficulty target:
- Foundation 15%
- Applied 35%
- Difficult 35%
- Challenge 15%.

Current authored totals:
- 21 banks
- 840 items
- no duplicate authored item IDs
- each bank follows the controlled family/difficulty contract.

Pilot banks are not certification pools.

Not yet complete:
- empirical calibration
- standard setting
- secure operational delivery
- operational item exposure controls.

Difficulty source:
Do not make English wording difficult. Make the engineering situation difficult.

Difficult items can use incomplete evidence, interacting failures, misleading healthy signals, changing bottlenecks and recovery constraints.

Challenge items require transfer to a novel architecture, scale, failure pattern or trade-off.

============================================================
8. SPOKEN CONTENT CONTRACT
============================================================

Total authored spoken lessons: 53.

Beginner: 10
Intermediate: 32
Advanced: 11

Global spoken review found:
- 0 banned-word hits
- 0 episodes over the 97% strict A/B alternation warning
- 0 episodes over the 45% three-word-turn warning.

Spoken style:
- two believable engineers
- natural contractions
- interruption/correction
- disagreement when useful
- technical exactness
- occasional observational humour
- no corporate narrator
- no fake motivation
- no constant agreement
- no perfect A/B turn symmetry.

Target mix is approximately 75% technical reasoning and 25% human/contextual material. The human portion is not 25% comedy.

Audio timing MUST come from actual aligned audio. Never derive timing from word count.

Production aligned audio is not complete.

============================================================
9. EVIDENCE CONTRACT
============================================================

Evidence kinds currently include:
- diagnostic
- exercise
- failure
- recovery
- assessment
- design.

Hands-on evidence can store:
- taskId
- verificationLevel
- structured evidence payload.

Verification levels:
- self-report
- structured
- machine-verified.

Current normal lesson evidence is structured.

Structured evidence means the schema and minimum completeness are validated locally. It does not prove actual command execution.

Repeated identical evidence writes are idempotent.

Do not relabel structured evidence as machine verification.

============================================================
10. RUNTIME VERIFICATION ARCHITECTURE
============================================================

Runtime task catalog is now single-source-of-truth.

Canonical runtime catalog:
app/src/data/runtimeTasks.json

TypeScript types/lookup/validation:
app/src/data/runtimeVerification.ts

Runner:
scripts/run-runtime-task.mjs

The earlier duplicate runtime-task definition problem has been resolved. runtimeVerification imports the JSON catalog instead of maintaining a second task definition.

Runtime task contract includes:
- taskId
- contractVersion
- lessonId
- verification level
- resetRequired
- scope
- ordered steps
- platform commands
- timeout
- destructive metadata.

Runner safety contract:
- shell=false
- arguments separated
- only catalog-defined commands
- timeout enforced
- destructive steps rejected by the default runner
- output captured and hashed
- environment fingerprint recorded
- exact task/lesson identity recorded
- reset state recorded.

Machine verification envelope includes:
- schemaVersion
- taskId
- contractVersion
- lessonId
- platform
- verificationLevel
- runnerVersion
- environmentFingerprint
- startedAt
- completedAt
- stepResults
- resetPerformed.

Current runner-ready task:
- B1.2
- DNS resolution
- HTTPS port reachability
- non-destructive.

Important:
B1.2 runtime execution is a narrow probe. It is not full machine verification of the entire B1.2 failure/recovery lesson.

No deployed learner-side runtime agent is claimed.

============================================================
11. TEST ARCHITECTURE
============================================================

Continuation rule:
DO NOT debug one error at a time.

Use invariant-based unit and integration coverage so classes of architectural corruption fail together.

Current unit suites:

assessment.test.mjs:
- assessment family blueprints
- 21 sections
- difficulty mix
- family sizes
- time budgets.

diagnostics.test.mjs:
- 21 diagnostic definitions
- section uniqueness
- four questions
- four options
- valid answer indices
- lesson references
- recommendation thresholds.

evidence.test.mjs:
- storage/list behavior
- project filtering
- idempotency
- verification metadata
- clearing.

handsOn.test.mjs:
- authored override selection
- default task fallback
- invalid evidence
- valid evidence.

podcastSync.test.mjs:
- malformed manifest rejection
- valid manifest acceptance
- cue/turn lookup
- fail-closed network behavior.

runtimeVerification.test.mjs:
- runtime task resolution
- wrong-task rejection
- missing required step rejection
- valid envelope acceptance.

Current integration suites:

assessment-banks.integration.test.mjs:
- every authored bank
- 40 items per bank
- global unique IDs
- difficulty distribution
- hands-on evidence shape.

contract-validators.integration.test.mjs:
- real execution of repository validators.

platform-and-content.integration.test.mjs:
- all 53 lessons
- Windows adapters
- spoken episode coverage
- turn parsing
- learning cues.

programme.integration.test.mjs:
- all 3 courses
- 21 sections
- 53 lesson mappings
- 9 projects
- project alignment
- diagnostics
- three assessment families
- Docker D2.5-D2.7 -> I-A1 invariant.

runtime-runner.integration.test.mjs:
- JSON runtime catalog vs TypeScript catalog
- B1.2 dry-run
- unsupported lesson rejection.

============================================================
12. TEST MATRIX THE NEXT AI MUST EXPAND
============================================================

Do not add tests only after discovering a failure.

Add invariant groups for:

Programme graph:
- every section belongs to exactly one course
- every lesson belongs to exactly one section
- every lesson belongs to exactly one project
- every project belongs to exactly one course
- every project gate resolves
- every diagnostic resolves
- every diagnostic lesson reference resolves
- all three assessment families exist.

Content graph:
- every lesson has spoken content
- every lesson has lab content
- every lesson has hands-on coverage
- every lesson has platform coverage
- every project has evidence and completion criteria.

Assessment graph:
- bank IDs globally unique
- bank section matches programme section
- family counts correct
- difficulty distribution correct
- hands-on fields complete.

Runtime graph:
- task ID maps to one lesson
- contract version matches envelope
- platform command exists
- no duplicate runtime task ID
- runner and verifier consume the same JSON catalog.

Spoken graph:
- lesson ID maps to episode ID
- every episode parses
- expected prediction/lab/recall cues exist
- no stale episode IDs.

Negative tests should use fixture mutations for:
- deleted bank
- wrong section ID
- duplicate item ID
- deleted diagnostic
- invalid remediation lesson
- wrong project gate
- missing Windows command
- missing podcast
- malformed audio cue
- runtime task identity change
- contract version change
- duplicate runtime step ID
- missing output hashes.

============================================================
13. RUNTIME TEST EXPANSION
============================================================

CLI tests:
- missing lesson
- unknown option
- missing value
- dry-run
- custom output path.

Execution boundary tests:
- shell stays false
- shell metacharacters cannot inject arbitrary execution
- unsupported platform fails closed
- destructive command fails closed
- timeout enforced
- failed required step prevents unsafe continuation
- remaining steps become not-run.

Evidence tests:
- output hashes exist
- environment fingerprint exists
- timestamps are valid and ordered
- task identity exact
- platform identity exact
- reset state exact.

Determinism tests:
- task ID stable
- step order stable
- command plan stable
- contract version stable.

============================================================
14. BUILD CONTRACT
============================================================

app/package.json build currently includes:
1. sync:podcasts
2. check:content
3. check:assessment
4. check:diagnostics
5. check:projects
6. check:platforms
7. check:hands-on
8. check:beginner
9. check:intermediate
10. check:advanced
11. check:programme
12. check:runtime
13. npm test
14. tsc -b
15. vite build.

CI separately names unit_tests and integration_tests.

Do not collapse them into one opaque test step.

============================================================
15. CI TRUTH
============================================================

Latest observable run at this handoff: #490.
Conclusion: failure.
Job: build.
Connector-visible steps: none.
Connector-visible artifacts: none.

Therefore:
- do not claim unit tests passed in CI
- do not claim integration tests passed in CI
- do not claim TypeScript passed in CI
- do not claim Vite build passed in CI
- do not infer a specific failed stage.

The previous bare-runner isolation established that the observable environment can fail before useful application diagnostics are exposed. Temporary probe jobs were removed after isolation.

Do not add random CI probes without a specific isolation hypothesis.

============================================================
16. REPOSITORY / GITHUB CONNECTOR FOOTGUN
============================================================

When creating a new file through the GitHub connector, ALWAYS provide:
branch: clearance/learning-assessment-architecture

If the branch is omitted, a create-file operation can land on the default branch.

This happened previously with runtime/hands-on files and caused cleanup commits on the default branch.

After creating a file:
1. fetch it from the intended branch
2. confirm it exists there
3. verify its content
4. only then continue.

For updates:
1. fetch current file
2. use current blob SHA
3. update on the intended branch
4. verify the resulting content.

Do not assume the connector write landed where intended.

============================================================
17. BRANCH ANCESTRY
============================================================

Current comparison: 398 ahead, 6 behind main.

The behind ancestry includes default-branch cleanup commits created during earlier accidental file placements.

Do not blindly merge main or reset the branch just to make the graph look clean.

Preserve the intended clearance tree.

If ancestry cleanup becomes necessary, compare trees first and verify no intended source is lost.

============================================================
18. COMPLETE VS NOT COMPLETE
============================================================

AUTHORED CORE COMPLETE:
- Beginner
- Intermediate
- Advanced
- 21 sections
- 53 lessons
- 9 projects
- 21 diagnostics
- 21 pilot banks
- 840 pilot items.

IMPLEMENTED ARCHITECTURE:
- adaptive diagnostics
- structured evidence ledger
- hands-on resolver
- single-source runtime catalog
- runtime contract validator
- fail-closed machine envelope validator
- local non-destructive B1.2 runner
- course/global completeness validators
- unit and integration test architecture.

NOT YET COMPLETE:
- machine verification for the complete hands-on catalogue
- deployed learner runtime agent
- empirical assessment calibration
- standard setting
- certification-grade secure assessment delivery
- production aligned audio
- observable green CI.

Do not collapse these into one Done flag.

============================================================
19. IMMEDIATE NEXT WORK
============================================================

First:
Expand the unit/integration matrix before adding many more runtime tasks.

Second:
Add negative fixture tests for each major contract.

Third:
Run the complete local test/build suite when a working checkout and dependencies are available.

Fourth:
Expand machine verification in this order:
1. observation-only tasks
2. reversible configuration tasks
3. controlled failure tasks
4. recovery verification
5. reset verification.

Fifth:
Investigate CI runner observability with a concrete hypothesis. Do not guess which stage failed.

Sixth:
Move pilot assessment toward empirical calibration.

Seventh:
Produce actual aligned audio before creating production timing manifests.

============================================================
20. NON-REGRESSION RULES
============================================================

Never:
- create a second learning engine
- duplicate source-of-truth catalogs
- bypass required exercises
- weaken invariants to make tests pass
- call structured evidence machine verified
- claim CI green without visible evidence
- execute arbitrary browser shell
- estimate audio timing from word count
- make assessment harder by making English harder
- mark pilot banks as certification-ready
- remap lessons without updating mapping tests
- update docs without updating the affected contract/test.

When implementation disagrees with docs, resolve the disagreement explicitly. Do not silently choose whichever is convenient.

============================================================
21. GOVERNING RULE
============================================================

Teach the engineering decision, not the tool.

Test the architecture as a system, not the latest error as an isolated bug.

A feature is closed only when implementation, contract, tests, documentation and evidence agree.

============================================================
22. SESSION UPDATE — 2026-09-24
============================================================

Active branch:
- clearance/learning-assessment-architecture
- current head at this update is maintained by the latest repository commit.

Documentation audit:
- all files under docs/ and prompts/ were reviewed against the active source tree.
- the Beginner course document was stale about prerequisite-diagnostic coverage; it now states all seven Beginner sections.
- the assessment item schema now states twenty-one pilot banks, matching the authoritative programme baseline.
- the book/curriculum.tex remains the retained five-day intensive legacy/core curriculum and was not treated as the authoritative 21-section application catalogue.

Runtime/evidence contract reconciliation:
- RuntimeTask.scope is again typed as RuntimeVerificationScope ("probe" | "exercise").
- MachineVerificationEnvelope again carries verificationSource ("local-runner" | "managed-runner").
- evidence.ts now has exactly one machine-verification recording path.
- machine evidence is validated before it enters the evidence ledger.
- machine evidence preserves runtime scope and verification source.
- the local runner identifies its evidence as local-runner.
- the default runner is dry-run; actual execution requires explicit --execute.
- destructive catalog commands remain rejected by the default runner.
- resetRequired tasks fail closed because the default runner has no reset adapter yet.
- machine verification rejects duplicate/unknown step results, invalid identity, invalid platform mappings, invalid timing order, empty output hashes, non-passing steps, and missing required steps.

Test expansion:
- runtime verification tests now cover contract-version mismatch, duplicate/unknown step results, invalid verification source, reset boundaries, nonzero-exit inconsistencies, timestamp ordering and valid machine evidence.
- evidence tests now cover validation-gated machine evidence persistence and runtime scope/source retention.
- programme integration tests now lock the complete 32-lesson intermediate section map and cross-course lesson/section/project/platform invariants.
- diagnostics tests no longer maintain a duplicated hard-coded lesson-ID catalogue; they derive lesson identity from courseLessons.
- the project-contract validator's malformed intermediate-lesson regex was corrected.

CI status:
- latest branch head reviewed: fdeaab70d559d29315c28fe098a335bc89579a1c.
- latest pull-request run observed for that head: #649.
- run #649 concluded failure at the GitHub job level.
- its build job exposes no step list or downloadable artifact through the connector.
- an earlier failed run was explicitly re-run and failed again, so the failure is reproducible at the workflow/job boundary, but the failing application stage remains unobservable.
- recent push and pull-request workflow runs still report failure.
- the GitHub connector exposes the failed build job but its log endpoint currently returns BlobNotFound and job step details are null.
- therefore no CI stage is being declared failed or passed from these runs.
- the latest application-level source fixes should be revalidated by the next observable CI run before any runtime-task expansion is considered green.

Project-contract gap still open:
- the documented project contract includes change history and incident history.
- ProjectDefinition currently models milestones, failure scenarios, evidence requirements and completion criteria, but does not yet model explicit change-history or incident-history records.
- The evidence ledger is not being treated as a substitute for those project history records.
- Do not silently mark this requirement complete.

Next gate:
1. obtain observable test-stage evidence from CI or a working local checkout/dependency environment.
2. resolve any actual test/build failures.
3. only after the test/build gate is green, continue runtime expansion from observation-only tasks toward reversible changes, controlled failures, recovery and finally reset verification.
============================================================
23. BEGINNER MILESTONE UPDATE — 2026-09-24
============================================================

Beginner source-contract audit is now clean:
- 10 authored lessons: B1.1 through B3.2
- 7 sections: B-F1, B-F2, B-A1, B-A2, B-A3, B-A4, B-A5
- 3 projects: B1, B2, B3
- 7 prerequisite diagnostics, four questions each
- 7 assessment banks / 280 pilot items
- exact family counts per bank: 20 conceptual / 12 diagnostic / 8 hands-on
- exact difficulty distribution per family: 15% / 35% / 35% / 15%
- cognitive-level coverage and competency ownership checked
- response-schema defects in B-A2 through B-A5 were corrected
- legacy B-F1 hands-on item shape was normalized to the current hands-on assessment contract
- missing constructed-response expected elements in B-F1, B-F2 and B-A1 were authored
- all 10 Beginner lessons now have explicit, lesson-specific hands-on task definitions
- 10 Beginner podcast scripts are present and substantial; their episode identities match the lesson IDs

New Beginner tests:
- app/tests/unit/beginner-course.test.mjs
- app/tests/integration/beginner-course.integration.test.mjs
- scripts/check-beginner-gate.mjs
- CI now has a dedicated Beginner gate before the full build.

CI execution blocker:
- GitHub Actions continues to fail before exposing usable step logs.
- Independent isolation produced failure for the zero-dependency Beginner runner-smoke job as well as application jobs.
- This means the current blocker is outside the Beginner application/test logic; the repository cannot currently obtain hosted-runner execution evidence.
- Do not mark the Beginner milestone "CI green" until a hosted runner actually executes the gate successfully.
- Do not weaken tests or remove the gate to manufacture green status.

Current Beginner status:
- Source/contracts: green by direct repository-content audit.
- Test files: implemented and strengthened.
- GitHub execution evidence: blocked by Actions runner/infrastructure observability.
- Machine-verification coverage: only the previously defined B1.2 local probe; the rest remains structured evidence, by design.

Next work:
1. Restore observable GitHub Actions execution or provide a working local checkout/runtime.
2. Run the focused Beginner gate and fix only real execution failures.
3. Once Beginner is genuinely green, move to Intermediate.
 
Project contract closure:
- ProjectDefinition now explicitly models changeHistory and incidentHistory.
- All nine projects have authored non-empty change and incident histories.
- check-project-contract.mjs now validates these fields.
- Beginner unit and focused gate tests require them for B1/B2/B3.
- The global project contract is therefore no longer structurally missing these fields.

