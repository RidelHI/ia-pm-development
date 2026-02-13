# Prompt Template: Frontend Refactor (Angular + Signals)

Use this template for safe Angular refactors without functional regression.

```text
Necesito un refactor incremental en frontend Angular sin cambiar el comportamiento observable.

Contexto:
- Issue: <issue_number>
- Area: <feature/path>
- Restriccion principal: no romper flujo auth/products actual
- Arquitectura objetivo: feature-first + @ngrx/signals

Entrega requerida:
1) Diagnostico actual:
   - acoplamientos entre ui/state/data-access
   - deuda de tipado, estado y testing
2) Objetivo de refactor y criterios de salida.
3) Plan por pasos pequenos con rollback facil.
4) Cambios por capa (domain, data-access, state, ui).
5) Riesgos y mitigaciones por paso.
6) Pruebas de no-regresion necesarias.
7) Evidencia final:
   - pnpm lint
   - pnpm test
   - pnpm build
8) Cierre obligatorio con `AI Self-Review Gate`:
   - docs/ai/checklists/ai-self-review-gate.md

Reglas:
- Mantener 1 issue = 1 branch = 1 PR.
- No introducir nuevas features fuera del scope.
- Incluir referencias de archivos y lineas clave.
```
