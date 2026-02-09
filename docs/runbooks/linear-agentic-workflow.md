# Linear Agentic Workflow (Local-First)

## Objetivo
Usar Linear como source of truth (kanban) y ejecutar implementación con Codex en PRs pequeños, trazables y auditables, priorizando trabajo local sin perder soporte cloud.

## Arquitectura recomendada (óptima)
1. `Linear` como gestor de trabajo (issues, estado, prioridad).
2. `GitHub` como sistema de cambios (rama/PR/CI/merge).
3. `Codex local` (CLI/IDE extension en Antigravity) como carril principal de implementación.
4. `Codex cloud` como carril secundario para tareas delegables (research, spike, refactor acotado).

Razón: maximiza control del workspace local (deps, pruebas, secretos y contexto real), y usa cloud donde aporta paralelismo.

## Estado recomendado del board (kanban)
1. `Backlog`
2. `Todo`
3. `In Progress`
4. `In Review`
5. `Done`

## Convenciones de trabajo
- 1 issue de Linear = 1 rama = 1 PR.
- Rama: `feature/<linear-key>-<slug>` o `fix/<linear-key>-<slug>`.
- PR debe incluir la clave de Linear en título o body (`WMS-12`).
- No mezclar scope de varios issues en un mismo PR.
- Etiqueta de ejecución en Linear:
  - `exec:local` (default)
  - `exec:cloud` (solo cuando haya ganancia clara)

## Ciclo operativo recomendado
1. PM mueve issue a `Todo`, define AC y asigna etiqueta `exec:local` o `exec:cloud`.
2. Codex toma issue, crea rama `feature/<linear-key>-<slug>` y mueve a `In Progress`.
3. Implementación estricta del issue + validación local (`lint/test/build`).
4. Apertura de PR enlazada al issue, mover a `In Review`.
5. Merge con CI verde y mover a `Done`.

## Integración con Antigravity (VS Code fork)
1. Instalar extensión de Codex y (opcional) extensión de Linear desde marketplace compatible.
2. Mantener el repo abierto localmente en Antigravity para que Codex trabaje sobre archivos reales.
3. Si una extensión falla por compatibilidad del fork, usar `codex` CLI como fallback principal.

## Integración MCP de Linear para Codex local
Configurar una vez:
```bash
codex mcp add --transport sse linear https://mcp.linear.app/sse
codex mcp list
```

Nota: este camino aplica al trabajo local de Codex (CLI/IDE). Para cloud, usar la integración nativa de Linear con Codex Agent.

## Política de uso Local vs Cloud
Usar `exec:local` cuando:
- haya cambios de código con dependencia de estado local;
- se necesite test/build real del monorepo;
- existan secretos/config local.

Usar `exec:cloud` cuando:
- sea research o diseño de propuesta;
- sea refactor mecánico y acotado;
- quieras paralelizar sin bloquear la máquina local.

## Plantilla de prompt al agente (por issue)
```md
Issue: WMS-XX
Contexto: <link linear>
Criterios de aceptación:
- ...

Tarea:
1) Dame plan breve (archivos/comandos/tests/riesgos)
2) Implementa solo este scope
3) Entrega resumen + checklist de criterios + comandos de verificación
```

## Definición de Done (DoD)
- CI en verde (`lint`, `test`, `build`).
- PR enlazada al issue de Linear.
- Criterios de aceptación cumplidos.
- Documentación actualizada si aplica.
- Estado Linear actualizado (`In Review`/`Done`).

## Crear issues semilla desde este repo
Variables necesarias:
- `LINEAR_API_KEY`
- `LINEAR_TEAM_KEY` (ejemplo: `WMS`)

Dry run:
```bash
pnpm linear:dry-run
```

Creación real:
```bash
pnpm linear:create
```

Archivo semilla: `docs/planning/linear-issues.seed.json`.
