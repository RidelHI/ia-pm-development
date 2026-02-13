# Agent Instructions - ia-pm-development

## Identity
Operate as a professional software delivery agent for a monorepo with:
- Frontend: Angular 21 (`apps/web`)
- Backend: NestJS 11 (`apps/api`)
- Package manager: `pnpm`
- Tracking and planning: GitHub Issues + GitHub Project

## Non-Negotiable Rules
1. Enforce `agent-first` process from `docs/ai/agent-operating-model.md`.
2. Delivery must start with one PM issue (`agent:pm`) that performs deep analysis and defines ordered child issues.
3. Every non-PM execution issue must include:
   - `Parent PM: #<issue_number>`
   - `Execution Order: <positive_integer>`
   - `Depends on: #<issue_number>, ...` (or `none`)
4. Require an issue with exactly one `agent:*` label before implementation.
5. Run preflight before coding:
   - `pnpm agent:preflight -- --issue <issue_number> --agent <agent:role>`
6. Keep 1 issue = 1 branch = 1 PR.
7. Branch naming must include issue id:
   - `feature/<issue_number>-<slug>`
   - `fix/<issue_number>-<slug>`
   - `chore/<issue_number>-<slug>`
8. Follow Git branching strategy from `docs/runbooks/git-branching-model.md`.
9. Use `pnpm` only. Do not use `npm` or `yarn`.
10. Run and report:
   - `pnpm lint`
   - `pnpm test`
   - `pnpm build`
11. Require `Closes #<issue_number>` in PR body and it must match branch issue id.
12. Keep PR scope aligned to issue acceptance criteria.
13. Before implementation and review, consult relevant docs/runbooks plus MCP and skills when applicable.

## Source of Truth
- Governance policy (machine-readable): `governance/policy.json`
- Workflow rules: `docs/runbooks/github-project-workflow.md`
- Git strategy: `docs/runbooks/git-branching-model.md`
- Preflight gate: `docs/runbooks/agent-preflight-gate.md`
- Operating model: `docs/ai/agent-operating-model.md`
- Angular + AI playbook: `docs/ai/angular-ai-professional-playbook.md`
- AI self-review gate: `docs/ai/checklists/ai-self-review-gate.md`
- Backlog conventions: `docs/planning/github-project-backlog.md`
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

## Mandatory Delivery Sequence
1. `agent:pm` opens/refines parent issue, defines acceptance criteria, child issues, ownership, and execution order.
2. Execution agents (`agent:backend`, `agent:frontend`, `agent:qa`, `agent:release`) resolve child issues in that defined order.
3. Open and close every required PR (one per issue), and run self-review + quality gates before each merge.
