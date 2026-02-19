# Runbook: Prisma Rollout and Recovery

## Objective
Operate safe releases after the API persistence migration to Prisma, with explicit pre-checks, smoke checks, and rollback steps.

## Scope
Applies to the Prisma migration program cards:
- `IA-19` (Prisma foundation)
- `IA-20` (Auth users repository)
- `IA-21` (Products repository)

## Required CI evidence (pre-merge)
Before rollout, confirm required checks are green for each program PR:
1. Governance Checks
2. Lint
3. Test
4. Build
5. E2E Web (Playwright)
6. quality

Reference CI runs:
- `IA-19` / PR `#84`: <https://github.com/RidelHI/ia-pm-development/actions/runs/22164916471>
- `IA-20` / PR `#85`: <https://github.com/RidelHI/ia-pm-development/actions/runs/22165534321>
- `IA-21` / PR `#86`: <https://github.com/RidelHI/ia-pm-development/actions/runs/22171692119>

## Runtime configuration checklist
Required API environment variables:
1. `DATABASE_URL` (PostgreSQL URL, `postgresql://` or `postgres://`)
2. `DATABASE_SCHEMA` (default `public`)
3. `AUTH_JWT_SECRET` (>= 32 chars in production)
4. `AUTH_JWT_ISSUER`
5. `AUTH_JWT_AUDIENCE`

Operational behavior to verify:
1. API fails fast for products persistence in production if Prisma is not configured (`DATABASE_URL` missing).
2. Non-production can fallback to in-memory for local/test troubleshooting.
3. Prisma client generation succeeds in build/test stages.

## Rollout steps
1. Confirm `main` contains merged PRs for `IA-19`, `IA-20`, and `IA-21`.
2. Confirm CI checks for latest `main` commit are green.
3. Confirm production secrets include valid `DATABASE_URL`.
4. Deploy API and wait for platform deployment success signal.
5. Execute smoke checks.
6. If smoke checks pass, mark release as healthy.

## Smoke checks
Set base URL:

```bash
export API_BASE_URL="https://<api-host>"
```

### API liveness
```bash
curl -fsS "$API_BASE_URL/v1/health/live"
```

Expected:
- HTTP `200`
- response contains `"application": { "status": "up" }`

### Auth flow
```bash
curl -fsS -X POST "$API_BASE_URL/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"release_smoke_admin","password":"StrongPass123!","roles":["admin"]}'

curl -fsS -X POST "$API_BASE_URL/v1/auth/token" \
  -H "Content-Type: application/json" \
  -d '{"username":"release_smoke_admin","password":"StrongPass123!"}'
```

Expected:
- register returns `201`/`200`
- token endpoint returns access token

### Products CRUD flow
Use token from previous step:

```bash
TOKEN="<jwt>"
PRODUCT_ID="smoke-prod-001"

curl -fsS -X POST "$API_BASE_URL/v1/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"$PRODUCT_ID\",\"sku\":\"SMOKE-001\",\"name\":\"Smoke Product\",\"quantity\":10,\"unitPriceCents\":1000,\"status\":\"active\"}"

curl -fsS "$API_BASE_URL/v1/products/$PRODUCT_ID" -H "Authorization: Bearer $TOKEN"

curl -fsS -X PATCH "$API_BASE_URL/v1/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity":12}'

curl -fsS -X DELETE "$API_BASE_URL/v1/products/$PRODUCT_ID" -H "Authorization: Bearer $TOKEN"
```

Expected:
- create/read/update/delete return successful responses
- subsequent lookup after delete returns not found

## Rollback strategy
If release is unhealthy:
1. Revert latest merge commit(s) on `main` using non-destructive `git revert`.
2. Redeploy previous known-good commit.
3. Verify `/v1/health/live` and auth/products smoke checks.
4. Open/refresh incident issue with:
   - failing endpoint(s)
   - failing query/error signature
   - rollback timestamp
   - affected environment

Example rollback commands:
```bash
git switch main
git pull --ff-only origin main
git revert <merge-sha>
git push origin main
```

## Known residual risk
`/v1/health/ready` still checks Supabase + memory and does not yet include Prisma readiness; track and resolve via `IA-27`.
