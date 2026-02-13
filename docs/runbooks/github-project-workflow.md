# Runbook: GitHub Project Workflow (Agent-First)

## Objetivo
Operar con flujo profesional de entrega usando GitHub Issues + GitHub Projects + PR, con asignacion explicita a agentes por label.

## Fuente de verdad
- Planificacion y estado: GitHub Project (`MVP - Warehouse Kanban`).
- Asignacion de ownership: label `agent:*` en cada issue.
- Ejecucion tecnica: rama + commits + PR en el repo.
- Cierre: merge a `main` con issue cerrada por `Closes #<issue_number>`.

## Regla de ownership
Cada issue debe tener exactamente un label `agent:*`:
- `agent:pm`
- `agent:backend`
- `agent:frontend`
- `agent:qa`
- `agent:release`

Sin ese label, la tarea se considera mal definida y no entra a ejecucion.

## Flujo estandar por tarea
1. PM define o refina la issue con alcance y criterios de aceptacion.
2. PM agrega labels `type:*`, `priority:*` y exactamente un `agent:*`.
3. PM mueve la card a `Todo` en el Project.
4. Agente owner crea rama con issue id (`feature/<issue_number>-<slug>`, `fix/<issue_number>-<slug>` o `chore/<issue_number>-<slug>`).
5. Agente owner toma la issue y la mueve a `In Progress`.
6. Agente owner ejecuta preflight obligatorio:
   - `pnpm agent:preflight -- --issue <issue_number> --agent <agent:role>`
7. Agente owner ejecuta implementacion acotada al scope.
8. Agente owner ejecuta calidad local: `pnpm lint`, `pnpm test`, `pnpm build`.
9. Agente owner ejecuta self-review final con `docs/ai/checklists/ai-self-review-gate.md`.
10. Agente owner abre PR con `Closes #<issue_number>` y seccion `AI Self-Review Gate`.
11. Agente owner mueve la issue a `In Review`.
12. QA/Reviewer valida criterios de aceptacion y evidencia tecnica.
13. Al merge, la issue pasa a `Done`.

## Reglas operativas
- 1 issue = 1 rama = 1 PR.
- Rama debe incluir issue id y coincidir con `Closes #<issue_number>`.
- PR pequena y trazable.
- No expandir scope fuera de criterios de aceptacion.
- CI debe pasar antes de merge.
- El check `quality` valida convencion de rama, issue enlazada con label `agent:*`, pertenencia al Project y `AI Self-Review Gate` en PR.

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
- Preflight local obligatorio: `docs/runbooks/agent-preflight-gate.md`
- Instrucciones persistentes del agente: `AGENTS.md`
- Workflows operativos: `docs/ai/workflows/`
- Prompt templates: `docs/ai/prompts/`
