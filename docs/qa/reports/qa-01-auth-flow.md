# QA-01 Quality Gate: register-login-products

Issue: `#24`  
Role: `agent:qa`  
Branch: `feature/qa-01-auth-flow-quality-gate`

## Quality Decision
Status: **PASS (Ready for review)**

The auth flow is covered in backend and frontend for happy path and rejection path, with local validation evidence for lint, test, and build.

## Risk-Based Test Matrix
| Risk area | Scenario | Expected result | Evidence |
| --- | --- | --- | --- |
| Registration contract | `POST /v1/auth/register` with valid payload | Creates user, no password hash in response | `apps/api/test/app.e2e-spec.ts` (`/v1/auth/register creates user`) |
| Duplicate usernames | Register same username twice | Returns `409` | `apps/api/test/app.e2e-spec.ts` (`rejects duplicated username`) |
| Login with persisted users | `POST /v1/auth/token` after register | Returns `200` with access token | `apps/api/test/app.e2e-spec.ts` (`authenticates persisted user`) |
| Protected products route | `GET /v1/products` without token | Returns `401` | `apps/api/test/app.e2e-spec.ts` (`requires auth`) |
| Authorized read access | `GET /v1/products` with user token | Returns paginated products | `apps/api/test/app.e2e-spec.ts` (`applies pagination for authenticated user`) |
| Unauthorized write access | `POST /v1/products` with user token | Returns `403` | `apps/api/test/app.e2e-spec.ts` (`denies user role`) |
| Frontend route protection | Access private route unauthenticated | Redirect to `/login` | `apps/web/src/app/core/guards/auth.guard.spec.ts` |
| Frontend guest protection | Access login/register authenticated | Redirect to `/products` | `apps/web/src/app/core/guards/guest.guard.spec.ts` |
| Frontend token propagation | API request with session token | Sends `Authorization` header | `apps/web/src/app/core/http/auth.interceptor.spec.ts` |
| UI login happy path | Submit valid credentials | Calls auth API and navigates to `/products` | `apps/web/src/app/features/auth/pages/login.page.spec.ts` |
| UI login rejection path | Login with invalid credentials | Shows actionable error | `apps/web/src/app/features/auth/pages/login.page.spec.ts` |
| UI products integration | Products page init with valid session | Calls API and renders list state | `apps/web/src/app/features/products/pages/products.page.spec.ts` |
| UI session expiry handling | Products API returns `401` | Clears session and redirects to `/login` | `apps/web/src/app/features/products/pages/products.page.spec.ts` |

## Command Evidence
Executed on `2026-02-12`:

```bash
pnpm --filter web lint
pnpm --filter web test
pnpm --filter web build
pnpm lint
pnpm test
pnpm build
```

Observed result:
- `web lint`: pass
- `web test`: pass (`9` files, `18` tests)
- `web build`: pass
- workspace `lint/test/build`: pass

## Residual Risks
1. Frontend flow is validated with unit/component tests, but not with full browser e2e (Playwright/Cypress) against a running API.
2. JWT expiry is indirectly covered (401 handling), but no deterministic test for near-expiry refresh windows because refresh token flow is out of scope.
3. Production Supabase networking and permission policies still depend on environment parity; local tests mainly validate app logic and contracts.
