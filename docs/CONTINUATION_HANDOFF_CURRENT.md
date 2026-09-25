# Current Continuation Handoff — DevOps Programme

**Status snapshot:** 2026-09-25

**Repository:** `shennagyp-netizen/devops_programme`

**Current branch:** `main`

**Latest main architecture/content merge:** PR #33, commit `d3c49338180d948d0d5f7284713a91ead65267b1` (gold-standard script + illustration slice).

**Current architecture:** Next.js 16.3.6 + React 19.2.8 + first-party self-hosted sessions + Drizzle/PostgreSQL + Next.js Server Actions. The learner experience remains SPA-like, while authentication and persistence are server-authoritative. No external identity provider is used.

**Current learner-state rule:** one authenticated user + item type + item ID = one append-only completion row.

**Authentication:** First-party application auth is the identity authority. The browser never creates or submits a trusted learner ID. Passwords and sessions are owned by the application and stored through PostgreSQL-backed auth state.

**Persistence:** PostgreSQL + Drizzle. Completion history is order-independent and keyed by authenticated user + item type + item ID. Duplicate completion is idempotent. There is no uncomplete operation.

**API rule:** no custom progress REST API. Browser completion writes use one Server Action.

**TDD rule:** unit tests define the completion input contract; integration tests define the authentication/Server Action boundary; repository contract tests reject the obsolete Vite/API/anonymous-progress architecture.

**CI truth:** GitHub-hosted runners execute the full programme gate. The PR #33 head passed the complete gate before merge: all programme contracts, full unit/integration tests, TypeScript typecheck and Next.js production build succeeded.

**Historical sections:** earlier sections record previous milestones and superseded designs. Sections 30–31 are retained for audit history only; section 32 and the final authenticated architecture are current.

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
- human example- lab/command entry point
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

## 4.2 CONTINUOUS CO-TEACHER VOICE — CURRENT

The spoken layer is now explicitly a continuous co-teacher attached to the active lesson.

Current UI contract:
- there is no separate top-level Listen/co-teacher lesson mode
- `PodcastCoach` remains mounted while the learner switches between Learn, Do, Recall, Design and Assessment
- the voice/transcript control is a persistent lesson layer
- real aligned audio drives transcript position and authored prediction/lab/recall pauses
- authored learner-action cues pause speech deliberately; they do not terminate the lesson voice session
- the learner can resume the same voice session after completing the relevant action
- the learner may explicitly pause or seek
- browser autoplay restrictions may require one initial user gesture
- changing lesson resets the voice session for the new lesson.

This is different from the old implementation, where the co-teacher appeared only under a separate `listen` mode and its flow stopped at the lab. That old interaction is superseded.

Video/content-feed rule:
- video is a content block inside the ordered lesson feed
- video does not own the learner's voice session
- the continuous co-teacher remains the primary spoken companion while the learner reads, watches or operates
- authored video may have its own cues, but it must not create a second competing spoken-session architecture.

TDD coverage:
- `app/tests/integration/lesson-voice-continuity.integration.test.mjs` rejects the separate listen mode and verifies the persistent co-teacher source contract.
- `app/tests/integration/lesson-content-stream.integration.test.mjs` verifies ordered rendering, draft-video safety, captions/transcript behavior, navigation, IntersectionObserver cleanup and the absence of a second voice owner.
- `app/tests/integration/course-lesson-content.integration.test.mjs` verifies that every current course lesson receives a valid content stream with stable per-lesson ids.
- `app/tests/unit/lessonContent.redteam.test.mjs` covers malformed payloads, unsafe media, draft/published source rules, accessibility metadata, durations and cue boundaries.
- `app/tests/unit/podcastSync.redteam.test.mjs` covers manifest security, duplicate identities, timeline ordering, cue boundaries and fail-closed loading.
- `app/tests/unit/podcastsRaw.test.mjs` covers episode extraction and deterministic speaker-turn classification.
- `app/tests/integration/lesson-panel.integration.test.mjs` verifies completion/evidence boundaries and lesson-mode invariants.

## 4.1 ORDERED LESSON CONTENT STREAM

The lesson presentation now supports an ordered content stream.

Current implementation:
- `app/src/data/lessonContent.ts` is the authoritative lesson-content contract.
- `LessonContentFeed` renders the stream as a vertical reading/visual/video feed with a content index and smooth scrolling.
- Supported block types are text, illustration and video.
- Video supports draft/published status, root-relative or HTTPS media sources, posters, captions, transcripts, duration and authored timing cues.
- Draft video slots do not load missing assets.
- `CourseLesson.content` carries the resolved content stream.
- B1.4 currently contains an explicit draft video authoring slot; no real video asset is claimed or loaded.
- Podcast/co-teacher synchronization remains a separate contract driven by real audio timing manifests.
- Required instructional meaning must remain available in written lesson content even when no video is published.

Tests:
- `app/tests/unit/lessonContent.test.mjs` covers the baseline content contract.
- Red-team content tests extend that baseline with security and malformed-input boundaries.

Validation state:
- The canonical programme gate completed green on current branch head `10e8efc572465c7f4feb4d68e184a7d6f3db7d00`.
- The full unit/integration suite completed green with 209 tests across 26 test files.
- Content, assessment, diagnostics, project, platform, hands-on, beginner/intermediate/advanced/programme completeness, runtime verification and authenticated progress architecture contracts all completed green.
- TypeScript typecheck and the Next.js production build completed green.
- The assessment bank contract now accepts the authored diagnostic response shape where `itemType` is a string or non-empty string array and `expectedElements` is a positive count or string list; this matches the existing authored pilot banks and is explicitly validated.
- The project contract checker was corrected to inspect intermediate project mappings in `courseLessons.ts`; the hands-on contract checker was corrected so its JavaScript template literals parse correctly.
- Live browser/visual verification is not yet validated because the connected Vercel account exposes no project/team deployment access in this session. No preview browser result is claimed.



============================================================
ANIMATION / CURRICULUM BINDING — CURRENT OVERRIDE
============================================================

As of 2026-09-25, the animation platform is merged to main at commit 97d4f25345a7cae09b393f3b017e7e5d3502c22d.

Post-merge workflow run 36082470933 completed successfully. The full-programme-gate job completed all programme-contract, unit/integration, TypeScript typecheck and Next.js production-build steps successfully.

The next animation implementation boundary is the curriculum-to-illustration binding contract. Do not scale the scenario catalogue before this contract is implemented and tested.

Authoritative rule:
Curriculum determines the exact instructional sequence. Illustration bindings connect curriculum content to reusable animation capabilities. The animation library does not decide lesson order, learner progression or instructional intent.

The normative binding document is docs/curriculum/CURRICULUM_ILLUSTRATION_BINDING.md.
The animation-specific continuation addendum is docs/CONTINUATION_HANDOFF_ANIMATION.md.

The current animation platform already includes reusable contracts, deterministic runtime, shared SVG rendering, accessibility/reduced-motion behavior, geometry validation and the HTTP request reference scenario. Browser visual validation remains unclaimed.

The immediate implementation order is:
1. curriculum illustration-binding contract
2. binding validators
3. unit/integration/red-team coverage
4. full programme gate
5. browser visual validation when a real preview is accessible
6. additional reusable animation scenarios.

Do not let animation definitions accumulate lesson-specific IDs or lesson-order logic.

============================================================
END ANIMATION / CURRICULUM BINDING OVERRIDE
============================================================


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

============================================================8. SPOKEN CONTENT CONTRACT
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

Next gate:1. obtain observable test-stage evidence from CI or a working local checkout/dependency environment.
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
 
Hosted-runner diagnosis:
- A temporary workflow containing one Ubuntu job with one shell command and no checkout, Node setup, dependencies or repository access also failed after roughly four seconds.
- This isolates the remaining GitHub Actions failure from the Beginner code, package installation, checkout logic and marketplace actions.
- The temporary probe was removed after the diagnosis.
- GitHub's public status API reported the Actions component operational at the latest status snapshot, so the failure is specific to repository/account runner availability or permissions rather than a confirmed platform-wide outage.
- The repository must not claim CI green until a real hosted job starts and completes successfully.
 
BEGINNER GATE CLOSED — 2026-09-24
- Hosted runner is pinned to ubuntu-24.04. The previous ubuntu-22.04 probe failed immediately; ubuntu-24.04 completed successfully.
- The Beginner CI gate is intentionally scoped to Beginner during this clearance milestone.
- PR-triggered run #719 completed successfully.
- Beginner structural contract: PASS.
- Beginner unit tests: PASS.
- Beginner integration tests: PASS.
- Beginner completeness validator: PASS.
- Beginner gate therefore has real hosted CI evidence, not source-only inspection.
- The temporary hosted-runner probe workflow has been removed.
- The dependency-resolution defect was fixed by aligning Vite with @vitejs/plugin-react: Vite is now ^8.3.0 while @vitejs/plugin-react remains ^6.1.1.
- The Beginner podcast integration test now checks stable episode identity rather than exact punctuation/quote style in the lesson title.
- The Beginner gate validator now treats hands-on assessment items using their dedicated hands-on contract instead of requiring generic response scoring.
- The full-program build remains intentionally deferred during this Beginner-first clearance. Its latest observed run exposed unrelated Intermediate/Advanced contract and syntax defects; those are not being marked fixed or hidden by this Beginner milestone.



============================================================
24. VERIFIED REMOTE EXECUTION + MANUAL FALLBACK — 2026-09-24
============================================================

The hands-on execution model is now explicitly two-path:

1. Manual terminal execution
- always available
- browser displays the platform-specific command
- learner executes the command on their own machine
- learner records structured observation/change/failure/recovery evidence
- structured evidence is never labeled machine-verified.

2. Optional verified remote execution
- current transport: SSH
- target: real Linux or macOS VM or physical machine
- execution is driven only by the authoritative runtimeTasks.json catalogue
- SSH host-key checking is strict
- destructive runtime steps are rejected
- runner records step result, exit code, output hashes, timestamps and target identity
- generated envelope is imported into the browser and validated before entering the evidence ledger.

Implementation:
- scripts/remote-runtime-core.mjs
- scripts/run-remote-runtime-task.mjs
- app/tests/unit/remote-runtime-core.test.mjs
- expanded runtime runner integration tests
- runtimeVerification.ts now distinguishes:
  - local-machine / local-runner
  - remote-machine / ssh-runner
  - managed-runner remains reserved for a future managed service
- LessonPanel now exposes the optional verified execution path where a machine-verification task exists and provides JSON evidence import.
- .runtime-evidence/ is ignored by git.
- docs/curriculum/HANDS_ON_RUNTIME_VERIFICATION.md documents the complete boundary and fallback behavior.

Important trust boundary:
- the browser does not open SSH.
- the current SSH runner provides execution-backed evidence, not cryptographic remote attestation.
- the target must already be trusted by known_hosts.
- a returned JSON envelope is accepted only after structural validation against the exact runtime task contract.

Current verified-task coverage remains intentionally narrow:
- B1.2 only
- DNS resolution
- HTTPS port reachability
- non-destructive observation/probe.

Manual execution remains the course fallback for every lesson, including lessons without a verified runtime task and Windows lessons not yet supported by the SSH runner.

This change does NOT claim complete machine verification of the hands-on catalogue and does NOT claim a deployed managed execution service.


Runtime result output clarification:
- Verified runners now return bounded stdout/stderr as well as stdout/stderr hashes and exit state.
- The browser displays the returned machine results after successful envelope import.
- Captured stdout/stderr are capped at 64 KiB per stream.
- The manual path remains independent and does not require remote execution.
- The remote runner currently supports Linux/macOS SSH targets; Windows continues through the manual path.
- No cryptographic remote attestation is claimed; SSH verification relies on strict known-host checking and the fail-closed application envelope validator.


============================================================
25. LOCAL WEBSITE-TO-LAPTOP TERMINAL BRIDGE — 2026-09-24
============================================================

The normal learner path now has a direct website-to-laptop execution option.

New local agent:
- scripts/devops-terminal-agent.mjs
- listens only on 127.0.0.1:4317 by default
- started with: npm run terminal-agent
- generates or accepts a pairing token
- accepts only catalogued runtime task IDs
- uses shell=false
- rejects destructive steps
- rejects task/platform mismatch with the actual laptop OS
- returns machine-verification envelopes directly over localhost.

Browser client:
- app/src/data/localTerminalAgent.ts
- detects local agent availability
- stores the pairing token locally
- invokes the exact runtime task
- imports the returned envelope into the existing fail-closed verifier.

Lesson UI:
- a verified laptop-terminal button is now available for runtime-task lessons
- actual laptop command results are displayed in the lesson
- manual terminal execution remains visible and usable when the agent is absent.

Important:
- no arbitrary browser shell exists.
- the website requests only allowlisted runtime tasks.
- the local agent is optional; manual execution remains the fallback.
- the local agent currently covers the same B1.2 non-destructive runtime task already present in the catalogue.
- Windows is supported by the local agent when the browser's selected environment matches the Windows host; SSH remote execution remains limited to Linux/macOS.
- local-network/loopback browser permission behavior varies by browser, so agent unavailability must never block the manual path.

============================================================
26. FULL PROGRAMME CLEARANCE AUDIT — 2026-09-24
============================================================

Repository-level structural clearance is complete for the active branch.
Authoritative counts:
- Beginner: 7 sections, 10 lessons, 3 projects, 7 diagnostics, 7 banks, 280 items.
- Intermediate: 8 sections, 32 lessons, 3 projects, 8 diagnostics, 8 banks, 320 items.
- Advanced: 6 sections, 11 lessons, 3 projects, 6 diagnostics, 6 banks, 240 items.
- Global: 21 sections, 53 lessons, 9 projects, 21 diagnostics, 21 banks, 840 pilot items.

Bank contract audit:
- Every authored bank is valid JSON and contains 40 items.
- Every bank contains 20 conceptual / 12 diagnostic / 8 hands-on items.
- Existing difficulty and hands-on schema contracts remain intact.

Intermediate mapping audit:
- All 32 authored Intermediate lessons resolve explicitly.
- Section distribution: I-F1=3, I-F2=7, I-A1=3, I-A2=3, I-A3=2, I-A4=6, I-A5=2, I-A6=6.
- Project distribution: I1=18, I2=6, I3=8.
- Unknown section/project mappings now fail closed instead of falling through to a default.

Validator repairs:
- Intermediate/Advanced/Programme completeness scripts no longer contain malformed escaped template literals.
- Curriculum lesson parsing uses the actual quoted id source shape.
- Diagnostics mapping validation uses the actual curriculum source shape.
- Project contract validation understands generated Intermediate project mappings.
- CourseLesson now supplies the required humanExample field for authored Beginner/Advanced lessons.

Local terminal execution:
- Local website-to-laptop terminal agent is implemented.
- Agent is loopback-only, token-authenticated, allowlist-driven, shell-free and platform-bound.
- Website detects the agent, sends an exact runtime task ID and displays returned stdout/stderr/results.
- Manual terminal execution remains the fallback.
- Probe runtime evidence cannot unlock a lesson; only a full exercise-scoped machine task can satisfy machine-verification completion.
- Current machine task coverage remains B1.2 probe only.

CI evidence:
- GitHub Actions run #834 on the Ubuntu gate failed before exposing any workflow step.
- Ubuntu/latest also failed with the same zero-step job behavior.
- macOS-latest also failed before exposing any workflow step.
- The remaining hosted-CI problem is therefore runner provisioning/availability, not an observed application test failure.
- The intended workflow runner is restored to ubuntu-24.04.
- Hosted CI is not claimed green.
- Tests are not weakened to manufacture a green result.

Merge status at handoff:
- Source/contracts are structurally cleared by repository audit.
- Hosted CI remains infrastructure-blocked and therefore there is no honest hosted-green evidence.

============================================================
27. POST-MERGE ASSESSMENT CONTRACT CLEARANCE — 2026-09-24
============================================================

After merge to main, an exhaustive authored-bank audit found nine Intermediate constructed-response items without expectedElements:
- I-F1: IF1-C-006, IF1-C-009, IF1-C-013, IF1-C-017, IF1-C-020.
- I-F2: IF2-C-006, IF2-C-009, IF2-C-013, IF2-C-017.

All nine were completed with explicit scoring expectations.

Post-fix bank audits:
- Beginner: 7/7 banks, 280 items, zero schema findings.
- Intermediate: 8/8 banks, 320 items, zero schema findings.
- Advanced: 6/6 banks, 240 items, zero schema findings.
- Family sizes remain exactly 20 conceptual / 12 diagnostic / 8 hands-on.
- Difficulty distributions remain exactly 15% / 35% / 35% / 15% per family.

CI configuration:
- main workflow is restored to ubuntu-24.04.
- workflow_dispatch was added so the full gate can be manually retriggered after the GitHub Actions startup problem is resolved.
- Disposable CI validation PR #10 was closed without merge.

Hosted CI remains blocked before workflow steps by GitHub Actions startup failure. This is not being represented as green.


============================================================
28. HOSTED CI STARTUP BLOCKER — 2026-09-24
============================================================

The canonical main workflow is now a full-programme gate:
- ubuntu-24.04 runner
- all content/assessment/diagnostic/project/platform/hands-on/programme/runtime checks
- full unit + integration test suite
- TypeScript build
- Vite production build at the time of this historical snapshot
- workflow_dispatch trigger for manual reruns.

This section is historical. The current branch uses Next.js and replaces the Vite build with `next build`.

Exhaustive source audit after the merge found and fixed nine Intermediate constructed-response items missing expectedElements. Beginner/Intermediate/Advanced bank audits now report zero schema or difficulty-distribution findings.

Hosted CI remains the only unverified boundary.

Observed runner failures:
- #834: ubuntu-24.04, zero workflow steps.
- #843: ubuntu-slim, zero workflow steps.
- #847: full programme gate, ubuntu-24.04, zero workflow steps. A retry briefly reached in_progress, then terminated before any visible step.
- #849: full programme gate, ubuntu-26.04, zero workflow steps.
- ubuntu-latest and macos-latest were also tested and failed before steps.

GitHub public documentation confirms these standard runner labels are supported for private repositories. GitHub September 2026 community reports also document the same private-repository startup_failure/zero-step pattern.

Repository issue #12 records the exact evidence and run identifiers.

Important operational boundary:
- No source code, test, or workflow step has been observed failing.
- GitHub Actions currently prevents the first step from executing.
- The remaining cause is likely account/repository Actions entitlement, spending/budget enforcement, or GitHub-side workflow/runner provisioning state.
- GitHub Free currently includes 2,000 standard-hosted Actions minutes per month; GitHub blocks usage after the included quota when no valid payment/allowance is available.

Do not weaken the full gate, mark it green manually, or merge a failing check just to remove the red state.


============================================================
29. FINAL GITHUB ACTIONS RE-TEST — 2026-09-24
============================================================

The GitHub Actions configuration is complete as a repository-side full-programme gate.

Final verification attempt:
- PR #14: CI: finalize GitHub Actions full-programme gate.
- Commit: 81465993490239fba2a3a7bacb891c5ae1d47355.
- Run #852 / run id 36022779623.
- Workflow: devops-programme-app.
- Job: full-programme-gate.
- Job id: 107711587429.
- Result: failure before any visible workflow step executed.
- Step list: empty.
- Job logs: unavailable because no runner step execution occurred.

The PR was closed without merge. No failing check was merged, and no test was weakened to manufacture a green result.

The canonical main workflow remains the complete full-programme gate with:
- all authored content/assessment/diagnostic/project/platform/hands-on/programme/runtime contracts
- full unit + integration test suite
- TypeScript compilation
- Vite production build at the time of this historical snapshot
- workflow_dispatch support.

This section is historical. The current branch uses Next.js and replaces the Vite build with `next build`.

Conclusion:
- Repository-side GitHub Actions configuration: complete.
- Application/test workflow execution on GitHub-hosted runners: still blocked before first step by the same infrastructure/startup condition.
- No hosted-green result exists yet.
- Once Actions execution is restored at the account/repository level, the existing workflow can be rerun through workflow_dispatch or a normal pull request; the gate itself is already configured to validate the complete programme.


============================================================
30–31. HISTORICAL LEARNER-PROGRESS DESIGN — SUPERSEDED
============================================================

The earlier anonymous learner UUID + `/api/progress` design was replaced before the authenticated application architecture was finalized.

Those sections are retained as historical audit evidence only.

The current learner-progress architecture is defined below.

============================================================
32. CURRENT AUTHENTICATED SPA ARCHITECTURE — 2026-09-24
============================================================

The application architecture is now intentionally single-path.

Framework:
- Next.js 16 App Router
- React 19.2.8
- Clerk 7.9.4
- Drizzle ORM
- PostgreSQL.

The learner experience remains a highly interactive SPA-like client shell, but security-sensitive operations are server-owned.

Authoritative request path:

Browser UI
-> Next.js Server Action
-> Clerk authenticated user ID
-> validated completion contract
-> Drizzle
-> PostgreSQL.

There is no custom progress REST API.
There is no client-generated learner ID.

There is no client authority over the learner identity.

Authentication:
- Clerk sign-up
- Clerk sign-in
- Clerk session
- Clerk `UserButton`
- Clerk manages the user's profile/security interface.

Next.js 16 uses `src/proxy.ts` for the Clerk request boundary.

The root layout places `ClerkProvider` inside `<body>`.

Protected page flow:
1. `src/app/page.tsx` calls Clerk `auth()`.
2. Missing authentication redirects to `/sign-in`.
3. The server reads completion history using the authenticated Clerk user ID.
4. The server passes the initial history to the interactive App component.
5. The client displays progress without an initial browser fetch.
6. Completing an item calls one Server Action.
7. The Server Action obtains the authenticated user ID again.
8. The server validates the item contract.
9. PostgreSQL enforces the supported item types and unique user/item identity.
10. Duplicate completion is ignored.
11. The original `completed_at` remains unchanged.

Persistent history:
- table: `learner_progress_history`
- one row per user + item type + item ID
- server-generated `completed_at`
- no delete/uncomplete operation
- no terminal history.

Not persisted:
- stdout
- stderr
- failed attempts
- retries
- machine envelopes
- command history
- intermediate UI interaction.

TDD:
- red tests were written before the authenticated implementation
- completion input tests define the accepted input boundary
- Server Action integration tests define the authentication boundary
- repository architecture contract rejects the old Vite/API/anonymous-identity architecture
- database schema adds a PostgreSQL item-type check in addition to application validation.

Single-choice rule:
Do not introduce another authentication library, another progress API, another learner-ID mechanism, or another client/server persistence path without first changing the architecture contract and its tests.

Current CI truth:
- the repository-side workflow is configured for the Next.js build
- GitHub-hosted runner startup has historically failed before visible steps
- therefore no hosted-green result is claimed until a real runner executes the gate.

Current files:
- `app/src/app/layout.tsx`
- `app/src/app/page.tsx`
- `app/src/app/actions/progress.ts`
- `app/src/app/sign-in/[[...sign-in]]/page.tsx`
- `app/src/app/sign-up/[[...sign-up]]/page.tsx`
- `app/src/proxy.ts`
- `app/src/lib/progress-contract.ts`
- `app/src/lib/server/schema.ts`
- `app/src/lib/server/db.ts`
- `app/src/lib/server/progress.ts`
- `app/drizzle/migrations/0000_learner_completions.sql`
- `app/tests/unit/progress-contract.test.mjs`
- `app/tests/integration/progress-action.test.mjs`
- `scripts/check-learner-progress-contract.mjs`

The old anonymous progress test was removed because its API/client implementation no longer exists.

Next engineering work should continue from this architecture rather than reintroducing the previous client/API model.


============================================================
33. AUTHENTICATED NEXT.JS ARCHITECTURE MERGED — 2026-09-24
============================================================

The previous anonymous browser-UUID + Vite + progress-REST design has been removed.

The current application has one supported path:

Browser SPA shell
-> Next.js 16 App Router
-> Clerk authentication
-> Next.js Server Action
-> Drizzle ORM
-> PostgreSQL.

Authentication and user management:
- Clerk sign-in
- Clerk sign-up
- Clerk UserButton account controls
- authenticated user ID is the only learner identity.

Learner completion:
- `learner_progress_history`
- one row per authenticated user + item type + item ID
- append-once
- idempotent duplicate completion
- server-generated completion time
- no delete/uncomplete path
- no terminal history persistence.

Old architecture removed:
- Vite bootstrap
- Vite production build
- browser-generated learner UUID
- `/api/progress`
- anonymous progress client
- obsolete anonymous progress tests.

TDD:
- unit tests define the completion input boundary
- integration tests define the authentication/server-action boundary
- repository contract test rejects the obsolete architecture
- PostgreSQL enforces the supported item-type invariant and unique user/item identity.

The branch is intended to be merged to `main` only as this single architecture. A hosted CI failure caused by runner infrastructure must remain visible rather than being bypassed or reclassified as a source-code pass.

============================================================
34. CURRICULUM ILLUSTRATION BINDING IMPLEMENTED — 2026-09-25
============================================================

The curriculum-to-illustration binding architecture is implemented on the active feature branch and has passed the full canonical programme gate.

Latest verified workflow:
- run: 36087678753
- job: full-programme-gate
- conclusion: success
- 41 test files
- 297 tests
- TypeScript typecheck: success
- Next.js production build: success.

Implemented source:
- app/src/data/illustrationBindings.ts
- app/src/data/curriculumIllustrationBindings.ts
- app/src/data/lessonContent.ts
- app/src/components/LessonContentFeed.tsx

Architecture:
Curriculum -> ordered lesson content -> curriculum illustration binding registry -> reusable animation capability -> deterministic runtime -> renderer.

The binding registry is curriculum-owned. Static visual bindings are deterministic from lesson content. Interactive and animated bindings require explicit authored binding records. Missing or stale bindings fail closed; there is no silent generic-animation fallback.

The reusable animation library remains independent of curriculum data and lesson identity. PodcastCoach remains the voice authority.

Browser visual validation remains unclaimed.

Next implementation:
- author the first real animated/interactive curriculum binding
- connect it to the actual PodcastCoach audio clock
- validate rendered behavior in an accessible browser preview
- then expand the reusable animation scenario library.


============================================================
ANIMATION / STANDALONE PREVIEW — CURRENT OVERRIDE — 2026-09-25
============================================================

PR #22 establishes a true standalone launch surface for the reusable animation library.

Branch:
- `feature/standalone-animation-playground-v1`

Latest branch head:
- `7d9330dfb81ffdacb96440421c36038de87df9bf`

Latest green branch gate:
- workflow run `36089003221`
- `full-programme-gate`
- completed success
- 44 test files / 310 tests
- programme contracts passed
- TypeScript typecheck passed
- Next.js production build passed.

Standalone routes:
- `/animations`
- `/animations/[animationId]`

The distinction is now explicit:

1. Reusable animation library: definitions/contracts/runtime/stage, independent of curriculum.
2. Standalone preview host: local development/inspection clock and controls.
3. Curriculum binding: production instructional use, authored by curriculum.
4. PodcastCoach: production audio-clock authority.

The preview host must never become a second curriculum, learner-progress system or production audio owner.

Preview cue fixtures are demonstration material only. Production curriculum bindings must use the actual PodcastCoach audio clock.

Browser visual validation remains **Not yet validated** until an accessible preview deployment exists.

The next work boundary after merge is:
- confirm post-merge main green;
- browser visual validation when available;
- author the first real interactive/animated curriculum binding;
- connect it to the existing PodcastCoach audio clock;
- then expand animation scenarios.

============================================================
END ANIMATION / STANDALONE PREVIEW CURRENT OVERRIDE
============================================================


============================================================
ANIMATION / STANDALONE PREVIEW — POST-MERGE CURRENT MAIN OVERRIDE — 2026-09-25
============================================================

PR #22 is merged.

Authoritative merge:
- merge commit: `d6f659e174af388dc11d8e43a56dd40dda722945`
- post-merge main workflow: `36089271904`
- `full-programme-gate`: success
- 44 test files / 310 tests
- TypeScript typecheck: success
- Next.js production build: success.

The standalone animation capability is now on main.

Direct launch surfaces:
- `/animations`
- `/animations/[animationId]`

The three-layer separation is authoritative:
- reusable animation definitions/runtime/stage
- standalone preview host with a local inspection clock
- curriculum illustration bindings for production teaching.

PodcastCoach remains the only production audio-time authority.

Browser visual validation remains **Not yet validated** because no accessible Vercel preview is currently exposed through the connected account.

Next implementation boundary:
- author the first real curriculum animated/interactive binding;
- connect it to the actual PodcastCoach audio clock;
- validate in browser when a real preview is available;
- then expand reusable scenarios.

============================================================
END ANIMATION / STANDALONE PREVIEW — POST-MERGE CURRENT MAIN OVERRIDE
============================================================


============================================================
VERCEL VISUAL AUDIT DEPLOYMENT TRIGGER — 2026-09-25
============================================================

A documentation-only commit is being merged to `main` to trigger the newly connected Vercel project `devops-programme` without changing application behavior. This deployment exists solely to enable browser visual validation before the next application implementation slice.

No curriculum, runtime, authentication, persistence, or animation behavior is changed by this trigger.

============================================================
END VERCEL VISUAL AUDIT DEPLOYMENT TRIGGER
============================================================


============================================================
VERCEL VISUAL VALIDATION DEPLOYMENT BOUNDARY — 2026-09-25
============================================================

Vercel access is now authorized for team `shennagyp-8842`, and the `devops-programme` project is reachable.

Deployment finding:
- Production deployment `dpl_6ACAE4n5GQSGiWfxRbjaWifib5Dh` was READY but served 404 because Vercel was building the repository root rather than the Next.js application under `app/`.
- Its build log completed in 141 ms without running Next.js.
- A repository-level `vercel.json` workaround was tested, but Vercel still reported no Next.js dependency at the configured project root. The workaround is therefore removed rather than retained as a misleading deployment configuration.
- The working CAGI project confirms the expected Vercel behavior: Vercel detects Next.js from the application root, installs dependencies there, runs `npm run build`, and exposes the generated App Router routes.

Required Vercel project configuration for this repository:
- Root Directory: `app`
- Framework Preset: Next.js
- Build Command: default / auto-detected
- Install Command: default / auto-detected
- Output Directory: default / auto-detected.

This is a Vercel project setting, not application source behavior. Do not add a root-level package/Next.js shim or legacy Vercel builder merely to compensate for an incorrect Root Directory.

Visual validation remains blocked until the Vercel project Root Directory is set to `app` and a fresh deployment reaches READY. Once that is true, browser visual evaluation is the next gate before further curriculum-animation implementation.

============================================================
END VERCEL VISUAL VALIDATION DEPLOYMENT BOUNDARY
============================================================


Vercel Root Directory has been corrected to `app`; this commit exists only to trigger a fresh main deployment for the visual audit.


============================================================
VERCEL VISUAL GATE — CURRENT STATUS — 2026-09-25
============================================================

Vercel authorization is now working for team `shennagyp-8842` and project `devops-programme`.

Verified project state:
- Framework: Next.js
- Repository: `shennagyp-netizen/devops_programme`
- Application directory: `app/`
- Root-level `vercel.json` workaround was removed.
- Vercel Project Root Directory has been changed to `app` by project configuration.

Deployment history:
- Root deployment before correction: READY but served 404 because Vercel built the repository root without Next.js.
- Repository-level workaround deployment: failed because Vercel framework detection still operated at the wrong project root and could not detect the `next` dependency.
- Fresh main deployment after the project Root Directory correction: `dpl_GRybEmz1XwaMTZiyF5rKdRN3LQuA`, source commit `4c4e421f6cce99db248df735f57be06514dd6e71`, currently queued while Vercel processes the deployment.

Visual validation status:
- Not yet validated.
- The production aliases currently redirect through Vercel SSO when accessed through the server-side fetch path.
- A Vercel temporary share mechanism is available and must be used against the actual deployment URL when deployment protection is enabled.
- Do not claim browser/UI validation until a rendered page is actually inspected.

Required next gate:
1. Confirm `dpl_GRybEmz1XwaMTZiyF5rKdRN3LQuA` reaches READY.
2. Obtain temporary deployment access for that exact deployment URL if SSO protection is still enabled.
3. Inspect `/`, `/animations`, individual animation routes, authentication routes and the learner surface in a real browser.
4. Record visual findings before further curriculum-animation implementation.

This section supersedes stale statements elsewhere that describe Vercel project access as unavailable. Access is now available; the remaining boundary is deployment readiness/protection and actual browser rendering.

============================================================
END VERCEL VISUAL GATE — CURRENT STATUS
============================================================


============================================================
VERCEL VISUAL GATE — READY DEPLOYMENT CONFIRMED — 2026-09-25
============================================================

The Vercel Project Root Directory correction is now proven by a successful deployment.

Verified:
- Project: `devops-programme`
- Framework: Next.js
- Vercel Project Root Directory: `app`
- READY deployment: `dpl_GRybEmz1XwaMTZiyF5rKdRN3LQuA`
- Deployment URL: `devops-programme-17mn4801j-shennagyp-8842.vercel.app`
- Source: `main`, commit `4c4e421f6cce99db248df735f57be06514dd6e71`

Build behavior is now correct. The prior 404/root-build problem is resolved; the successful deployment is the first deployment produced from the corrected application root.

Browser visual validation remains **Not yet validated** because the deployment is protected by Vercel SSO. The Vercel connector can generate a temporary share URL, but the available server-side fetch cannot persist the SSO cookie required to complete the share flow. No UI result is inferred from this protected response.

Next gate:
- provide browser-level access to the READY deployment (or disable Deployment Protection for the deployment/project);
- inspect the actual rendered application;
- record visual findings;
- only then continue the curriculum-animation implementation.

============================================================
END VERCEL VISUAL GATE — READY DEPLOYMENT CONFIRMED
============================================================

============================================================
35. PUBLIC PROGRAMME SITE + AUTHENTICATED LEARNER GATEWAY — 2026-09-25
============================================================

The application now has two deliberate surfaces.

PUBLIC PROGRAMME SITE:
- Route: / 
- Purpose: explain and market the DevOps Programme without requiring an account.
- It contains the programme hero, course levels, learning method, project spine and a clear entry point into the learner gateway.
- The public route must not call Clerk auth(), require a Clerk provider, or depend on learner-progress storage.
- The public route is therefore expected to render even when Clerk runtime credentials are not present.

AUTHENTICATED LEARNER GATEWAY:
- Route: /learn
- Purpose: the actual course workspace and learner-state surface.
- /learn calls Clerk auth().
- Missing authentication redirects to /sign-in.
- Authenticated completion history is loaded from PostgreSQL using the authenticated Clerk user ID.
- The existing interactive App component remains the learner workspace.

AUTHENTICATION MEANING:
Authentication answers: "Which signed-in account is this learner?"
It does not mean that the whole public website must be hidden.
Authorization/data ownership then uses that authenticated identity to decide whether the learner can access /learn and which completion history belongs to that account.

CLERK BOUNDARY:
- Root layout no longer wraps the entire public application in ClerkProvider.
- /learn has its own ClerkProvider layout.
- sign-in and sign-up pages each provide their own ClerkProvider.
- src/proxy.ts only routes Clerk middleware through authenticated application surfaces and the explicit auth paths; the public marketing route is outside that request matcher.

ROUTE OWNERSHIP:
- / = public programme website.
- /learn = authenticated learning gateway.
- /sign-in and /sign-up = authentication entry points.
- /animations and /animations/[animationId] = public reusable animation previews; they are not a learner-progress or curriculum state owner.

UX INTENT:
The public site should feel like a normal professional course platform landing page. The learner gateway should feel like the focused working environment, similar to the distinction between a course platform's public catalogue/marketing layer and its signed-in classroom.

TESTING:
- app/tests/integration/public-learning-boundary.integration.test.mjs defines the public/authenticated route boundary.
- scripts/check-learner-progress-contract.mjs now enforces that boundary.
- TDD sequence: the boundary test was introduced before the implementation and initially failed against the old root-authenticated architecture; implementation then moved the authenticated workspace to /learn.

IMPORTANT:
Do not reintroduce root-level authentication solely to protect learner progress. Progress is protected by the /learn server boundary and, independently, every progress Server Action re-derives the Clerk user ID on the server.
============================================================
END PUBLIC PROGRAMME SITE + AUTHENTICATED LEARNER GATEWAY
============================================================


============================================================
36. FIRST-PARTY AUTHENTICATION — 2026-09-25
============================================================

The previous Clerk authentication architecture is replaced on this branch by application-owned authentication.

Identity authority:
- The application itself owns learner accounts.
- PostgreSQL stores `auth_users`.
- PostgreSQL stores `auth_sessions`.
- There is no Clerk, Auth0, Firebase Auth, OAuth identity provider, or other external authentication service.

Account model:
- self-registration with email + password;
- self sign-in with email + password;
- normalized lowercase email is the unique account identifier;
- password minimum length is 12 characters;
- password hashes use Node.js scrypt with a random per-password salt;
- plaintext passwords are never persisted;
- malformed password hashes fail closed;
- login returns one generic invalid-credentials message.

Session model:
- the server generates a 32-byte random opaque session token;
- only SHA-256(token) is stored in PostgreSQL;
- the browser receives the raw token only as the `httpOnly` `devops_session` cookie;
- cookie uses SameSite=Lax, Secure in production, Path=/, and a 30-day maximum age;
- PostgreSQL session rows have an explicit expiration timestamp;
- logout deletes the current session row and clears the cookie.

Learner gateway:
- `/` = public programme website;
- `/sign-up` = first-party account registration;
- `/sign-in` = first-party account sign-in;
- `/learn` = authenticated learner gateway;
- `/learn` re-derives the current user from the server-side session and never trusts a browser user ID;
- progress writes use the same first-party user ID through a Next.js Server Action;
- the client receives only the learner email for account display, not the internal user ID.

Request boundary:
- `src/proxy.ts` protects `/learn(.*)` when there is no session cookie;
- the `/learn` server page performs the authoritative database-backed session validation;
- progress Server Actions independently re-check the current session;
- a forged or stale cookie therefore cannot directly become a trusted learner identity.

Database migration:
- `app/drizzle/migrations/0001_self_hosted_auth.sql` creates the account/session tables and indexes;
- `app/drizzle/migrations/0001_self_hosted_auth.sql` remains the canonical schema migration;
- `app/src/lib/server/auth.ts` also performs an idempotent runtime schema bootstrap before account/session operations, so authentication does not depend on Vercel exposing database credentials during the build phase;
- `scripts/run-production-migrations.mjs` is retained as a separate migration utility, not a build-time requirement;
- the running application still requires `DATABASE_URL` for persistent accounts, sessions, and learner progress.

No external-email capability:
- email verification is not implemented;
- password-reset email is not implemented;
- these are intentionally excluded because the requested authentication system has no external email service.

TDD:
- `app/tests/unit/auth-security.test.mjs` covers password hashing, unique salts, malformed hashes, and verification;
- `app/tests/integration/auth-actions.integration.test.mjs` covers registration, login, generic credential errors, and logout redirect;
- `app/tests/integration/auth-boundary.integration.test.mjs` rejects Clerk and verifies the first-party session boundary;
- `app/tests/integration/public-learning-boundary.integration.test.mjs` protects the public site / learner gateway separation;
- `app/tests/integration/progress-action.test.mjs` verifies progress ownership comes from the first-party authenticated user.

Current verified branch gate before merge:
- 48 test files;
- 329 tests;
- first-party auth contract passes;
- self-hosted password security tests pass;
- progress identity tests pass.

IMPORTANT:
Do not reintroduce Clerk or another external identity provider. The requested authentication architecture is intentionally first-party and database-backed.
============================================================
END FIRST-PARTY AUTHENTICATION
============================================================

============================================================
2026-09-25 CONTENT QUALITY OVERRIDE — SCRIPT + ILLUSTRATION FIRST
============================================================

The next product-quality boundary is instructional content, not additional marketing polish and not a larger animation catalogue.

The primary teaching asset is now treated as one authored unit:

spoken script -> visual explanation -> learner prediction -> observed mechanism -> controlled failure -> diagnosis -> recovery -> proof

The target quality bar is:
- natural spoken English at roughly B1–B2 general English around exact DevOps terms
- technical claims no stronger than the evidence supports
- real system mechanisms instead of decorative diagrams
- visual state changes that correspond to the narrated mechanism
- explicit prediction, operation, failure, diagnosis and recovery moments
- deliberate misconception handling
- hands-on evidence that proves the mechanism rather than only proving that a command returned successfully.

Current exemplar slice:
- lesson: B1.4 — Why Containers Exist
- script: podcasts/beginner/B1.4.txt
- visual model: app/src/data/lessonIllustration.ts
- renderer: app/src/components/LessonIllustration.tsx
- lesson feed integration: app/src/components/LessonContentFeed.tsx
- content contract: app/src/data/lessonContent.ts
- spoken classifier: app/src/data/podcastsRaw.ts

B1.4 now teaches a concrete model:
Image -> Container -> Process
with Shared host kernel underneath, then two boundary concepts (persistent data and published ports), followed by a real diagnostic sequence for a running-but-unreachable service:
1. process listening
2. container port
3. host port
4. network path.

This is intentionally a gold-standard exemplar, not yet a claim that all 53 lessons meet this level. Future lessons should be upgraded against this standard in batches, with tests and documentation updated in the same slice.

A real defect was found and fixed in spoken-turn classification: a generic word match on "prediction" could pause the co-teacher during an explanatory sentence. The classifier now requires an actual prediction prompt pattern and has a regression test.

Current TDD status:
- PR #33: merged
- merge commit: `d3c49338180d948d0d5f7284713a91ead65267b1`
- final pre-merge programme gate: run 36102416096 PASS on the corrected content-quality head.
- the earlier red run 36102249143 caught a fixture mismatch; that regression was corrected and then covered by additional fail-closed tests.
- branch preview deployments before the final green revision also included a Vercel build-rate-limit signal. That infrastructure condition must not be confused with application test failure.
- production deployment for the merged commit is still pending verification; the last verified production deployment is PR #32 commit `ab3a9400929be685f4c366068e1b4e576e9d5f41`.

Do not scale the animation catalogue before the script+illustration quality gate is stable. Reusable animations remain capabilities; curriculum remains the instructional authority.
============================================================
END CONTENT QUALITY OVERRIDE
============================================================
