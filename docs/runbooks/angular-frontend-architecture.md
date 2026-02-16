# Angular Frontend Architecture (Operational Summary)

## Purpose
This runbook is a quick operational summary for day-to-day execution.
The canonical frontend architecture source is:
- `docs/ai/angular-ai-professional-playbook.md`

## Baseline structure
```text
apps/web/src/app
  core/
  shared/
  features/
    <feature>/
      domain/
      data-access/
      state/
      ui/
```

## Non-negotiable rules
- Keep feature-first boundaries by layer.
- Respect dependency direction: `ui -> state -> data-access -> core`.
- Keep `domain` side-effect free.
- Keep UI components decoupled from API services and stores.

## Store and UI expectations
- One `@ngrx/signals` store per feature.
- Explicit `loading`, `error`, `empty` and success/status states.
- Page components orchestrate state/navigation; presentational components render only.

## Delivery checklist
1. Implement only issue scope.
2. Validate with `pnpm lint`, `pnpm test`, `pnpm build`.
3. Complete `docs/ai/checklists/ai-self-review-gate.md` before opening PR.

## Related docs
- `docs/ai/angular-ai-professional-playbook.md` (canonical)
- `docs/runbooks/angular-mcp-setup.md`
- `docs/runbooks/playwright-web-e2e.md`
- `docs/ai/prompts/frontend-feature-signals-prompt.md`
