# Copilot Instructions - ia-pm-development

## Stack and architecture
- Frontend: Angular 21 (`apps/web`), standalone components, signals-first.
- Backend: NestJS 11 (`apps/api`).
- Package manager: `pnpm` only.
- Frontend architecture: feature-first, layered by `domain`, `data-access`, `state`, `ui`.

## Frontend coding rules
- Use strict TypeScript and avoid `any`.
- Keep DTOs separate from domain models.
- Keep API calls in `data-access` only.
- Use `@ngrx/signals` stores in `features/*/state`.
- Keep pages as containers; components as presentational units.
- Cover loading, empty, error, and success states.
- Prefer native control flow (`@if`, `@for`, `@switch`).

## Agent-first delivery rules
- Require linked Linear issue with exactly one `agent:*` label.
- Keep `1 issue = 1 branch = 1 PR`.
- Include `Linear: <TEAM-ISSUE>` in PR body (example: `Linear: IA-17`).
- Include `Agent Owner: agent:<role>` in PR body.
- Complete `AI Self-Review Gate` in PR body using `docs/ai/checklists/ai-self-review-gate.md`.
- Validate and report:
  - `pnpm lint`
  - `pnpm test`
  - `pnpm build`

## Source of truth
- `AGENTS.md`
- `docs/ai/angular-ai-professional-playbook.md`
- `docs/runbooks/angular-frontend-architecture.md` (operational summary)
- `docs/runbooks/angular-mcp-setup.md`
