# Runbook: Web E2E with Playwright

## Objective
Run browser-level E2E tests for `apps/web` to validate final user outcomes beyond unit and API tests.

## Why this is the Angular way
- Angular recommends using external E2E tooling for browser workflows.
- This repo standardizes on Playwright for deterministic browser automation and CI integration.

References:
- https://angular.dev/guide/testing
- https://angular.dev/guide/testing/components-scenarios/e2e-testing
- https://playwright.dev/docs/best-practices

## Scope covered
- Login success and navigation to `/products`.
- Products search flow with empty-state rendering when query has no matches.

## Local execution
1. Install browsers once:
```bash
pnpm exec playwright install chromium
```

2. Run E2E:
```bash
pnpm test:e2e:web
```

## Architecture and test layout
```text
apps/web-e2e/
  playwright.config.ts
  tests/
    auth-products.e2e.spec.ts
```

## Reliability conventions
- Prefer semantic locators (`getByRole`, `getByLabel`, visible text) over brittle CSS selectors.
- Keep tests independent with unique generated users.
- Use realistic user paths (navigate, fill forms, click submit, observe UI state).
- Keep assertions user-visible (headers, feedback messages, navigation).

## CI integration
The `quality` job executes:
1. `pnpm lint`
2. `pnpm test`
3. `pnpm build`
4. `pnpm exec playwright install --with-deps chromium`
5. `pnpm test:e2e:web`

If any E2E flow fails, the PR is blocked.
