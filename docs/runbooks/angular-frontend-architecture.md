# Angular Frontend Architecture (Feature-First)

## Objective
Define a maintainable structure for `apps/web` using clear boundaries per layer and per feature.

## App Structure

```text
apps/web/src/app
  app.config.ts
  app.routes.ts
  core/
    config/
    guards/
    http/
  shared/
  features/
    auth/
      domain/
      data-access/
      state/
      ui/
    products/
      domain/
      data-access/
      state/
      ui/
```

## Layer Responsibilities

- `domain/`: Types and models for the feature.
- `data-access/`: HTTP/API integration and adapters.
- `state/`: Feature state definitions and state containers/stores.
- `ui/`: Pages and presentational components.

## Dependency Rules

- `ui -> state -> data-access -> core`
- `domain` is dependency-safe and contains no UI or transport side effects.
- `core` includes cross-cutting concerns only (routing guards, interceptors, app config tokens).
- `shared` contains reusable artifacts without feature business logic.

## Current Routing Layout

- `login`: `features/auth/ui/pages/login.page`
- `register`: `features/auth/ui/pages/register.page`
- `products`: `features/products/ui/pages/products.page`

## Migration Notes

- FE-05 focuses on structural refactor without behavior changes.
- FE-06 standardizes stores with `@ngrx/signals` on top of this structure.

## Store Standard

- One store per feature in `features/<feature>/state`.
- Use `signalStore` with `withState`, `withComputed`, `withMethods`.
- Use `rxMethod` for side effects and API calls.
- Keep error/loading/data state explicit inside store state.

## UI Composition Standard

- Pages act as containers and orchestrate navigation + store interactions.
- Presentational components receive data via inputs and communicate via outputs.
- Presentational components do not inject API services or feature stores.
- Critical feedback states must be explicit and accessible:
  - loading
  - error (`role="alert"` for blocking errors)
  - empty
  - success/status (`aria-live="polite"` where appropriate)

## AI Alignment

- Primary AI architecture guide: `docs/ai/angular-ai-professional-playbook.md`.
- MCP setup and safety defaults: `docs/runbooks/angular-mcp-setup.md`.
- Prompt templates for frontend work:
  - `docs/ai/prompts/frontend-feature-signals-prompt.md`
  - `docs/ai/prompts/frontend-refactor-signals-prompt.md`
  - `docs/ai/prompts/frontend-audit-signals-prompt.md`
