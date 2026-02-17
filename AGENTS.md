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
4. Follow Git branching strategy from `docs/runbooks/git-branching-model.md`.
5. Use `pnpm` only. Do not use `npm` or `yarn`.
6. Run and report:
   - `pnpm lint`
   - `pnpm test`
   - `pnpm build`
7. Require `Closes #<issue_number>` in PR body.
8. Keep PR scope aligned to issue acceptance criteria.

## Source of Truth
- Workflow rules: `docs/runbooks/github-project-workflow.md`
- Git strategy: `docs/runbooks/git-branching-model.md`
- Operating model: `docs/ai/agent-operating-model.md`
- Angular + AI playbook: `docs/ai/angular-ai-professional-playbook.md`
- AI self-review gate: `docs/ai/checklists/ai-self-review-gate.md`
- Backlog conventions: `docs/runbooks/github-project-workflow.md`
- Local operation: `docs/runbooks/local-dev.md`
- MCP setup: `docs/runbooks/angular-mcp-setup.md`
- Web E2E (Playwright): `docs/runbooks/playwright-web-e2e.md`

## Workflow Playbooks
- New feature: `docs/ai/workflows/new-feature.md`
- PR review: `docs/ai/workflows/review-pr.md`
- Deploy: `docs/ai/workflows/deploy.md`

## Prompt Templates
- Feature specification: `docs/ai/prompts/feature-spec-prompt.md`
- Code audit: `docs/ai/prompts/audit-prompt.md`
- Refactor: `docs/ai/prompts/refactor-prompt.md`
- Frontend feature (signals): `docs/ai/prompts/frontend-feature-signals-prompt.md`
- Frontend refactor (signals): `docs/ai/prompts/frontend-refactor-signals-prompt.md`
- Frontend audit (signals): `docs/ai/prompts/frontend-audit-signals-prompt.md`

## Role Activation
Activate one primary role per task and keep it explicit:
- `agent:pm`
- `agent:backend`
- `agent:frontend`
- `agent:qa`
- `agent:release`

If multiple roles are needed, split work into separate issues and sequence them.
