# Prompt Template: Frontend Audit (Angular + Signals)

Use this template for risk-focused audits of Angular frontend PRs.

```text
Quiero una auditoria tecnica de esta PR frontend Angular.

Contexto:
- PR: <id>
- Issue: <id>
- Feature: <name>
- Stack: Angular 21 + @ngrx/signals

Instrucciones:
1) Prioriza hallazgos reales por severidad:
   - Alta: bugs, regresiones funcionales, riesgo de seguridad, accesibilidad critica
   - Media: deuda que impacta mantenibilidad o testabilidad
   - Baja: mejoras de claridad y consistencia
2) Verifica arquitectura por capas:
   - ui no consume API directo
   - estado centralizado en signal store
   - DTO/modelo separados
3) Verifica UX states:
   - loading, empty, error, success
4) Verifica calidad Angular:
   - control flow nativo
   - signals/computed
   - OnPush en componentes
   - tipado estricto y sin any
5) Verifica cobertura de pruebas y evidencia de:
   - pnpm lint
   - pnpm test
   - pnpm build
6) Cierra con veredicto:
   - approved
   - changes requested

Salida:
- Lista de findings con archivo y linea.
- Riesgos residuales.
- Gap entre acceptance criteria e implementacion.
```
