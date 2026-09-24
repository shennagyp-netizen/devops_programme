# Test Architecture

## Purpose

The programme uses invariant-based unit and integration testing instead of relying on sequential manual debugging.

## Unit coverage

The application tests:
- hands-on task resolution and evidence validation
- machine-verification envelope validation
- evidence-ledger idempotency and verification metadata
- diagnostic definition shape and adaptive thresholds
- assessment blueprint invariants
- podcast audio-manifest fail-closed behavior

## Integration coverage

The integration suite verifies:
- all three courses and 21 sections
- 53 lesson mappings
- 9 project definitions and course alignment
- 21 prerequisite diagnostics
- 63 assessment blueprints
- 21 pilot banks and 840 globally unique pilot items
- 15% / 35% / 35% / 15% difficulty distribution
- hands-on evidence contracts
- Windows platform coverage
- 53 spoken lesson sources and spoken cues
- runtime task catalog consistency
- local runtime-runner dry-run behavior
- every repository contract validator as a real process

## Build policy

The build runs unit and integration tests before TypeScript compilation and Vite production build.

A failure in an invariant test blocks the build.

The tests do not claim successful execution of real learner environments. Machine execution remains separated behind the runtime runner protocol.
