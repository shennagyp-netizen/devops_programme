# Project Integrity Audit

**Audit date:** 2026-09-26
**Scope:** repository documents, curriculum data, application contracts, delivery
configuration and executable validation.

## System understood

This repository is a three-course DevOps learning programme. The authored graph
contains 53 lessons in 21 competency sections, connected to nine continuous
projects, prerequisite diagnostics, 21 assessment banks and spoken lesson
assets. The Next.js application is the learner delivery surface. It uses
first-party sessions, PostgreSQL/Drizzle persistence and Server Actions; the
browser is not trusted to choose a learner identity.

Programme integrity is primarily protected by source-level contracts. The
validators check curriculum identity and coverage, assessment-bank structure,
diagnostics, project links, Windows command adapters, hands-on evidence and the
runtime-verification envelope. Unit and integration tests then exercise those
contracts and the authentication/progress boundary.

## Findings resolved by this audit

1. **The dependency graph was not reproducible.** `app/package.json` had no
   committed lockfile and CI used `npm install`, allowing its graph to drift.
   The application now has `app/package-lock.json`; CI uses `npm ci` against
   that lockfile.
2. **The test runner dependency was incomplete.** Vitest declares Vite as a
   peer dependency, but Vite was not declared by this application. A clean
   install could therefore fail before tests ran. Vite is now an explicit
   development dependency.
3. **The advertised Node support did not match the installed test runner.**
   Vitest 5 requires Node 22.12 or later, whereas the project advertised Node
   20.9. CI now installs Node 22.12 and the package engine expresses that
   actual minimum.
4. **Published podcast assets were incomplete and stale.** The app public
   directory held only the legacy five-day subset although the source library
   contains 27 files. The complete synchronization output, including the
   hash/audio manifests, is now committed.
5. **Repository hygiene and documentation had regressions.** The local-env
   ignore pattern was literal text rather than a pattern, and the testing guide
   still named the retired Vite production build. Both are corrected.

## Validation evidence

All programme contract commands passed during this audit. The complete test
suite passed: 52 test files and 438 tests. TypeScript compilation passed. The
audit environment runs Node 20.20.2, below the corrected Node engine, so the
Node 22 production-build gate must be confirmed by CI or a Node 22 runtime.

## Open delivery gaps (not hidden by the green contracts)

The current documents accurately identify these product boundaries:

- Only one hands-on task has machine-verification runtime coverage; the other
  lessons use structured learner evidence and manual execution.
- Production audio timing manifests and published recordings are incomplete;
  the spoken scripts remain available as the fallback.
- Assessment banks are pilot pools, not empirically calibrated operational
  pools, and fully automatic remediation routing remains future work.
- Windows has authored command coverage and a manual path, but remote runtime
  execution is presently Linux/macOS only.
- Browser visual validation and externally observable hosted-CI success remain
  separate evidence needs; contract tests alone do not prove either.

These are deliberate, documented capability limits rather than structural
catalogue omissions. They should be prioritized as release-readiness work,
with machine-verification breadth and production audio first because they are
the largest remaining gaps between authored curriculum and demonstrated learner
outcomes.
