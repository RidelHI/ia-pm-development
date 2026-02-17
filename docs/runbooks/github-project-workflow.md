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
1. PM define o refina la issue con alcance y criterios de aceptacion.
2. PM agrega labels `type:*`, `priority:*` y exactamente un `agent:*`.
3. PM mueve la card a `Todo` en el Project.
4. Agente owner toma la issue y la mueve a `In Progress`.
5. Agente owner crea rama (`feature/<slug>` o `fix/<slug>`) y ejecuta implementacion acotada al scope.
6. Agente owner ejecuta calidad local: `pnpm lint`, `pnpm test`, `pnpm build`.
7. Agente owner ejecuta self-review final con `docs/ai/checklists/ai-self-review-gate.md`.
8. Agente owner abre PR con `Closes #<issue_number>` y seccion `AI Self-Review Gate`.
9. Agente owner mueve la issue a `In Review`.
10. QA/Reviewer valida criterios de aceptacion y evidencia tecnica.
11. Al merge, la issue pasa a `Done`.

## Reglas operativas
- 1 issue = 1 rama = 1 PR.
- PR pequena y trazable.
- No expandir scope fuera de criterios de aceptacion.
- CI debe pasar antes de merge.
- El check `quality` valida convencion de rama, issue enlazada con label `agent:*` y `AI Self-Review Gate` en PR.

## Operacion diaria con CLI
```bash
gh issue list --state open --limit 20
gh project view 1 --owner RidelHI --web
gh project item-list 1 --owner RidelHI --limit 30
gh pr list --state open --limit 20
```

## Referencia
- Modelo completo de roles y reglas: `docs/ai/agent-operating-model.md`
- Estrategia de ramas por caso: `docs/runbooks/git-branching-model.md`
- Instrucciones persistentes del agente: `AGENTS.md`
- Workflows operativos: `docs/ai/workflows/`
- Prompt templates: `docs/ai/prompts/`
