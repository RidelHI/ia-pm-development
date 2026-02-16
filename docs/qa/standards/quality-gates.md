# QA Quality Gate Standard

## Objective
Define minimum quality gates for issue delivery and PR readiness.

## Mandatory checks
1. Scope traceability to one issue with exactly one `agent:*` label.
2. Local validation commands:
   - `pnpm lint`
   - `pnpm test`
   - `pnpm build`
3. PR body includes:
   - `Closes #<issue_number>`
   - `AI Self-Review Gate` section with framework and decision.

## Evidence requirements
- Every QA report must include:
  - risk-based test matrix
  - command evidence
  - residual risks
- Store reports under `docs/qa/reports/`.

## Decision outcomes
- `PASS`: acceptance criteria and quality gates are satisfied.
- `FAIL`: blocking quality issue found.
- `CONDITIONAL PASS`: merge allowed with explicit residual risk and follow-up issue.

## References
- `docs/ai/checklists/ai-self-review-gate.md`
- `docs/ai/workflows/review-pr.md`
- `docs/runbooks/github-project-workflow.md`
