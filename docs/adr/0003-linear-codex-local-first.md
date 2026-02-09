# ADR 0003: Estrategia de Integración Linear + Codex (Local-First)

## Estado
Aceptado - 2026-02-09

## Contexto
Se usará Codex en dos modos: local (Antigravity/CLI) y cloud. Se requiere un flujo único, trazable y con mínima fricción para ejecutar trabajo por issues en Linear.

## Opciones evaluadas
1. Solo scripts API de Linear desde el repo.
2. Solo delegación a Codex cloud desde Linear.
3. Híbrido local-first: Linear + GitHub + Codex local como principal y cloud como carril secundario.

## Decisión
Elegimos la opción 3.

## Razonamiento
- El trabajo local permite validar el estado real del monorepo (lint/test/build) con máxima confiabilidad.
- Cloud aporta paralelismo útil, pero no reemplaza verificación local ni control fino del entorno.
- Un único tablero en Linear evita fragmentación de estado y reduce retrabajo.

## Implementación operativa
- Linear: source of truth de issues/estados/prioridad.
- GitHub: source of truth de cambios (PR/CI/merge).
- Codex local: implementación por defecto (`exec:local`).
- Codex cloud: uso selectivo (`exec:cloud`).

## Guardrails
- 1 issue = 1 rama = 1 PR.
- PR debe enlazar issue de Linear.
- No mover a `Done` sin CI verde y merge.
- Estado recomendado: `Backlog -> Todo -> In Progress -> In Review -> Done`.

## Consecuencias
- Mayor disciplina de proceso y trazabilidad.
- Ligero overhead de gestión de estado en Linear.
- Menor riesgo de divergencia entre trabajo local y cloud.