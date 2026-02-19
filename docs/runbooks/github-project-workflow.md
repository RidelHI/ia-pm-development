# Runbook: Linear + Notion Workflow (Agent-First)

## Objetivo
Operar un flujo profesional y trazable con Linear (tareas/estado) + Notion (documentacion), con ownership explicito por agente.

## Fuente de verdad
- Planificacion y estado: Linear board.
- Ownership de ejecucion: label `agent:*` en cada issue.
- Ejecucion tecnica: rama + commits + PR en el repo.
- Documentacion operativa: pagina de Notion enlazada a la issue.
- Cierre: merge a `main` con referencia `Linear: <TEAM-ISSUE>` en PR.

## Espacio operativo
- Team Linear: `Ia-integration`
- Estados esperados: `Todo`, `In Progress`, `In Review`, `Done`

## Taxonomia de labels
- Tipo: `type:backend`, `type:frontend`, `type:devops`, `type:docs`, `type:test`
- Prioridad: `priority:p1`, `priority:p2`, `priority:p3`
- Estado especial: `status:blocked`
- Ownership (exactamente uno): `agent:pm`, `agent:backend`, `agent:frontend`, `agent:qa`, `agent:release`

## Contrato minimo de issue
Toda issue debe incluir:
1. Objetivo, scope y criterios de aceptacion.
2. Labels `type:*`, `priority:*` y exactamente un `agent:*`.
3. Estado inicial `Todo`.
4. Link a nota de Notion cuando inicia ejecucion.

Sin ownership `agent:*`, la tarea no entra a ejecucion.

## Flujo estandar por tarea
1. PM define o refina la issue con alcance y criterios de aceptacion.
2. PM agrega labels `type:*`, `priority:*` y exactamente un `agent:*`.
3. PM mueve la issue a `Todo` en Linear.
4. Agente owner toma la issue y la mueve a `In Progress`.
5. Agente owner crea rama (`feature/<slug>` o `fix/<slug>`) y ejecuta implementacion acotada al scope.
6. Agente owner crea/actualiza nota de Notion con decisiones y evidencia.
7. Agente owner ejecuta calidad local: `pnpm lint`, `pnpm test`, `pnpm build`.
8. Agente owner ejecuta self-review final con `docs/ai/checklists/ai-self-review-gate.md`.
9. Agente owner abre PR con `Linear: <TEAM-ISSUE>`, `Agent Owner: agent:<role>`, `Notion: <url>` y seccion `AI Self-Review Gate`.
10. Agente owner mueve la issue a `In Review`.
11. QA/Reviewer valida criterios de aceptacion y evidencia tecnica.
12. Al merge, la issue pasa a `Done`.

## Reglas operativas
- 1 issue = 1 rama = 1 PR.
- PR pequena y trazable.
- No expandir scope fuera de criterios de aceptacion.
- CI debe pasar antes de merge.
- El check `quality` valida referencia Linear en PR, self-review y convencion de rama.

## Convencion de integracion Linear <-> Notion
1. El titulo de la nota en Notion inicia con el identificador de issue (ejemplo: `IA-17 - Stock crítico dashboard`).
2. La nota contiene:
   - resumen de enfoque
   - decisiones tecnicas
   - evidencia de pruebas
   - riesgos residuales
3. La issue de Linear incluye el link de Notion en `links` o en comentario.
4. Cualquier cambio relevante de scope se registra en ambos lados (issue + nota).

## Operacion diaria (MCP)
- Linear:
  - Crear issue
  - Mover estado (`Todo` -> `In Progress` -> `In Review` -> `Done`)
  - Mantener un unico `agent:*`
- Notion:
  - Crear y actualizar pagina por issue
  - Referenciar issue y PR

## Referencia
- Modelo completo de roles y reglas: `docs/ai/agent-operating-model.md`
- Estrategia de ramas por caso: `docs/runbooks/git-branching-model.md`
- Instrucciones persistentes del agente: `AGENTS.md`
- Workflows operativos: `docs/ai/workflows/`
- Prompt templates: `docs/ai/prompts/`
