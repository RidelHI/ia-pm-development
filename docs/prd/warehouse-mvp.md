# Warehouse Product Manager - PRD MVP

## Metadata
- Status: Active
- Last updated: 2026-02-16
- Product stage: MVP

## 1) Problema que resolvemos
Pequeños almacenes suelen llevar inventario en hojas sueltas o chats, lo que provoca errores de stock, precios desactualizados y baja trazabilidad.

## 2) Objetivo del MVP (aprendizaje)
Construir una app full-stack profesional, simple y útil para gestionar productos de almacén con CRUD real y flujo de trabajo por issues/PR/CI/CD.

## 3) Alcance funcional inicial
- Alta de productos.
- Listado y búsqueda básica por nombre/SKU.
- Vista de detalle por producto.
- Edición de datos clave.
- Eliminación lógica o física (en MVP iniciaremos con eliminación física controlada).
- Estado del producto (`active`/`inactive`).

## 4) Entidades de dominio (MVP)

### Product
- `id`: identificador único.
- `sku`: código interno de almacén.
- `name`: nombre comercial.
- `quantity`: cantidad disponible.
- `unitPriceCents`: precio unitario en centavos.
- `status`: `active | inactive`.
- `location`: ubicación simple en almacén (opcional).
- `createdAt`: fecha de creación.
- `updatedAt`: fecha de última actualización.

### User (fase siguiente, vía Supabase Auth)
- `id`
- `email`
- `role` (`admin`, `operator`)

## 5) Reglas de negocio simplificadas
- `sku` único y con longitud mínima.
- `name` obligatorio con longitud mínima.
- `quantity` entero mayor o igual a 0.
- `unitPriceCents` entero mayor o igual a 0.
- Solo productos `active` se muestran por defecto en vistas operativas (fase web).

## 6) Datos ejemplo (seed)
- `SKU-APPLE-001`, `Apple Box`, `quantity: 40`, `unitPriceCents: 599`.
- `SKU-MILK-002`, `Milk Pack`, `quantity: 12`, `unitPriceCents: 249`.

## 7) Endpoints objetivo (MVP)
- `GET /v1/products`
- `GET /v1/products/:id`
- `POST /v1/products`
- `PATCH /v1/products/:id`
- `DELETE /v1/products/:id`
- `GET /v1/health/live`

## 8) Fuera de alcance por ahora
- Movimientos de inventario complejos (kardex completo).
- Proveedores, compras y ventas.
- Multi-almacén.
- Reportería avanzada.

## 9) Criterios de éxito del MVP
- API con CRUD funcional y tests verdes.
- Web consumiendo API con flujo CRUD básico.
- CI obligatoria en PR.
- Deploy operativo en GitHub Pages (web) y Render (api).
