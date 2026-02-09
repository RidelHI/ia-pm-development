# ADR 0002: Tooling de Desarrollo (pnpm, Git y Angular CLI)

## Estado
Aceptado - 2026-02-09

## Contexto
Se busca una base profesional, estable y alineada con herramientas oficiales para trabajo por PRs pequeños.

## Decisión 1: Gestión de paquetes (`pnpm`)
Opciones evaluadas:
1. `pnpm` global instalado en cada máquina.
2. `corepack` + `packageManager` fijo en el repo.

Elección: opción 2 como estándar, opción 1 como fallback.
Razón: mayor reproducibilidad por versión y menor deriva entre entornos.

## Decisión 2: Baseline de Git
Opciones evaluadas:
1. Inicializar Git sin reglas de fin de línea.
2. Inicializar Git con `.gitattributes` y convenciones de rama.

Elección: opción 2.
Razón: reduce ruido por CRLF/LF y evita problemas de lint/format en equipos mixtos.

## Decisión 3: Angular CLI defaults (Angular way)
Opciones evaluadas:
1. Usar defaults mínimos del CLI.
2. Ajustar defaults de generación para prácticas de equipo (OnPush + standalone + tests).

Elección: opción 2.
Razón: evita drift de estilo al escalar features y mantiene consistencia desde el primer comando `ng generate`.

## Consecuencias
- Menos fricción al generar artefactos Angular.
- Menos conflictos de line endings.
- Requiere documentar claramente fallback para entornos restringidos.