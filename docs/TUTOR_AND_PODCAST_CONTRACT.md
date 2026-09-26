# Tutor + Podcast + Mastery Contract

Status: Implemented as an authenticated tutor POC with deterministic authority boundaries.

## Product model

The learning system now has two conversational teaching layers:

1. Podcast / recovery podcast — authored teaching paths with multiple explanation representations.
2. Live tutor — an LLM-backed senior-engineer conversation attached to the learner's lesson and project.

They are complementary.

The podcast is the predictable teaching path. After a failure, recovery content can switch representation instead of replaying the original explanation.

The tutor is the interactive path. It can explain, ask focused questions, investigate failures, review evidence, challenge designs and run oral-style technical interviews.

## Authority boundary

The tutor is never the assessment authority.

The deterministic programme engine remains responsible for:
- completion;
- machine verification;
- mastery/retry unlock;
- assignment validity;
- evidence acceptance;
- learner progress.

The tutor receives context and produces guidance. Its server response is forcibly normalized to:

- authoritativeDecision = not-authoritative
- canUnlockRetry = false
- canCertify = false

Even if an upstream model attempts to return certification or unlock fields, the response contract discards those claims.

## Conversation context

The tutor is bound to the authenticated first-party account and the canonical lesson/project identity.

The server supplies:
- canonical lesson metadata;
- canonical project objective, phases, failure scenarios, evidence requirements and review gates;
- server-known learner completion history;
- server-known mastery attempts for the lesson;
- the learner's bounded evidence text;
- the current mastery failure summary when remediation is active;
- a bounded machine-verification summary without automatically exposing raw terminal output;
- the previous tutor conversation for the current server-owned session.

The browser may retain the session identifier in sessionStorage for continuity, but server ownership is authoritative.

A tutor session cannot be reused for another learner, lesson or project.

## Tutor modes

- teaching
- failure-investigation
- assignment-coach
- incident-review
- design-defense
- oral-assessment

The UI maps the current lesson mode to a useful default, but the learner can switch modes during a conversation.

## LLM provider boundary

The first implementation uses Vercel AI Gateway's OpenAI-compatible Responses endpoint from the server.

AI_GATEWAY_API_KEY is server-only.

Default model routing is:
- routine teaching / assignment coaching -> GPT-5.6 Luna;
- failure investigation / incident review -> GPT-5.6 Terra;
- design defense / oral assessment -> GPT-5.6 Sol.

TUTOR_MODEL can override routing for controlled experiments.

No provider API key is exposed to browser JavaScript.

## Safety and red-team rules

The tutor must:
- never invent command execution;
- never invent logs, metrics, topology or test results;
- distinguish learner-reported evidence from deterministic verification;
- ask for evidence when a conclusion is not justified;
- avoid asking for credentials or secrets;
- keep English simple while preserving technical accuracy;
- avoid becoming a shortcut around the curriculum.

Adversarial tests cover:
- unauthenticated access;
- missing provider configuration;
- session ownership;
- model attempts to certify;
- model attempts to unlock retry;
- oversized learner evidence.

## Current limitation

This slice is the text-conversation foundation. It does not yet stream tokens, use live voice, or invoke runtime tools from the tutor.

The next evolution should expose narrowly scoped read-only programme tools such as:
- get current project phase;
- get authoritative evidence status;
- get machine-verification result;
- get rubric;
- get allowed operations.

A later voice layer can attach the same tutor contract to a realtime audio interaction. It must reuse the same authority boundary rather than creating a second assessment path.

## Read-only tutor tools

The tutor now has a bounded function-tool layer. Published tools are read-only:

- get_hands_on_contract
- get_project_phase
- get_runtime_contract
- get_authoritative_progress

Every tool is checked against the authenticated tutor context. A tool cannot read another lesson or project.

Runtime access is descriptive only. A runtime tool can expose the published allowlisted operation contract and verification scope, but it cannot execute a command.

There is intentionally no:
- execute_shell
- deploy
- mutate_project
- complete_assignment
- unlock_retry
- certify_mastery

The Responses API tool loop is capped at a small number of server-side rounds and the final result still passes through the non-authoritative tutor response contract.

## Persistence migration

Tutor storage uses a dedicated 0003_tutor.sql migration.

The authentication migration 0001_self_hosted_auth.sql remains historical and is not modified after deployment.

The server-side ensureTutorSchema() remains an idempotent runtime safety net, but it is not the canonical migration path.
