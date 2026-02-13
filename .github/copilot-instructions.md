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
- Start with a PM parent issue (`agent:pm`) that defines ordered child issues and ownership.
- Non-PM issues must include:
  - `Parent PM: #<issue_number>`
  - `Execution Order: <positive_integer>`
  - `Depends on: #<issue_number>, ...` or `none`
- Require linked issue with exactly one `agent:*` label.
- Keep `1 issue = 1 branch = 1 PR`.
- Include `Closes #<issue_number>` in PR body.
- Complete `AI Self-Review Gate` in PR body using `docs/ai/checklists/ai-self-review-gate.md`.
- If PR changes `apps/web`, mark `Angular way`.
- If PR changes `apps/api`, mark `NestJS way`.
- Validate and report:
  - `pnpm lint`
  - `pnpm test`
  - `pnpm build`

## Orchestration sequence
1. PM plans and sequences.
2. Assigned agent executes only when dependencies are closed.
3. QA/review validates before merge.

## References
- Consult relevant docs/runbooks, MCP, and skills for the active role.

## Source of truth
- `AGENTS.md`
- `docs/ai/angular-ai-professional-playbook.md`
- `docs/runbooks/angular-frontend-architecture.md`
- `docs/runbooks/angular-mcp-setup.md`
