# Beginner Curriculum — DevOps Through Problems

## Course idea

Start with a system that is useful to a user, then introduce operational concepts only when the system creates a reason to learn them.

Foundations are explicitly separated from application sections, but they are revisited inside the project.

## Project B1 — Containerized Application

Learner builds and operates a small frontend/API/database application.

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

## Project B2 — Productionized Service

### B2.1 Foundation: Git and reproducibility
Human example: identifying the exact approved contract revision.

### B2.2 Application: CI/CD
Human example: an airport security chain where each gate produces evidence before the next stage.

### B2.3 Application: Health and observability
- logs
- metrics
- health checks
- diagnosis

Human example: a clinic cannot diagnose "the system is slow" without knowing which service or step is slow.

### B2.4 Application: Backup and recovery
Human example: having a backup key is useful only if it actually opens a tested replacement lock.

## Project B3 — Distributed Service

### B3.1 Foundation: asynchronous systems
- queues
- consumers
- retries
- idempotency

Human example: restaurant orders waiting in a queue instead of every customer shouting at the kitchen.

### B3.2 Application: failure and recovery
- partial failure
- timeouts
- backoff
- dead letters

### B3.3 Application: production incident
Learner investigates evidence and restores service.

## Beginner assessment

Each section has:
- conceptual exam
- diagnostic exam
- hands-on exam

Each form contains varied difficulty from foundation to challenge.

## Human teaching rule

Beginner episodes must explain the *why* before naming a tool. Do not start with "Docker is..." or "Kubernetes is...". Start with a problem the tool solves.
