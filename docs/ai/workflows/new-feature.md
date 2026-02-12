---
description: Deliver a new feature using the agent-first model with issue-to-PR traceability.
---

# Workflow: New Feature

## Inputs
- Issue number, or agreement to create a new issue first.
- Target owner role (`agent:backend`, `agent:frontend`, etc).

## Step 1: Pre-flight
1. Read:
   - `docs/ai/agent-operating-model.md`
   - `docs/runbooks/github-project-workflow.md`
2. Confirm the issue has:
   - Objective, scope, acceptance criteria
   - One `type:*`
   - One `priority:*`
   - Exactly one `agent:*`
3. Confirm project status is `Todo` or `In Progress`.

## Step 2: Plan
1. Build an implementation plan with:
   - Files to change
   - Behavior changes
   - Tests to update/add
   - Risks and rollback notes
2. Keep scope within issue acceptance criteria.
3. Get explicit approval before coding.

## Step 3: Execute
1. Create branch using naming policy:
   - `feature/<slug>` or `fix/<slug>`
2. Implement minimal change that satisfies criteria.
3. Keep unrelated refactors out.

## Step 4: Verify
1. Run:
   - `pnpm lint`
   - `pnpm test`
   - `pnpm build`
2. If failures appear, fix before opening PR.

## Step 5: Deliver
1. Open PR with:
   - `Closes #<issue_number>`
   - Summary of what changed
   - Validation evidence
   - Residual risks
2. Move issue status to `In Review`.

## Output Contract
- PR ready for review.
- Acceptance criteria traceable to code and tests.
- CI-ready evidence included.
