# Hands-on Runtime Verification

## Boundary

The browser application never executes arbitrary learner shell commands.

Every hands-on lesson has a manual execution path. The learner can open their own terminal, run the platform-specific command shown by the lesson, observe the result, and submit structured evidence.

An optional verified execution path can execute an allowlisted runtime task on a real remote machine. The remote target may be a virtual machine or a physical machine. The current verified transport is SSH.

The two paths are independent:

- **Manual execution** is always available and is the fallback when no verified machine is available.
- **Verified execution** is optional and produces machine-backed evidence when the learner has an SSH-accessible target.

The course must never become blocked because the verified execution service or machine is unavailable.

## Manual path

The lesson resolves a platform command from the authoritative course data.

The browser displays the command but does not execute it.

The learner:

1. opens their own terminal
2. runs the command
3. performs the exercise
4. records observation, controlled change, failure and recovery evidence
5. submits the evidence through the lesson UI.

The current application validates evidence structure and stores it in the local evidence ledger. Structured evidence is not presented as machine verification.

## Verified SSH path

The repository provides an optional SSH runner:

```bash
cd app
npm install
npm run hands-on:remote -- --execute --lesson B1.2 --platform linux --host <host> --user <user>
```

A dry-run is available before connection:

```bash
npm run hands-on:remote -- --lesson B1.2 --platform linux --dry-run
```

The runner:

1. loads the same `app/src/data/runtimeTasks.json` catalogue used by the TypeScript verifier
2. resolves the exact task and contract version
3. selects the target platform command
4. rejects destructive steps
5. requires explicit `--execute` before any connection
6. connects with SSH using `shell=false` in the local process
7. requires `StrictHostKeyChecking=yes`
8. optionally uses an explicit `known_hosts` file and SSH identity
9. executes only the task's allowlisted command
10. captures bounded stdout/stderr and hashes the captured output
11. returns exit state plus the captured command result
12. writes a machine-verification envelope.

The remote target is identified in the envelope as an SSH target with host, user, port and strict known-hosts policy.

The runner currently supports verified remote execution for Linux and macOS targets. Windows remains fully supported through the manual path until a safe Windows SSH command adapter is implemented.

## Evidence import

The browser cannot open SSH itself.

After the SSH runner completes, the learner imports the generated JSON evidence file in the lesson's **Optional Verified Execution** panel.

The runner returns the actual command output in the evidence envelope, bounded to 64 KiB per stdout/stderr stream.

The browser validates:

- task identity
- contract version
- lesson identity
- platform
- verification level
- verification source
- local vs remote execution mode
- SSH target identity
- strict host-key policy
- runner identity
- captured stdout/stderr presence and size
- timestamps
- required step coverage
- output hashes
- pass/fail state
- reset state.

Only a structurally valid machine envelope enters the evidence ledger.

A verified envelope from the SSH runner is recorded as:

```text
verificationSource = ssh-runner
executionMode      = remote-machine
target.kind        = ssh
hostKeyPolicy      = strict-known-hosts
```

## Trust boundary

SSH connectivity is not treated as proof by itself.

The runner must use strict host-key checking, and the target must already be trusted by the learner's SSH `known_hosts` configuration.

The browser validates the returned envelope against the exact task contract, but the current MVP does not provide cryptographic remote attestation or a managed central gateway.

Therefore:

- `ssh-runner` means the repository runner executed the allowlisted task through a verified SSH connection.
- `managed-runner` remains reserved for a future centrally controlled execution service.
- an imported JSON file is not independent cryptographic attestation.

## Fallback rule

The manual path is normative for course availability.

If:

- no remote machine is available
- SSH access fails
- the target is not trusted
- the SSH runner is not installed
- the target platform has no verified adapter
- the returned envelope fails validation

the learner can continue using the normal terminal instructions and structured evidence flow.

The application must never disable manual exercise completion merely because verified execution is unavailable.

## Safety boundary

The runtime catalogue is the single source of truth for executable task steps.

Do not accept arbitrary shell text from the browser and send it to a remote machine.

A future managed runner must preserve the same contract:

- resolve exact task identity
- select an allowlisted platform command
- enforce timeout and scope
- execute only the catalogued operation
- capture results
- authenticate the returned evidence
- perform and report required reset operations.

Future expansion should proceed from observation-only tasks to reversible changes, controlled failures, recovery and finally reset verification.
