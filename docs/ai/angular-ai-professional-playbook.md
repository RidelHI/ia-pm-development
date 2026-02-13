# Angular 21 + AI Professional Playbook

## Objective
Define a single source of truth for Angular architecture, AI-assisted development, and `@ngrx/signals` conventions in this repository.

## Scope
- Applies to `apps/web` and all future frontend features.
- Covers feature-first structure, state standards, AI context files, and delivery quality gates.

## Architectural baseline

### App layout
```text
apps/web/src/app
  app.config.ts
  app.routes.ts
  core/
  shared/
  features/
    <feature>/
      domain/
      data-access/
      state/
      ui/
```

### Layer responsibilities
- `domain/`: DTOs, domain models, mappers, and pure business types.
- `data-access/`: API clients and adapters only.
- `state/`: signal stores and state transition logic.
- `ui/`: containers, pages, and presentational components.

### Dependency direction
- `ui -> state -> data-access -> core`
- `domain` is side-effect free and can be used by all feature layers.
- Presentational components must not inject stores or API services.

## `@ngrx/signals` standard

### Store shape
- One store per feature.
- Explicit state fields: `data`, `loading`, `error`, plus feature fields (filters, pagination, ids).
- Derived state with `withComputed`.
- Side effects with `rxMethod` and explicit error mapping.

### Store composition
- Use `signalStore` with:
  - `withState`
  - `withComputed`
  - `withMethods`
  - `withHooks` when lifecycle wiring is required
- Use pure updates through `patchState` and immutable payloads.
- Do not use global mutable singleton state outside stores.

### API boundary rule
- API DTOs stay in `domain/dto` (or equivalent domain files).
- Map DTOs to internal models before state update.
- UI must consume internal models, not transport DTOs.

## Angular implementation rules

### Components
- Keep components small and single-purpose.
- Default to `ChangeDetectionStrategy.OnPush`.
- Use `input()` / `output()` and signals for local state.
- Prefer inline templates only for very small components.

### Templates
- Use native control flow (`@if`, `@for`, `@switch`).
- Keep template logic simple; move branching to computed state when needed.
- Do not add arrow functions or ad-hoc transformations in templates.

### Services
- Single responsibility per service.
- `providedIn: 'root'` for singleton cross-feature services.
- Use `inject()` over constructor injection where practical.

### Accessibility baseline
- Support clear focus order and visible focus state.
- Use semantic roles and ARIA only when needed.
- Expose loading/status updates with `aria-live` in critical flows.
- Keep color contrast and form error feedback at WCAG AA level.

## AI context stack (repo-level)

### Instruction files
- `AGENTS.md`: global non-negotiable workflow and role rules.
- `.github/copilot-instructions.md`: GitHub Copilot repository behavior.
- `.instructions.md`: VS Code Chat/Copilot project instructions.
- `.cursor/rules/angular-web.mdc`: Cursor rule for Angular delivery.
- `llms.txt`: compact index of architecture and workflow context.

### Prompt templates
- `docs/ai/prompts/frontend-feature-signals-prompt.md`
- `docs/ai/prompts/frontend-refactor-signals-prompt.md`
- `docs/ai/prompts/frontend-audit-signals-prompt.md`

### Workflow references
- `docs/ai/workflows/new-feature.md`
- `docs/ai/workflows/review-pr.md`
- `docs/ai/workflows/deploy.md`

## Skills and role mapping
- `agent:frontend`: `frontend-angular-delivery`
- `agent:qa`: `qa-quality-gate`
- `agent:release`: `release-cicd-operator`
- `agent:pm`: `pm-github-orchestrator`
- Backend support and patterns: `backend-nestjs-delivery`, `nestjs-best-practices`

## Delivery contract per issue
1. Issue has exactly one `agent:*` label.
2. Branch is scoped to one issue.
3. PR includes `Closes #<issue_number>`.
4. Evidence includes:
   - `pnpm lint`
   - `pnpm test`
   - `pnpm build`

## Testing baseline
- Unit/component: Angular unit tests and store tests in feature scope.
- API contract: backend unit/e2e tests (NestJS).
- Browser E2E: Playwright for critical user journeys in real browser runtime.
- Minimum E2E for auth/products:
  - login and protected-route access
  - search behavior and empty-state feedback

## References
- Angular AI docs: https://angular.dev/ai
- Develop with AI: https://angular.dev/ai/develop-with-ai
- Angular AI design patterns: https://angular.dev/ai/design-patterns
- Angular CLI MCP server: https://angular.dev/ai/mcp
- Angular style guide: https://angular.dev/style-guide
- Angular signals guide: https://angular.dev/guide/signals
- Angular control flow guide: https://angular.dev/guide/templates/control-flow
- Angular llms context: https://angular.dev/llms.txt
- MCP security best practices: https://modelcontextprotocol.io/specification/2025-06-18/basic/security_best_practices
- Web codegen scorer (Angular): https://github.com/angular/web-codegen-scorer
