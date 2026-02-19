# Runbook: GitHub Flow Professional

## Objetivo
Definir un flujo unico y simple para evitar confusiones en Git/GitHub y mantener trazabilidad completa con Issues + PR.

## Estrategia adoptada
Este repo usa `GitHub Flow` (trunk-based pragmatica), no `GitFlow` clasico.

Reglas base:
1. `main` es la rama estable y protegida.
2. Todo cambio sale desde `main` actualizada.
3. 1 issue = 1 branch = 1 PR.
4. Ramas cortas (ideal: menos de 2 dias).
5. Merge por `squash` y borrado automatico de rama al merge.
6. Releases por tags/versionado, no por ramas largas de release.

Convencion de ramas:
- `feature/<slug>`
- `fix/<slug>`
- `chore/<slug>`

## Preparacion local (una vez por repo)
```bash
git config --local pull.ff only
git config --local fetch.prune true
git config --local rerere.enabled true
```

## Flujo estandar por caso

### Caso 1: Nueva funcionalidad
```bash
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c feature/<slug>
```

Implementar cambios pequenos y commitear de forma clara:
```bash
git add .
git commit -m "feat(api): <resumen>"
git push -u origin feature/<slug>
```

Abrir PR enlazando issue:
- `Linear: <TEAM-ISSUE>` (ejemplo: `Linear: IA-17`)

### Caso 2: Bug normal (no urgente)
Mismo flujo que feature, pero usando `fix/<slug>`.

### Caso 3: Hotfix urgente en produccion
1. Crear issue de hotfix.
2. Salir desde `main` actualizada:
```bash
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c fix/<slug-hotfix>
```
3. Abrir PR pequena, validar CI y merge prioritario.
4. Verificar deploy/smoke test.

### Caso 4: Tu rama quedo atras y quieres evitar conflictos
```bash
git fetch origin
git switch <tu-rama>
git merge origin/main
```

Si hay conflictos:
1. Resolver archivos en conflicto.
2. `git add <archivo>`
3. `git commit`
4. `git push`

Nota: En este repo preferimos `merge origin/main` en ramas de trabajo para evitar reescritura de historia compartida.

### Caso 5: Conflictos detectados en PR
Aplicar el Caso 4 en la rama del PR y volver a ejecutar CI.

### Caso 6: Necesitas deshacer algo ya mergeado
No reescribir historia en `main`.
```bash
git switch main
git pull --ff-only origin main
git revert <sha>
git push origin main
```

## Reglas anti-caos
1. No push directo a `main`.
2. No mezclar multiples issues en un mismo PR.
3. No trabajar en ramas de otros autores.
4. Si una rama crece demasiado, dividir en mas issues/PR.
5. Si el contexto cambio fuerte, cerrar rama y crear una nueva desde `main`.

## Checklist rapido antes de abrir PR
1. Rama correcta (`feature/`, `fix/` o `chore/`).
2. Issue enlazada en descripcion (`Linear: IA-...`).
3. Cambios acotados al scope.
4. `pnpm lint`, `pnpm test`, `pnpm build` en verde.
