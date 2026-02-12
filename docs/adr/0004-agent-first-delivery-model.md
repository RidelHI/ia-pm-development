# ADR 0004: Agent-First Delivery Model en GitHub Project

## Estado
Aceptado - 2026-02-12

## Contexto
El proyecto ya opera con GitHub Issues, Project y CI obligatoria. Para escalar uso profesional de IA y agentica se necesita ownership explicito por agente, reglas de orquestacion y enforcement tecnico en PR.

## Opciones evaluadas
1. Mantener flujo actual sin ownership por agente, solo con labels de tipo/prioridad.
2. Definir modelo agent-first con labels `agent:*`, campo `Agent` en Project, templates por rol y validaciones en CI.

## Decision
Se adopta la opcion 2.

## Razon
- Hace trazable quien lidera cada tarea.
- Reduce ambiguedad al asignar y priorizar trabajo.
- Convierte reglas operativas en checks de sistema (no solo disciplina manual).
- Alinea aprendizaje tecnico con practica real de equipos modernos asistidos por IA.

## Implementacion base
- Labels de ownership: `agent:pm`, `agent:backend`, `agent:frontend`, `agent:qa`, `agent:release`.
- Campo `Agent` (single select) en GitHub Project.
- Templates de issue por rol en `.github/ISSUE_TEMPLATE/`.
- PR template alineado a GitHub Project.
- Check en CI para exigir:
  - PR con `Closes/Fixes/Resolves #<issue_number>`.
  - Issue enlazada con exactamente un label `agent:*`.

## Consecuencias
- Mayor consistencia de backlog y flujo de entrega.
- Menor riesgo de PRs sin contexto operativo.
- Costo menor de onboarding para trabajo multiagente.
- Requiere mantener taxonomia de labels y templates al dia.
