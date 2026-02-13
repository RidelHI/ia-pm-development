# Runbook: Agent Preflight Gate

## Objetivo
Bloquear implementaciones sin trazabilidad previa (`issue -> project -> branch`) antes de escribir codigo.

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

## Flags utiles
- `--AllowTodoStatus`: permite validar en `Todo` cuando el PM aun no mueve la card.
- `--AllowDirty`: solo para diagnostico local; no usar para iniciar implementacion real.

## Flujo recomendado
1. PM refina issue y la mueve a `Todo`.
2. Agente crea rama con issue id en el nombre.
3. Agente mueve card a `In Progress`.
4. Agente ejecuta preflight.
5. Recien despues empieza implementacion.
