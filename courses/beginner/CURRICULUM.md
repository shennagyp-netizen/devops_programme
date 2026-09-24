# Beginner Curriculum — DevOps Through Problems

## Course idea

Start with a system that is useful to a user, then introduce operational concepts only when the system creates a reason to learn them.

Foundations are explicitly separated from application sections, but they are revisited inside the project.

## Project B1 — Containerized Application

Learner builds and operates a small service and turns it into a repeatable containerized workload.

### B1.1 Foundation: Linux operating model
- processes
- filesystem
- permissions
- sockets
- logs

Human example: a small shop where one person suddenly becomes responsible for every job.

### B1.2 Foundation: Networking
- IP
- subnet
- routing
- gateway
- ports

Human example: a delivery needs both an address and a route to reach it.

### B1.3 Application: Service communication
- HTTP
- DNS
- TLS
- connection failures

Human example: calling a business can fail because the number is wrong, the line is unreachable, the call is rejected, or the person answers but cannot help.

### B1.4 Application: Containers
- images
- process isolation
- networks
- volumes

Human example: a restaurant kitchen with separate work areas and controlled access to shared storage.

### B1.5 Application: Repeatable operation
- startup
- configuration
- health checks
- persistent data
- controlled configuration failure

Human example: a restaurant works better when every shift follows the same setup instead of guessing how to start the kitchen.

## Project B2 — Productionized Service

### B2.1 Application: CI/CD and reproducible delivery
- commits
- checks
- artifacts
- controlled deployment
- rollback

Human example: an airport security chain where each gate produces evidence before the next stage.

### B2.2 Application: Observability and diagnosis
- logs
- metrics
- health checks
- evidence-driven diagnosis

Human example: a clinic cannot diagnose "everything is slow" without knowing which service or step is slow.

### B2.3 Application: Backup and recovery
- backup
- restore
- recovery verification
- RPO
- RTO

Human example: having a backup key is useful only if it actually opens a tested replacement lock.

## Project B3 — Distributed Service

### B3.1 Application: Queues, retries and idempotency
- producers
- consumers
- queue growth
- retries
- idempotency
- backpressure

Human example: restaurant orders waiting in a queue instead of every customer shouting at the kitchen.

### B3.2 Application: The first production incident
- partial failure
- timeouts
- recovery
- evidence
- post-incident improvement

Human example: when a shop cannot take orders, the first job is to keep customers moving while finding the broken step.

## Beginner assessment

Each section has:
- conceptual exam
- diagnostic exam
- hands-on exam

Each form contains varied difficulty from foundation to challenge.

## Human teaching rule

Beginner episodes must explain the *why* before naming a tool. Do not start with "Docker is..." or "Kubernetes is...". Start with a problem the tool solves.
