# Runbook: Agent Preflight Gate

## Objetivo
Bloquear implementaciones sin trazabilidad previa (`issue -> project -> branch`) antes de escribir codigo.

## Fuente unica de reglas
Las reglas duras del flujo viven en:
- `governance/policy.json`

El comando de preflight y CI consumen este archivo para evitar drift entre docs/scripts/workflows.

## Comando obligatorio
```bash
pnpm agent:preflight -- --issue <issue_number> --agent <agent:role>
```

Roles validos:
- `agent:pm`
- `agent:backend`
- `agent:frontend`
- `agent:qa`
- `agent:release`

## Validaciones que ejecuta
1. Rama actual no es `main`.
2. Nombre de rama cumple:
   - `feature/<issue_number>-<slug>`
   - `fix/<issue_number>-<slug>`
   - `chore/<issue_number>-<slug>`
3. Working tree limpio (salvo `--allow-dirty`).
4. Issue existe y esta `OPEN`.
5. Issue tiene exactamente un `agent:*`.
6. Label `agent:*` coincide con el `--agent` indicado.
7. Issue pertenece al Project configurado.
8. Estado de card valido (`In Progress` por defecto, o `Todo` con `--allow-todo-status`).
9. Para agentes de ejecucion (`agent:backend|frontend|qa|release`):
   - `Parent PM` referencia exactamente una issue.
   - La issue padre tiene label `agent:pm`.
   - La issue padre referencia a la issue hija en su plan.
   - `Execution Order` es entero positivo.
   - `Depends on` existe (usar `none` cuando no hay bloqueos).
   - Todas las dependencias listadas estan `CLOSED`.
   - Si dependencias tienen `Execution Order`, debe ser menor al de la issue actual.

## Flags utiles
- `--allow-todo-status` (o `--AllowTodoStatus`): permite validar en `Todo` cuando el PM aun no mueve la card.
- `--allow-dirty` (o `--AllowDirty`): solo para diagnostico local; no usar para iniciar implementacion real.

## Notas de autonomia para IA
- Este gate solo fija orden, ownership y trazabilidad.
- La IA conserva libertad para analizar, planificar y decidir la logica tecnica/negocio dentro del scope de la issue.
- Antes de implementar o revisar, consultar documentacion relevante, MCP y skills del rol activo.

## Flujo recomendado
1. PM refina issue padre `agent:pm` y define subtareas ordenadas.
2. PM crea child issues con `Parent PM`, `Execution Order`, `Depends on`.
3. Agente crea rama con issue id en el nombre.
4. Agente mueve card a `In Progress`.
5. Agente ejecuta preflight.
6. Recien despues empieza implementacion.
