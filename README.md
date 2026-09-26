# DevOps Programme V3 MVP

A multi-course, multi-modal DevOps learning application built with React and Next.js.

## MVP boundary

V3 is intentionally simple: one app, one small first-party auth layer, and no external identity platform.

- email/password account;
- scrypt password hashing;
- HTTP-only session cookie;
- PostgreSQL-backed saved progress;
- no Clerk, OAuth, JWT or learner API-token system;
- no terminal pairing tokens.

The learner gateway requires the simple account session. The public programme website remains public.

The learning app also supports the existing local terminal bridge. Run `npm run terminal-agent`, paste the printed pairing token into the lesson, and execute published runtime tasks directly on the learner's laptop. The terminal pairing token is separate from the account session.

The authoritative security/product boundary is docs/MVP_ARCHITECTURE_V3.md.

## Learning experience

The application provides:

- Beginner, Intermediate and Advanced DevOps paths;
- projects and hands-on exercises;
- Learn / Do / Recall / Design / Assessment modes;
- continuous podcast/co-teacher presentation;
- reusable SVG/React illustrations;
- structured learner evidence;
- adaptive mastery remediation;
- optional AI tutor assistance.

## Verification boundary

For MVP hands-on work:

1. the app shows the exact platform command;
2. the learner runs it manually;
3. the learner records observation, change, failure and recovery evidence;
4. the browser validates evidence structure.

The app does not claim that browser-entered evidence proves actual machine execution.

Future runtime contracts remain in app/src/data/runtimeTasks.json and app/src/data/runtimeVerification.ts, but they are not a learner authorization mechanism in V3.

## AI tutor

The tutor is a same-application route backed by the configured AI Gateway.

It:

- reconstructs lesson context from authored curriculum;
- accepts only user-role conversation turns;
- limits request size;
- applies best-effort anonymous throttling;
- keeps provider credentials server-side.

Deployment should also enforce provider/API spending limits.

## Development

```bash
cd app
npm install
npm run dev
```

Run the complete test suite:

```bash
npm test
```

Run the programme contracts:

```bash
npm run check:content
npm run check:assessment
npm run check:diagnostics
npm run check:projects
npm run check:platforms
npm run check:hands-on
npm run check:programme
npm run check:mvp
```

## Documentation

Key architecture/security documents:

- docs/MVP_ARCHITECTURE_V3.md
- docs/architecture/LEARNER_PROGRESS_STORAGE.md
- docs/curriculum/HANDS_ON_RUNTIME_VERIFICATION.md
- docs/MASTERY_AND_REMEDIATION_CONTRACT.md
- docs/INTEGRITY_AUDIT.md
- docs/CONTINUATION_HANDOFF_CURRENT.md

Historical Kiro specifications remain in .kiro/ for implementation history; they are not the current V3 security authority.