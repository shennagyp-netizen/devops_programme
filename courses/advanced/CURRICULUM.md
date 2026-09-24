# Advanced Curriculum — Large-Scale Distributed Systems

## Course role

The advanced course assumes that ordinary DevOps tooling is familiar. The teaching problem becomes scale, uncertainty and failure-domain reasoning.

## Foundations

### A-F1 Capacity
- concurrency
- throughput
- latency
- queueing
- saturation
- headroom

Human example: a supermarket that adds checkout lanes until the payment system becomes the real bottleneck.

### A-F2 Distributed state
- consistency
- replication
- partitioning
- data locality
- conflict handling

Human example: several warehouses maintaining copies of inventory while orders keep arriving.

### A-F3 Failure domains
- process
- host
- rack
- zone
- region
- provider
- network partition

Human example: a shop losing one room is different from losing the whole building.

## Project A1 — Global Distributed Platform

- global traffic management
- multi-region deployment
- caching
- regional failover
- data locality
- capacity planning

## Project A2 — Failure Engineering Platform

- fault injection
- dependency failure
- timeout cascades
- retry storms
- backpressure
- queue overload
- partial network failure
- recovery verification

Human examples should make cascading failure memorable before the technical simulation shows it.

## Project A3 — Massive-Scale Service

The learner designs for a very large user population with explicit trade-offs among:
- availability
- consistency
- latency
- cost
- operational complexity
- recovery time
- data loss tolerance

The course does not reproduce proprietary architecture from any company. "Amazon-level" describes the scale and depth of the engineering problem.

## Advanced assessment

Challenge-level items should involve:
- conflicting evidence
- multiple plausible failure causes
- interacting bottlenecks
- failure-domain changes
- explicit trade-offs

The hands-on exam must require evidence capture and recovery verification, not merely a working final state.
