# System Architecture Overview

## Objective
Describe the MVP architecture and core boundaries for web, API, data, and delivery pipeline.

## Context diagram
```mermaid
flowchart LR
  U[User] --> W[Angular Web App]
  W --> A[NestJS API]
  A --> D[(Supabase Postgres)]
  A --> J[JWT Auth]
  P[GitHub Project + Issues] --> R[PR + CI]
  R --> W
  R --> A
```

## Component diagram
```mermaid
flowchart TD
  subgraph Web[apps/web]
    UI[Feature UI]
    ST[Signal Stores]
    DA[Data Access Services]
    UI --> ST --> DA
  end

  subgraph Api[apps/api]
    CT[Controllers]
    SV[Services]
    RE[Repositories]
    CT --> SV --> RE
  end

  subgraph Data[Supabase]
    TB[(products/users tables)]
  end

  DA --> CT
  RE --> TB
```

## Architectural rules
- Web follows feature-first structure: `domain`, `data-access`, `state`, `ui`.
- Web dependency direction: `ui -> state -> data-access -> core`.
- API follows NestJS module/controller/service boundaries.
- All delivery work is issue-first and PR-based with CI quality gates.

## Related docs
- `docs/adr/0001-architecture.md`
- `docs/ai/angular-ai-professional-playbook.md`
- `docs/runbooks/github-project-workflow.md`
- `docs/runbooks/local-dev.md`
