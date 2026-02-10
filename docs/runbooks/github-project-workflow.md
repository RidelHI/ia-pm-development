# Runbook: GitHub Project Workflow (Local-First)

## Objetivo
Usar GitHub Issues + GitHub Projects como unico espacio de planificacion y seguimiento, con implementacion en local usando Codex y entrega por PRs pequenos.

## Fuente de verdad
- Planificacion y estado: GitHub Project (`MVP - Warehouse Kanban`).
- Ejecucion tecnica: ramas + commits + PR en el repo.
- Cierre de trabajo: merge a `main` con issue cerrada.

## Flujo estandar por tarea
1. Seleccionar issue en estado `Todo` del Project.
2. Mover issue a `In Progress`.
3. Crear rama: `feature/<slug>` o `fix/<slug>`.
4. Implementar alcance minimo definido en la issue.
5. Ejecutar calidad local:
   - `pnpm lint`
   - `pnpm test`
   - `pnpm build`
6. Abrir PR con `Closes #<issue_number>`.
7. Mover issue a `In Review`.
8. Al merge, mover issue a `Done` (o automatizar desde el board).

## Convenciones recomendadas
- 1 issue = 1 rama = 1 PR.
- PR pequena, enfocada y trazable.
- No expandir scope fuera de criterios de aceptacion.
- Si CI falla, se corrige antes de continuar con otra tarea.

## Operacion diaria con CLI
```bash
gh issue list --state open
gh project view 1 --owner RidelHI --web
gh pr list --state open
```

## Plantilla minima para PR
- Objetivo de la issue.
- Cambios realizados.
- Evidencia de pruebas (`lint/test/build`).
- Riesgos/impacto.
- `Closes #<issue_number>`.
