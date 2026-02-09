# ADR 0001: Arquitectura Base del Monorepo

## Estado
Aceptado - 2026-02-09

## Contexto
Se necesita una base full-stack para aprendizaje profesional con Angular + NestJS, flujos por PR pequeños, CI obligatoria y despliegue gratuito.

## Decisión 1: Estructura del repo
Opciones evaluadas:
1. `pnpm workspaces` nativo (simple, sin capa extra).
2. Orquestador adicional (Nx/Turborepo) desde el inicio.

Elección: opción 1 (`pnpm workspaces`).
Razón: menor complejidad inicial, onboarding rápido y suficiente para CI/CD básico.

## Decisión 2: Frontend
Opciones evaluadas:
1. Angular CLI standalone + signals (estándar Angular 21).
2. Arquitectura con herramientas externas desde día 1.

Elección: opción 1.
Razón: maximiza compatibilidad y reduce mantenimiento temprano.

## Decisión 3: Backend
Opciones evaluadas:
1. NestJS estándar + Jest + ESLint.
2. Framework minimalista (Fastify puro/Express puro) con más wiring manual.

Elección: opción 1.
Razón: estructura enterprise-ready con convenciones claras para módulos y pruebas.

## Decisión 4: Deploy gratuito
Opciones evaluadas:
1. Web en GitHub Pages y API en Vercel (serverless).
2. Un único proveedor para todo (más acoplamiento y/o límites gratuitos más estrictos).

Elección: opción 1.
Razón: encaja con el objetivo de costo cero y separa claramente frontend estático y backend serverless.

## Alcance inicial
- Monorepo con `apps/web`, `apps/api`, `libs/shared`.
- Calidad base: lint, test y build en CI.
- Estructura preparada para integrar Supabase (Auth/DB/RLS) y Linear en siguientes tareas.

## Consecuencias
- Menor complejidad de arranque.
- Posible incorporación futura de Nx/Turborepo si crece el número de apps/libs.
- Vercel requiere secretos de CI (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`).