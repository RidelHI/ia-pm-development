# Linear Agentic Workflow

## Objetivo
Usar Linear como source of truth (kanban) y ejecutar implementación con Codex en PRs pequeños, trazables y auditables.

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

## Ciclo operativo recomendado
1. PM mueve issue a `Todo` y lo asigna a `Codex Agent` (usuario técnico o etiqueta equivalente).
2. Codex toma issue, crea rama y lo mueve a `In Progress`.
3. Codex implementa solo criterios de aceptación del issue.
4. Codex abre PR y mueve issue a `In Review`.
5. Reviewer aprueba, se mergea, issue pasa a `Done`.

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