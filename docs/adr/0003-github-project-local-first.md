# ADR 0003: Linear + Notion + Codex (Local-First)

## Estado
Aceptado - 2026-02-18

## Contexto
Se requiere mantener un flujo simple y sostenible para planificar y ejecutar trabajo individual, pero con mejor separacion entre gestion operativa (issues/kanban) y documentacion reusable.

## Opciones evaluadas
1. Mantener gestion en GitHub Issues + GitHub Projects.
2. Migrar a Linear para backlog/estado y Notion para documentacion operativa.

## Decision
Se adopta la opcion 2: Linear como source of truth para backlog/kanban y Notion como base de conocimiento operativa, manteniendo Codex en local como implementador principal.

## Razon
- Estados y priorizacion mas directos para operacion diaria (`Todo`, `In Progress`, `In Review`, `Done`).
- Mejor trazabilidad de decisiones tecnicas en paginas vivas de Notion.
- Menor friccion para compartir contexto fuera del PR.

## Consecuencias
- El tablero oficial de seguimiento pasa a Linear.
- Todas las tareas nuevas se crean y gestionan como issues de Linear.
- Cada issue activa debe enlazar una nota de Notion para decisiones/evidencia.
