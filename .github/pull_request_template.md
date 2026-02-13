## Linked Issue
- [ ] PR description includes `Closes #<issue_number>`
- [ ] PR links exactly one closing issue
- [ ] Linked issue has exactly one `agent:*` label

## Scope
- [ ] This PR implements only the issue scope and acceptance criteria
- [ ] Issue status moved to `In Review` in GitHub Project

## Orchestration
- [ ] Execution issue includes `Parent PM`, `Execution Order`, and `Depends on`
- [ ] Parent PM issue is `agent:pm` and references this child issue in its plan
- [ ] All dependencies listed in `Depends on` are closed before merge

## Changes
-

## Validation
- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] `pnpm build`

## AI Self-Review Gate
### Framework reviewed
- [ ] Angular way
- [ ] NestJS way
- [ ] Framework selection matches changed paths (`apps/web` => Angular way, `apps/api` => NestJS way)

### Checklist
- [ ] I reviewed `docs/ai/checklists/ai-self-review-gate.md`
- [ ] Solution follows framework patterns and project rules

### Decision
Decision: `Compliant | Needs Changes`

### Notes
-

## Risks / Notes
-
