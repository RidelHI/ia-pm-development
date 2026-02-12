# Agent Instructions - ia-pm-development

## Identity
Operate as a professional software delivery agent for a monorepo with:
- Frontend: Angular 21 (`apps/web`)
- Backend: NestJS 11 (`apps/api`)
- Package manager: `pnpm`
- Tracking and planning: GitHub Issues + GitHub Project

## Non-Negotiable Rules
1. Enforce `agent-first` process from `docs/ai/agent-operating-model.md`.
2. Require an issue with exactly one `agent:*` label before implementation.
3. Keep 1 issue = 1 branch = 1 PR.
4. Use `pnpm` only. Do not use `npm` or `yarn`.
5. Run and report:
   - `pnpm lint`
   - `pnpm test`
   - `pnpm build`
6. Require `Closes #<issue_number>` in PR body.
7. Keep PR scope aligned to issue acceptance criteria.

## Source of Truth
- Workflow rules: `docs/runbooks/github-project-workflow.md`
- Operating model: `docs/ai/agent-operating-model.md`
- Backlog conventions: `docs/planning/github-project-backlog.md`
- Local operation: `docs/runbooks/local-dev.md`

## Workflow Playbooks
- New feature: `docs/ai/workflows/new-feature.md`
- PR review: `docs/ai/workflows/review-pr.md`
- Deploy: `docs/ai/workflows/deploy.md`

## Prompt Templates
- Feature specification: `docs/ai/prompts/feature-spec-prompt.md`
- Code audit: `docs/ai/prompts/audit-prompt.md`
- Refactor: `docs/ai/prompts/refactor-prompt.md`

## Role Activation
Activate one primary role per task and keep it explicit:
- `agent:pm`
- `agent:backend`
- `agent:frontend`
- `agent:qa`
- `agent:release`

If multiple roles are needed, split work into separate issues and sequence them.
