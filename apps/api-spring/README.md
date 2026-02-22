# API Spring (Parallel Migration)

Servicio Spring Boot creado para migrar `apps/api` (NestJS) de manera incremental y sin downtime.

## Objetivo

- Ejecutar NestJS y Spring Boot en paralelo.
- Validar paridad de contrato endpoint por endpoint.
- Migrar por modulos, con rollback simple hacia NestJS.

## Ejecutar local

1. Copiar variables base:
   - `cp .env.example .env.local` (Linux/macOS) o copiar manualmente en Windows.
2. Ejecutar:
   - Linux/macOS: `./mvnw spring-boot:run`
   - Windows PowerShell: `./mvnw.cmd spring-boot:run`

Por defecto queda en `http://localhost:8081/v1`.

## Endpoints base (fase 1)

- `GET /v1/health`
- `GET /v1/health/live`
- `GET /v1/version`
- `GET /v1/products`
- `GET /v1/products/{id}`
- `POST /v1/products`
- `PATCH /v1/products/{id}`
- `DELETE /v1/products/{id}`

Paridad inicial de `products` ya migrada:
- Filtros por query (`q`, `sku`, `barcode`, `name`, `category`, `brand`, `location`, `status`).
- Rangos (`quantityMin/Max`, `minimumStockMin/Max`, `unitPriceMin/Max`).
- Paginacion (`page`, `limit`) con meta (`total`, `totalPages`) equivalente al comportamiento actual de Nest.
- Flujo CRUD in-memory con mismos codigos base (`201`, `200`, `204`, `404`) para create/update/delete.

## Calidad local del servicio Spring

- Linux/macOS:
  - `./mvnw test`
  - `./mvnw package`
- Windows PowerShell:
  - `./mvnw.cmd test`
  - `./mvnw.cmd package`

## Estrategia de migracion incremental

1. Elegir un modulo en NestJS (ej. `products`).
2. Replicar contrato (request/response/codigos) en Spring.
3. Ejecutar pruebas de regresion contra ambos servicios.
4. Cambiar routing del consumidor al endpoint de Spring.
5. Repetir modulo por modulo hasta paridad total.

## Checklist de paridad por modulo

- [ ] Mismos endpoints y metodos HTTP.
- [ ] Mismos codigos de estado en casos exitosos y de error.
- [ ] Misma estructura de payload (request y response).
- [ ] Validaciones equivalentes (campos requeridos, formatos, rangos).
- [ ] Logs y observabilidad minimos equivalentes.
- [ ] Cobertura de tests para happy path y errores esperados.
