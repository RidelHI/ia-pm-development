import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../../auth/state/auth.store';
import { ProductsStore } from '../../state/products.store';
import { ProductsFeedbackComponent } from '../components/products-feedback.component';
import { ProductsGridComponent } from '../components/products-grid.component';
import { ProductsSearchFormComponent } from '../components/products-search-form.component';

@Component({
  selector: 'app-products-page',
  imports: [
    ProductsSearchFormComponent,
    ProductsFeedbackComponent,
    ProductsGridComponent,
  ],
  template: `
    <main class="min-h-screen bg-shell p-6 md:p-10">
      <section class="mx-auto max-w-5xl space-y-4">
        <header class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Protected Route
            </p>
            <h1 class="text-2xl font-semibold text-slate-900">Productos</h1>
            <p class="text-sm text-slate-600">
              Integración activa con <code>GET /v1/products</code>.
            </p>
          </div>
          <button
            (click)="logout()"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            type="button"
          >
            Cerrar sesión
          </button>
        </header>

        <section class="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <app-products-search-form
            [loading]="isLoading()"
            [query]="query()"
            (queryChange)="query.set($event)"
            (searchRequested)="loadProducts()"
          />
        </section>

        <app-products-feedback
          [errorMessage]="errorMessage()"
          [isEmpty]="isEmpty()"
        />

        @if (products().length > 0) {
          <app-products-grid [products]="products()" />
        }
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly productsStore = inject(ProductsStore);

  readonly products = this.productsStore.products;
  readonly isLoading = this.productsStore.loading;
  readonly errorMessage = this.productsStore.error;
  readonly isEmpty = this.productsStore.isEmpty;
  readonly query = signal('');

  constructor() {
    this.productsStore.loadProducts(this.query());
    effect(() => {
      if (this.productsStore.errorCode() !== 401) {
        return;
      }

      this.authStore.clearSession();
      this.productsStore.clearError();
      void this.router.navigate(['/login']);
    });
  }

  loadProducts(): void {
    this.productsStore.loadProducts(this.query());
  }

  logout(): void {
    this.authStore.clearSession();
    void this.router.navigate(['/login']);
  }
}
