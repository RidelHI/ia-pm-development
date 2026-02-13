# Prompt Template: Code Audit

Usa esta plantilla para una auditoría técnica orientada a riesgos.

```text
Quiero una auditoría de esta PR/cambio con enfoque profesional.

Contexto:
- PR/branch: <id>
- Issue linkada: <id>
- Area: <frontend|backend|fullstack|ci>

Instrucciones:
1) Prioriza findings reales: bugs, regresiones, riesgos de seguridad, deuda crítica.
2) Ordena por severidad: alta, media, baja.
3) Incluye referencia de archivo y línea cuando aplique.
4) Diferencia entre bloqueo vs recomendación.
5) Evalúa cobertura de acceptance criteria y DoD del agente owner.
6) Evalúa si lint/test/build son evidencia suficiente.
7) Verifica consistencia del `AI Self-Review Gate` contra el código real.
8) Termina con veredicto: approve o changes requested.

Responde en español, concreto y accionable.
```
