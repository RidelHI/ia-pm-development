# Runbook: GitHub Remote + PR Flow

## Objetivo
Dejar el repo listo para trabajo por PR con `main` protegida y convención de ramas.

## Prerrequisitos
- `gh` autenticado (`gh auth status`).
- Repo local con commit inicial.

## 1) Crear/conectar remoto
```bash
gh repo create <owner>/<repo> --private --source=. --remote=origin
git branch main
git push -u origin main
git push -u origin feature/<slug>
```

Si ya existe el repo remoto:
```bash
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

## 2) Protección de `main`
En cuentas free, branch protection completa requiere repo público.

Opciones:
1. Mantener privado y usar GitHub Pro.
2. Hacer público el repo para mantener costo cero (recomendado en este proyecto de aprendizaje).

```bash
gh repo edit <owner>/<repo> --visibility public
```

Aplicar protección:
```bash
gh api --method PUT repos/<owner>/<repo>/branches/main/protection --input ./main-protection.json
```

Payload recomendado (`main-protection.json`):
- `required_status_checks.strict = true`
- `required_status_checks.contexts = ["quality"]`
- `required_pull_request_reviews.required_approving_review_count = 1`
- `dismiss_stale_reviews = true`
- `required_conversation_resolution = true`
- `required_linear_history = true`
- `allow_force_pushes = false`
- `allow_deletions = false`
- `enforce_admins = true`

## 3) Branch rules
La convención se valida en CI (`.github/workflows/ci.yml`) en PR:
- `feature/<slug>`
- `fix/<slug>`
- `chore/<slug>`

Si la rama no cumple, CI falla y bloquea merge por el check requerido `quality`.

## 4) Verificación
```bash
gh repo view <owner>/<repo> --json url,visibility,defaultBranchRef
gh api repos/<owner>/<repo>/branches/main/protection
```