# Operating Model: AI + Agentica Professional

## Objetivo
Definir un modelo operativo profesional para desarrollo asistido por IA, con trazabilidad completa en GitHub Projects y ownership claro por agente.

## Topologia real de ejecucion
Este proyecto opera como `single-agent, multi-role`:
- Humano (`orquestador`): decide prioridad, aprueba plan y valida resultado.
- Agente IA (`ejecutor`): cambia de rol segun la tarea (`pm`, `backend`, `frontend`, `qa`, `release`).
- GitHub (`sistema de registro`): backlog, estado y trazabilidad.
- CI/CD (`guardia automatica`): enforcement tecnico antes de merge.

No se asume ejecucion paralela de cinco agentes independientes.

## Decisiones clave
1. GitHub Project es la fuente unica de verdad para backlog y estados.
2. Toda tarea nace como issue y debe tener exactamente un label `agent:*`.
3. Cada cambio tecnico se entrega por PR pequena enlazada con `Closes #<issue_number>`.
4. CI bloquea merge si falta issue enlazada o si la issue no tiene ownership por agente.
5. La estrategia de ramas es `GitHub Flow` con ramas cortas segun `docs/runbooks/git-branching-model.md`.

## Taxonomia de agentes
| Label | Rol | Responsabilidad principal | Entregables obligatorios |
| --- | --- | --- | --- |
| `agent:pm` | Project Manager Agent | Definir alcance, criterios de aceptacion, priorizacion y secuencia | Issue refinada, criterios de aceptacion claros, estado en Project actualizado |
| `agent:backend` | Backend Agent | Implementar cambios de API, dominio, seguridad y datos en NestJS | Codigo + tests + docs de contrato cuando aplique |
| `agent:frontend` | Frontend Agent | Implementar UI/UX Angular y consumo de API | Componentes, estados de loading/error, tests de UI |
| `agent:qa` | Testing Agent | Definir y ejecutar estrategia de pruebas y regresion | Casos de prueba, evidencia de validacion, reporte de riesgos |
| `agent:release` | Release Agent | Cuidar CI/CD, deploy y smoke tests post-merge | Pipeline verde, verificacion de deploy, runbook actualizado |

## Modos operativos
Para reducir overhead mental, usar tres modos macro durante la ejecucion:
- `PM mode`: refinar issue, definir scope, criterios y secuencia.
- `DEV mode`: implementar cambios de backend/frontend.
- `OPS mode`: validar calidad, CI/CD, deploy y smoke checks.

Los labels `agent:*` siguen siendo obligatorios para ownership y trazabilidad, aunque la ejecucion sea por un solo agente IA.

## Flujo operativo
1. PM crea o refina issue, define alcance, criterios de aceptacion y labels (`type:*`, `priority:*`, `agent:*`).
2. PM mueve card a `Todo`.
3. Agente owner mueve card a `In Progress`, crea rama y ejecuta implementacion.
4. Agente owner valida `pnpm lint`, `pnpm test`, `pnpm build`.
5. Agente owner ejecuta self-review final con `docs/ai/checklists/ai-self-review-gate.md`.
6. Agente owner abre PR con `Closes #<issue_number>` y seccion `AI Self-Review Gate`; luego mueve issue a `In Review`.
7. Reviewer/QA valida cumplimiento funcional y calidad.
8. Con merge a `main`, issue pasa a `Done`.

## Definition of done por agente
### `agent:pm`
- Scope acotado y no ambiguo.
- Criterios de aceptacion medibles.
- Labels y milestone correctos.

### `agent:backend`
- Contrato API consistente con implementacion.
- Casos de error manejados.
- Tests unit/e2e afectados en verde.

### `agent:frontend`
- Estados vacio/loading/error definidos.
- Integracion API sin acoplamientos fragiles.
- Tests de componentes o integracion en verde.

### `agent:qa`
- Matriz de casos principal cubierta.
- Riesgos residuales explicitados.
- Evidencia de verificacion anexada en PR.

### `agent:release`
- Workflow de CI y deploy exitoso.
- Smoke test post deploy documentado.
- Runbook y notas operativas actualizadas.

## Reglas de orquestacion
1. Sin issue refinada, no hay desarrollo.
2. Sin ownership por agente, la issue no entra en ejecucion.
3. Sin preflight (`pnpm agent:preflight -- --issue <issue_number> --agent <agent:role>`), no hay implementacion.
4. Sin PR enlazada a issue, no hay merge.
5. Sin evidencia de calidad, no hay cierre.

## Workflows y prompts
Usar estos artefactos para repetir procesos con consistencia:
- Workflows:
  - `docs/ai/workflows/new-feature.md`
  - `docs/ai/workflows/review-pr.md`
  - `docs/ai/workflows/deploy.md`
- Git strategy:
  - `docs/runbooks/git-branching-model.md`
  - `docs/runbooks/agent-preflight-gate.md`
- Angular + AI:
  - `docs/ai/angular-ai-professional-playbook.md`
  - `docs/runbooks/angular-frontend-architecture.md`
  - `docs/runbooks/angular-mcp-setup.md`
- Prompt templates:
  - `docs/ai/prompts/feature-spec-prompt.md`
  - `docs/ai/prompts/audit-prompt.md`
  - `docs/ai/prompts/refactor-prompt.md`
  - `docs/ai/prompts/frontend-feature-signals-prompt.md`
  - `docs/ai/prompts/frontend-refactor-signals-prompt.md`
  - `docs/ai/prompts/frontend-audit-signals-prompt.md`

## Context files para asistentes IA
Archivos versionados para mantener consistencia entre herramientas:
- `AGENTS.md`
- `governance/policy.json`
- `.github/copilot-instructions.md`
- `.instructions.md`
- `.cursor/rules/angular-web.mdc`
- `llms.txt`

## Operacion con GitHub CLI
```bash
gh issue list --state open --limit 20
gh project item-list 1 --owner RidelHI --limit 30
gh pr list --state open --limit 20
```

## Bootstrap de labels de agentes
```bash
gh label create "agent:pm" --color "5319E7" --description "Project management and scope ownership"
gh label create "agent:backend" --color "0E8A16" --description "Backend ownership (NestJS/API)"
gh label create "agent:frontend" --color "1D76DB" --description "Frontend ownership (Angular/UI)"
gh label create "agent:qa" --color "FBCA04" --description "Testing and quality ownership"
gh label create "agent:release" --color "D93F0B" --description "CI/CD and release ownership"
```
