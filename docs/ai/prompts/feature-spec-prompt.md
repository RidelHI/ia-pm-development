# Prompt Template: Feature Spec

Usa esta plantilla para refinar una feature antes de implementarla.

```text
Contexto:
- Repo: ia-pm-development (Angular 21 + NestJS 11)
- Issue/Feature: <titulo o issue>
- Rol owner: <agent:backend|agent:frontend|agent:pm|agent:qa|agent:release>

Necesito que generes una especificación ejecutable con:
1) Objetivo de negocio en 1-2 frases.
2) Scope (in-scope / out-of-scope).
3) Acceptance criteria medibles.
4) Impacto técnico por capa (web/api/db/ci-docs).
5) Plan de implementación por pasos pequeños.
6) Riesgos y mitigaciones.
7) Plan de pruebas mínimo (unit/integration/e2e si aplica).
8) Definition of done.

Responde en español y alineado al modelo agent-first del repo.
```
