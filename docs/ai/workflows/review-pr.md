---
description: Review a pull request against issue scope, agent ownership, and quality gates.
---

# Workflow: Review PR

## Inputs
- PR number.
- Linked issue number.

## Step 1: Context Load
1. Read PR description and linked issue.
2. Confirm PR includes `Closes #<issue_number>`.
3. Confirm issue has exactly one `agent:*` label.
4. Confirm PR includes `AI Self-Review Gate` with framework marked and decision.

## Step 2: Scope Validation
1. Compare issue acceptance criteria vs implemented behavior.
2. Flag out-of-scope changes.
3. Flag missing acceptance criteria coverage.

## Step 3: Technical Validation
1. Check architecture consistency with current codebase patterns.
2. Verify tests match the changed behavior.
3. Review failure-path handling (validation, auth, infra error, empty states).

## Step 4: Quality Gates
1. Verify `pnpm lint`, `pnpm test`, `pnpm build` status.
2. Verify CI `quality` check is passing.
3. Check for release-impacting risk when workflow or runtime config changed.
4. Cross-check self-review claims against actual code changes.

## Step 5: Decision
1. Approve when criteria and quality gates are satisfied.
2. Request changes when blockers exist.
3. Provide concise findings ordered by severity.

## Output Contract
- Clear verdict: `approved` or `changes requested`.
- List of blockers with file references.
- Residual risks if approved.
