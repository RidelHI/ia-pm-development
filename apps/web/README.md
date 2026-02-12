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
- `features/auth/pages/`
  - `login.page.ts`, `register.page.ts`.
- `features/products/pages/`
  - `products.page.ts` protegida por guard.

## Routing

- Público: `/login`, `/register`
- Privado: `/products` (`canActivate: [authGuard]`)

## Estilos

- Tailwind CSS habilitado con `@tailwindcss/postcss`.
- Entrada global en `src/styles.scss` con variables y utilidades base (`bg-shell`).
