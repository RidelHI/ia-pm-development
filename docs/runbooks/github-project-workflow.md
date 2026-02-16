# Runbook: GitHub Project Workflow (Agent-First)

## Objetivo
Operar un flujo profesional y trazable con GitHub Issues + GitHub Project + PR, con ownership explicito por agente.

## Fuente de verdad
- Planificacion y estado: GitHub Project (`MVP - Warehouse Kanban`).
- Ownership de ejecucion: label `agent:*` en cada issue.
- Ejecucion tecnica: rama + commits + PR en el repo.
- Cierre: merge a `main` con `Closes #<issue_number>`.

## Espacio operativo
- Project: `MVP - Warehouse Kanban`
- Owner: `RidelHI`
- Repositorio: `RidelHI/ia-pm-development`

## Columnas del tablero
- `Todo`
- `In Progress`
- `In Review`
- `Done`

## Taxonomia de labels
- Tipo: `type:backend`, `type:frontend`, `type:devops`, `type:docs`, `type:test`
- Prioridad: `priority:p1`, `priority:p2`, `priority:p3`
- Estado especial: `status:blocked`
- Ownership (exactamente uno): `agent:pm`, `agent:backend`, `agent:frontend`, `agent:qa`, `agent:release`

## Contrato minimo de issue
Toda issue debe incluir:
1. Objetivo, scope y criterios de aceptacion.
2. Labels `type:*`, `priority:*` y exactamente un `agent:*`.
3. Milestone (cuando aplique a entregable de release).

Sin ownership `agent:*`, la tarea no entra a ejecucion.

## Flujo estandar por tarea
1. PM crea/refina issue y valida criterios de aceptacion.
2. PM mueve la card a `Todo`.
3. Agente owner crea rama con issue id:
   - `feature/<issue_number>-<slug>`
   - `fix/<issue_number>-<slug>`
   - `chore/<issue_number>-<slug>`
4. Agente owner toma issue y mueve card a `In Progress`.
5. Agente owner ejecuta preflight obligatorio:
   - `pnpm agent:preflight -- --issue <issue_number> --agent <agent:role>`
6. Agente owner implementa solo el scope de la issue.
7. Agente owner ejecuta: `pnpm lint`, `pnpm test`, `pnpm build`.
8. Agente owner completa self-review en `docs/ai/checklists/ai-self-review-gate.md`.
9. Agente owner abre PR con `Closes #<issue_number>` + seccion `AI Self-Review Gate`.
10. Agente owner mueve card a `In Review`.
11. QA/Reviewer valida criterios y evidencia.
12. Al merge, la issue pasa a `Done`.

## Reglas operativas
- `1 issue = 1 rama = 1 PR`.
- Rama debe incluir issue id y coincidir con `Closes #<issue_number>`.
- PR pequena, trazable y sin scope creep.
- No se trabaja fuera de issue activa del tablero.
- CI debe pasar antes de merge.
- El check `quality` valida rama, issue enlazada, ownership `agent:*`, pertenencia al Project y `AI Self-Review Gate`.

## Asignacion sugerida por tipo
- `type:backend` -> `agent:backend`
- `type:frontend` -> `agent:frontend`
- `type:test` -> `agent:qa` (o owner tecnico si testing acoplado)
- `type:devops` -> `agent:release`
- `type:docs` -> `agent:pm` (o owner tecnico del area)

## Operacion diaria con CLI
```bash
gh issue list --state open --limit 20
gh project view 1 --owner RidelHI --web
gh project item-list 1 --owner RidelHI --limit 30
gh pr list --state open --limit 20
```

## Referencias
- `docs/ai/agent-operating-model.md`
- `docs/runbooks/git-branching-model.md`
- `docs/runbooks/agent-preflight-gate.md`
- `docs/runbooks/github-pr-flow.md`
- `docs/ai/workflows/new-feature.md`
- `AGENTS.md`
