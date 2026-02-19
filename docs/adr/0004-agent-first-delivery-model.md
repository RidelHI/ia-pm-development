# ADR 0004: Agent-First Delivery Model en Linear + Notion

## Estado
Aceptado - 2026-02-18

## Contexto
El proyecto requiere mantener ownership explicito por agente, reglas de orquestacion y enforcement tecnico en PR, pero operando sobre Linear (tareas/estado) y Notion (documentacion).

## Opciones evaluadas
1. Mantener flujo con labels de tipo/prioridad sin ownership por agente.
2. Definir modelo agent-first con labels `agent:*`, estados en Linear y evidencia tecnica en Notion.

## Decision
Se adopta la opcion 2.

## Razon
- Hace trazable quien lidera cada tarea.
- Reduce ambiguedad al asignar y priorizar trabajo.
- Mantiene reglas operativas visibles en un flujo uniforme de trabajo.
- Alinea aprendizaje tecnico con practica real de equipos asistidos por IA.

## Implementacion base
- Labels de ownership: `agent:pm`, `agent:backend`, `agent:frontend`, `agent:qa`, `agent:release`.
- Estados de trabajo en Linear: `Todo`, `In Progress`, `In Review`, `Done`.
- PR template alineado al flujo Linear + Notion.
- Check en CI para exigir:
  - PR con referencia `Linear: <TEAM-ISSUE>`.
  - PR con owner explicito `Agent Owner: agent:<role>`.
  - Seccion `AI Self-Review Gate` completa.

## Consecuencias
- Mayor consistencia de backlog y flujo de entrega.
- Menor riesgo de PRs sin contexto operativo.
- Costo menor de onboarding para trabajo multiagente.
- Requiere mantener labels y disciplina de vinculacion Linear/Notion al dia.
