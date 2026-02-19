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

## 5) Guardrails CI para Angular + IA
El job `quality` en `.github/workflows/ci.yml` valida adicionalmente:
- PR body con `Linear: <TEAM-ISSUE>` exacto.
- Exactamente 1 issue de Linear por PR.
- Referencia explicita a owner `agent:*` en PR body (`Agent Owner: agent:<role>`).
- Referencia `Notion: <url>` en PR body.
- Seccion `AI Self-Review Gate` presente en PR body.
- Framework marcado en self-review (`Angular way` o `NestJS way`).
- Decision de self-review (`Compliant` o `Needs Changes`).
- Convencion de ramas (`feature/*`, `fix/*`, `chore/*`).
- Estructura frontend feature-first por capas (`domain`, `data-access`, `state`, `ui`).
- Presencia de archivos de contexto IA requeridos:
  - `AGENTS.md`
  - `llms.txt`
  - `.github/copilot-instructions.md`
  - `.instructions.md`
  - `.cursor/rules/angular-web.mdc`
  - `docs/ai/angular-ai-professional-playbook.md`
  - `docs/ai/checklists/ai-self-review-gate.md`
  - `docs/runbooks/angular-mcp-setup.md`

## 6) Troubleshooting rapido
- Falla por `Linear: <TEAM-ISSUE>`:
  - Agregar la linea exacta en el cuerpo del PR y re-ejecutar checks.
- Falla por `Agent Owner: agent:*`:
  - Agregar exactamente un owner en el PR body y verificar que coincide con la issue de Linear.
- Falla por `Notion: <url>`:
  - Agregar la URL de la pagina de Notion enlazada al trabajo.
- Falla por `AI Self-Review Gate`:
  - Completar seccion del PR template usando `docs/ai/checklists/ai-self-review-gate.md`.
  - Marcar framework aplicable y definir `Decision: Compliant` o `Decision: Needs Changes`.
- Falla por estructura feature-first:
  - Revisar `apps/web/src/app/features/<feature>` y crear capas faltantes.
- Falla por archivos IA faltantes:
  - Restaurar los archivos requeridos o ajustar PR si hubo borrado accidental.
