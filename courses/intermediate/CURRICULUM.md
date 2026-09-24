# Intermediate Curriculum — DevOps Engineering

## Course role

This is the initial home of the existing five-day operational core, expanded into a production engineering curriculum.

## Foundations

### F1 Linux and operating systems
- processes
- memory
- filesystems
- file descriptors
- services
- permissions
- logs
- process lifecycle

### F2 Networking
- Ethernet and ARP
- IP/CIDR
- routing
- NAT
- TCP/UDP
- DNS

### F3 Application protocols
- HTTP
- TLS
- authentication boundaries
- timeout/refusal/reset semantics

### F4 Distributed systems and databases
- replication
- consistency
- partial failure
- partitioning
- recovery

### F5 Reliability
- observability
- SLI/SLO
- retries
- backoff
- idempotency
- backpressure
- disaster recovery

## Project I1 — Production Kubernetes Platform

1. Linux/process model
2. container model
3. Docker networking/storage
4. Kubernetes reconciliation
5. Kubernetes networking
6. configuration and secrets
7. storage
8. health probes
9. scaling
10. failure labs

Human examples:
- hotel room inventory for reconciliation
- hospital department routing for service discovery
- checkout lanes for scaling
- warehouse inventory for persistent state

## Project I2 — Infrastructure + Observability

1. Git production workflow
2. CI/CD
3. GitHub Actions
4. Infrastructure as Code
5. Terraform lifecycle/state
6. cloud primitives
7. logs/metrics/traces
8. SLO/error budgets
9. controlled deployment
10. rollback

Human examples:
- approved contract versions
- airport gates
- factory workstations
- maintenance records

## Project I3 — Integrated Production Platform

1. scaling
2. database scaling
3. distributed-system failure
4. reliability patterns
5. incident response
6. disaster recovery
7. global architecture

The learner operates the whole system rather than treating each tool as an isolated topic.

## Assessment

Every section has conceptual, diagnostic and hands-on forms.

Difficult questions should introduce ambiguity, interacting failures or incomplete evidence rather than simply using longer wording.

Challenge questions should require transfer to a system not identical to the taught example.
