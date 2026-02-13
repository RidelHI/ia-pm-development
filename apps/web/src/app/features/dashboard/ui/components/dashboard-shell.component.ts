import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore } from '../../../auth/state/auth.store';

interface DashboardNavItem {
  label: string;
  subtitle: string;
  route: string;
}

@Component({
  selector: 'app-dashboard-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <main class="min-h-screen bg-shell p-4 md:p-6">
      <div class="mx-auto grid w-full max-w-7xl gap-4 lg:grid-cols-[260px_1fr]">
        <aside class="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-900 p-5 text-slate-100 shadow-xl shadow-cyan-950/20">
          <div class="pointer-events-none absolute -right-10 top-4 h-32 w-32 rounded-full bg-cyan-300/20 blur-2xl"></div>
          <p class="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">Warehouse</p>
          <h1 class="mt-3 text-2xl font-semibold leading-tight">Dashboard</h1>
          <p class="mt-2 text-sm text-cyan-100/90">
            Panel operativo para autenticacion, inventario y flujo de trabajo diario.
          </p>

          <nav class="mt-8 space-y-2">
            @for (item of navItems; track item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-white text-slate-900 shadow"
                [routerLinkActiveOptions]="exactMatchOptions"
                #navItemState="routerLinkActive"
                class="block rounded-xl border border-white/20 px-3 py-3 transition hover:border-white/40 hover:bg-white/10"
              >
                <p
                  class="text-sm font-semibold"
                  [class.text-slate-900]="navItemState.isActive"
                  [class.text-slate-100]="!navItemState.isActive"
                >
                  {{ item.label }}
                </p>
                <p
                  class="text-xs"
                  [class.text-slate-700]="navItemState.isActive"
                  [class.text-cyan-100/85]="!navItemState.isActive"
                >
                  {{ item.subtitle }}
                </p>
              </a>
            }
          </nav>

          <section class="mt-6 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur">
            <p class="text-xs uppercase tracking-[0.18em] text-cyan-100/90">Sesion activa</p>
            <p class="mt-1 text-sm font-semibold text-white">{{ displayUsername() }}</p>
            <button
              type="button"
              (click)="logout()"
              class="mt-3 w-full rounded-lg border border-cyan-100/40 bg-white/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-white/20"
            >
              Cerrar sesión
            </button>
          </section>
        </aside>

        <section class="space-y-4">
          <header class="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Control Center
            </p>
            <h2 class="mt-1 text-2xl font-semibold text-slate-900">Gestion de inventario</h2>
            <p class="mt-1 text-sm text-slate-600">
              Administra productos, valida datos y mantiene sincronizada la operacion.
            </p>
          </header>

          <article class="rounded-3xl border border-white/60 bg-white/85 p-5 shadow-sm backdrop-blur md:p-6">
            <router-outlet />
          </article>
        </section>
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardShellComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly navItems: DashboardNavItem[] = [
    {
      label: 'Productos',
      subtitle: 'CRUD, imagen y estado de stock',
      route: '/dashboard/products',
    },
  ];
  readonly exactMatchOptions = { exact: true };
  readonly displayUsername = computed(
    () => this.authStore.username() ?? 'Usuario autenticado',
  );

  logout(): void {
    this.authStore.clearSession();
    void this.router.navigate(['/login']);
  }
}
