# Learning Framework MVP Boundary

The framework is now a standalone product boundary inside the repository.

## Dependency direction

```
Learning Framework React App
        |
Learning Experience Runtime
        |
Framework Core Authority
        |
Generic Provider Interfaces
```

A programme is an input to the framework. The framework does not import a programme.

For the MVP, the framework contains only a neutral demonstration programme. DevOps remains outside this boundary.

## What belongs in the framework

Contracts, progression, learner-state semantics, evidence semantics, assessment semantics, mastery/completion policy, experience intents, control policy, provider interfaces, and reusable React presentation.

## What stays outside

Authentication, database implementation, Vercel/Next.js request handling, domain curriculum, domain assessment banks, terminal/SSH implementations, AI vendor integrations, and domain-specific content.

## Integration strategy

Do not migrate the existing DevOps application now.

The next step is to make the DevOps application consume the framework package through explicit programme/provider adapters. That can happen incrementally without contaminating the framework MVP.
