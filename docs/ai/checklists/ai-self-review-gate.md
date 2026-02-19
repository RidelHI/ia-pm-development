# AI Self-Review Gate (Angular way / NestJS way)

## Objetivo
Agregar una verificacion final obligatoria antes de cerrar una implementacion para confirmar que la solucion sigue el framework correcto (`Angular way` o `NestJS way`) y las reglas del proyecto.

## Cuando aplicar este gate
Aplicar siempre en el ultimo paso tecnico, antes de abrir PR o de mover la issue a `In Review`.

## Seleccion de framework
- Marca `Angular way` si hubo cambios en `apps/web` o en docs/arquitectura frontend.
- Marca `NestJS way` si hubo cambios en `apps/api` o en contratos backend.
- Si hubo cambios en ambos, ejecutar y evidenciar ambos checklists.

## Checklist global (siempre)
- [ ] Scope implementado coincide con criterios de aceptacion de la issue.
- [ ] Se mantiene `1 issue = 1 branch = 1 PR`.
- [ ] PR incluye `Linear: <TEAM-ISSUE>` (ejemplo: `Linear: IA-17`).
- [ ] PR incluye `Agent Owner: agent:<role>`.
- [ ] PR incluye `Notion: <url>`.
- [ ] Se ejecutaron y pasaron:
  - `pnpm lint`
  - `pnpm test`
  - `pnpm build`
- [ ] Riesgos residuales y limitaciones quedaron documentados.

## Checklist Angular way
- [ ] Arquitectura feature-first respetada (`domain`, `data-access`, `state`, `ui`).
- [ ] Limites de capas respetados (`ui -> state -> data-access`).
- [ ] Estado de feature estandarizado con `@ngrx/signals`.
- [ ] Componentes mantienen enfoque presentacional o contenedor sin acoplamientos indebidos.
- [ ] Templates usan control flow nativo (`@if`, `@for`, `@switch`) cuando aplica.
- [ ] Estados UX cubiertos (loading, empty, error, success).
- [ ] Accesibilidad base validada (focus, labels, feedback de error, contraste AA).

## Checklist NestJS way
- [ ] Separacion clara por capas (controller/service/repository o equivalente).
- [ ] DTOs y validaciones consistentes (pipes, class-validator, contrato de entrada/salida).
- [ ] Manejo de errores y codigos HTTP consistente.
- [ ] Autenticacion/autorizacion revisada (guards, roles, claims) cuando aplica.
- [ ] No se filtran detalles de infraestructura en contratos publicos.
- [ ] Tests actualizados para caminos felices y de error.

## Evidencia obligatoria en PR
Completar seccion `AI Self-Review Gate` del PR template:
- Framework aplicable marcado (`Angular way` y/o `NestJS way`).
- Decision final:
  - `Compliant`: cumple framework + reglas de proyecto.
  - `Needs Changes`: requiere ajustes antes de merge.
- Notas cortas con criterios revisados y riesgos residuales.
