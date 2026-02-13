# Web App (Angular 21)

## Arquitectura FE-03

Estructura base feature-first en `apps/web/src/app`:

- `core/auth/`
  - `auth.store.ts`: estado de sesión con `signals` + persistencia en `localStorage`.
  - `auth-api.service.ts`: contrato HTTP tipado para `register` y `login`.
- `core/http/`
  - `auth.interceptor.ts`: agrega `Authorization: Bearer <token>` cuando existe sesión.
- `core/guards/`
  - `auth.guard.ts`: guard funcional para rutas privadas.
  - `guest.guard.ts`: redirecciona usuarios autenticados fuera de login/register.
- `features/auth/pages/`
  - `login.page.ts`, `register.page.ts`.
- `features/products/pages/`
  - `products.page.ts` protegida por guard.
- `features/products/data/`
  - `products-api.service.ts`: integración tipada de `GET /v1/products`.

## Routing

- Público: `/login`, `/register`
- Privado: `/products` (`canActivate: [authGuard]`)

## Estilos

- Angular Material 21 habilitado con tema global en `src/styles.scss`.
- Tokens visuales y layout del dashboard definidos con SCSS + componentes Material standalone.
- Animaciones activadas con `provideAnimationsAsync()` en `app.config.ts`.

## Runtime API config

- El frontend resuelve la base API desde `window.__APP_CONFIG__.apiBaseUrl` (archivo `public/env.js`).
- Fallback local: `http://localhost:3000/v1`.
- En GitHub Pages, el workflow escribe `env.js` usando la variable `WEB_API_BASE_URL`.
