# Runbook: GitHub PR Guardrails

## Objetivo
Configurar GitHub para que el flujo por PR se cumpla de forma automatica y consistente.

## Prerrequisitos
- `gh` autenticado (`gh auth status`).
- Permisos de admin sobre el repo.

## 1) Configurar estrategia de merge del repo
Para mantener historia limpia y simple:
```bash
gh repo edit <owner>/<repo> \
  --delete-branch-on-merge \
  --enable-squash-merge \
  --enable-merge-commit=false \
  --enable-rebase-merge=false
```

## 2) Proteger `main`
Aplicar proteccion (ajustar owner/repo segun corresponda):
```bash
gh api --method PUT repos/<owner>/<repo>/branches/main/protection --input ./main-protection.json
```

Payload base recomendado (`main-protection.json`):
- `required_status_checks.strict = true`
- `required_status_checks.contexts = ["quality"]`
- `required_pull_request_reviews.dismiss_stale_reviews = true`
- `required_pull_request_reviews.required_approving_review_count = 0` (modo solo)
- `required_conversation_resolution = true`
- `required_linear_history = true`
- `allow_force_pushes = false`
- `allow_deletions = false`
- `enforce_admins = true`

Modo equipo:
- Subir `required_approving_review_count` a `1`.

## 3) Convencion de ramas
La convencion se valida en CI (`.github/workflows/ci.yml`):
- `feature/<slug>`
- `fix/<slug>`
- `chore/<slug>`

Si la rama no cumple, CI falla y bloquea merge por el check requerido `quality`.

## 4) Verificacion
```bash
gh repo view <owner>/<repo> --json defaultBranchRef,deleteBranchOnMerge,mergeCommitAllowed,rebaseMergeAllowed,squashMergeAllowed
gh api repos/<owner>/<repo>/branches/main/protection
```
