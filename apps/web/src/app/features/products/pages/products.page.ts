import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth.store';

interface ProductPreview {
  id: string;
  sku: string;
  name: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-products-page',
  template: `
    <main class="min-h-screen bg-shell p-6 md:p-10">
      <section class="mx-auto max-w-5xl space-y-4">
        <header class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Protected Route
            </p>
            <h1 class="text-2xl font-semibold text-slate-900">Productos</h1>
            <p class="text-sm text-slate-600">Acceso habilitado para token válido.</p>
          </div>
          <button
            (click)="logout()"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            type="button"
          >
            Cerrar sesión
          </button>
        </header>

        <section class="grid gap-3 md:grid-cols-2">
          @for (product of products(); track product.id) {
            <article class="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">
                {{ product.sku }}
              </p>
              <h2 class="mt-1 text-lg font-semibold text-slate-900">{{ product.name }}</h2>
              <p class="mt-2 text-sm text-slate-600">
                Estado:
                <span class="font-semibold text-slate-800">{{ product.status }}</span>
              </p>
            </article>
          }
        </section>
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly fallbackProducts = signal<ProductPreview[]>([
    {
      id: 'preview-1',
      sku: 'SKU-PREVIEW-001',
      name: 'Producto de ejemplo',
      status: 'active',
    },
  ]);

  readonly products = computed(() => this.fallbackProducts());

  logout(): void {
    this.authStore.clearSession();
    void this.router.navigate(['/login']);
  }
}
