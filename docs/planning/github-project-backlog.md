# Backlog Operativo en GitHub Projects

## Espacio oficial
- Project: `MVP - Warehouse Kanban`
- Owner: `RidelHI`
- Repositorio: `RidelHI/ia-pm-development`

## Estructura recomendada de columnas
- `Todo`
- `In Progress`
- `In Review`
- `Done`

## Etiquetas recomendadas
- Tipo: `type:backend`, `type:frontend`, `type:devops`, `type:docs`, `type:test`
- Prioridad: `priority:p1`, `priority:p2`, `priority:p3`
- Estado especial: `status:blocked`
- Owner por agente (exactamente una): `agent:pm`, `agent:backend`, `agent:frontend`, `agent:qa`, `agent:release`

## Reglas operativas
1. Cada tarea nace como GitHub Issue.
2. Toda issue debe tener labels y milestone.
3. Toda issue debe tener exactamente un label `agent:*`.
4. Toda implementacion entra por PR enlazado (`Closes #N`).
5. No se trabaja fuera de issue activa en el tablero.
6. La issue se mueve a `In Review` al abrir PR y a `Done` al merge.
7. Rama obligatoria con issue id: `feature|fix|chore/<issue_number>-<slug>`.
8. Preflight obligatorio antes de codificar:
   - `pnpm agent:preflight -- --issue <issue_number> --agent <agent:role>`

## Asignacion sugerida por tipo
- `type:backend` -> `agent:backend`
- `type:frontend` -> `agent:frontend`
- `type:test` -> `agent:qa` (o el owner tecnico cuando sea testing acoplado)
- `type:devops` -> `agent:release`
- `type:docs` -> `agent:pm` (o owner tecnico del area documentada)
