# ADR 0003: GitHub Projects + Codex (Local-First)

## Estado
Aceptado - 2026-02-10

## Contexto
Se requiere una forma simple y sostenible de planificar y ejecutar trabajo individual con trazabilidad completa en el mismo ecosistema del repositorio.

## Opciones evaluadas
1. Mantener gestion en herramienta externa y ejecutar codigo en local.
2. Migrar a GitHub Issues + GitHub Projects como espacio unico de gestion.

## Decision
Se adopta la opcion 2: GitHub Issues + GitHub Projects como source of truth para backlog/kanban, y Codex en local como implementador principal.

## Razon
- Menor friccion operativa para trabajo individual.
- Trazabilidad directa issue -> branch -> PR -> merge.
- Menos integraciones y menos mantenimiento de scripts auxiliares.

## Consecuencias
- Se eliminan scripts, semillas y runbooks asociados a la herramienta previa de tracking.
- El tablero oficial de seguimiento es el GitHub Project del repositorio.
- Todas las tareas nuevas se crean y gestionan como GitHub Issues.
