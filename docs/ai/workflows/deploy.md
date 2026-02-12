---
description: Execute release and deploy checks for web and API with evidence and rollback awareness.
---

# Workflow: Deploy

## Inputs
- Target: `web`, `api`, or `both`.
- Deployment issue (recommended with `agent:release`).
- Environment: staging/production.

## Step 1: Release Readiness
1. Confirm linked issue scope and acceptance criteria.
2. Confirm CI green on target branch.
3. Confirm required environment variables are defined for target service.

## Step 2: Pre-deploy Verification
1. Run local gates:
   - `pnpm lint`
   - `pnpm test`
   - `pnpm build`
2. Validate deployment configs:
   - API: `render.yaml`, `docs/runbooks/render-api-deploy.md`
   - Web: `.github/workflows/deploy-web-pages.yml`

## Step 3: Deploy Execution
1. Trigger deployment via normal branch/merge flow.
2. Monitor workflow execution and deployment logs.
3. Do not mix feature changes in release-only PRs.

## Step 4: Post-deploy Smoke
1. API checks:
   - `/v1/health/live`
   - critical endpoint sample
2. Web checks:
   - app loads
   - primary route renders
   - API integration path reachable when applicable

## Step 5: Closeout
1. Record deployment evidence in PR or issue.
2. Update runbook if procedure changed.
3. Move issue to `Done` when acceptance criteria are met.

## Output Contract
- Deployment status and smoke evidence.
- Known issues and mitigation path.
- Updated operational notes when behavior changed.
