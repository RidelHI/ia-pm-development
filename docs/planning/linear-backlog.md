# Backlog Inicial para Linear

## Convenciones
- Source of truth: Linear.
- Ramas: `feature/<slug>` o `fix/<slug>`.
- Cada PR debe referenciar issue de Linear.
- PR pequeño: idealmente 1 issue = 1 PR.

## Épica sugerida
- `WMS-EPIC-1` - MVP Gestión de Productos de Almacén.

## Issues sugeridos (orden recomendado)

### WMS-1 - Definición funcional del MVP
Criterios de aceptación:
- Documento de alcance y dominio en `docs/product-warehouse-mvp.md`.
- Reglas mínimas de negocio y datos de ejemplo definidos.

### WMS-2 - API base: health + integración Supabase config
Criterios de aceptación:
- Endpoint `GET /health` con estado de integración Supabase.
- Variables de entorno documentadas (`.env.example`, runbook).
- Deploy serverless en Vercel no roto.

### WMS-3 - API productos: CRUD in-memory
Criterios de aceptación:
- Endpoints CRUD de `products` disponibles.
- Validaciones mínimas de input.
- Tests unitarios en verde.

### WMS-4 - Supabase schema inicial + RLS mínima
Criterios de aceptación:
- Tabla `products` en Supabase.
- Políticas RLS básicas seguras (lectura autenticada, escritura por rol).
- Script SQL versionado en repo.

### WMS-5 - Web: listado + creación de productos
Criterios de aceptación:
- Vista de listado con filtro por texto.
- Formulario de alta conectado a API.
- Manejo de loading/error básico.

### WMS-6 - Web: detalle + edición + eliminación
Criterios de aceptación:
- Vista de detalle.
- Edición y eliminación con confirmación.
- Tests unitarios mínimos.

## Definición de Done (DoD)
- Lint, test y build en verde.
- PR con referencia a issue Linear.
- Documentación actualizada (si aplica).
- Sin scope creep respecto al issue.