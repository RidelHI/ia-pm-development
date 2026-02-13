# Prompt Template: Frontend Feature (Angular + Signals)

Use this template to define and implement a new Angular frontend feature with feature-first architecture and `@ngrx/signals`.

```text
Context:
- Repo: ia-pm-development
- Stack: Angular 21, TypeScript strict, @ngrx/signals
- Issue: <issue_number and title>
- Feature scope: <short description>

Requirements:
1) Propose a file-level plan under:
   - features/<feature>/domain
   - features/<feature>/data-access
   - features/<feature>/state
   - features/<feature>/ui
2) Define domain model vs API DTO separation.
3) Implement/adjust signal store using:
   - signalStore
   - withState / withComputed / withMethods
   - rxMethod for side effects
4) Keep container/page orchestration in ui/pages and presentational logic in ui/components.
5) Cover loading/empty/error/success states.
6) Include accessibility checks (labels, focus flow, aria-live where relevant).
7) Add or update tests for changed behavior.
8) Finish with validation evidence:
   - pnpm lint
   - pnpm test
   - pnpm build

Constraints:
- Keep PR scoped to issue acceptance criteria.
- Do not mix unrelated refactors.
- Respond in Spanish and include file references.
```
