# Prompt Template: Refactor

Usa esta plantilla para refactorizar sin romper comportamiento.

```text
Necesito un plan de refactor para <modulo/archivo> sin cambiar comportamiento funcional.

Contexto:
- Stack: Angular 21 + NestJS 11
- Area: <frontend|backend|shared>
- Restricciones: mantener API pública / no cambiar contrato / PR pequeña

Entrega requerida:
1) Diagnóstico de problemas actuales (acoplamiento, complejidad, duplicación).
2) Objetivo del refactor y criterios de éxito.
3) Plan incremental en pasos pequeños con rollback fácil.
4) Riesgos por paso.
5) Pruebas necesarias para asegurar no regresión.
6) Señales de stop (cuándo pausar y re-planificar).
7) Checklist de cierre con `AI Self-Review Gate` (`docs/ai/checklists/ai-self-review-gate.md`).

No implementes todo de golpe; propone secuencia segura y verificable.
```
