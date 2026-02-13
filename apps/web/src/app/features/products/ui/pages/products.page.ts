import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../../auth/state/auth.store';
import { ProductsApiService } from '../../data-access/products-api.service';
import type { Product } from '../../domain/products.models';

@Component({
  selector: 'app-products-page',
  imports: [FormsModule, CurrencyPipe],
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
          <form class="flex flex-wrap gap-3" (ngSubmit)="loadProducts()">
            <input
              [(ngModel)]="query"
              class="min-w-64 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring-2"
              name="query"
              placeholder="Buscar por nombre o SKU"
              type="text"
            />
            <button
              [disabled]="isLoading()"
              class="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
            >
              @if (isLoading()) { Cargando... } @else { Buscar }
            </button>
          </form>
        </section>

        @if (errorMessage()) {
          <section class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ errorMessage() }}
          </section>
        }

        @if (!isLoading() && products().length === 0 && !errorMessage()) {
          <section class="rounded-2xl border border-stone-200 bg-white px-4 py-8 text-center text-sm text-slate-600 shadow-sm">
            No hay productos para mostrar con los filtros actuales.
          </section>
        }

        @if (products().length > 0) {
          <section class="grid gap-3 md:grid-cols-2">
            @for (product of products(); track product.id) {
              <article class="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">
                  {{ product.sku }}
                </p>
                <h2 class="mt-1 text-lg font-semibold text-slate-900">{{ product.name }}</h2>
                <p class="mt-2 text-sm text-slate-600">
                  Cantidad:
                  <span class="font-semibold text-slate-800">{{ product.quantity }}</span>
                </p>
                <p class="text-sm text-slate-600">
                  Precio:
                  <span class="font-semibold text-slate-800">{{
                    product.unitPriceCents / 100 | currency: 'USD'
                  }}</span>
                </p>
                <p class="text-sm text-slate-600">
                  Estado:
                  <span class="font-semibold text-slate-800">{{ product.status }}</span>
                </p>
              </article>
            }
          </section>
        }
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly productsApiService = inject(ProductsApiService);
  private readonly productsState = signal<Product[]>([]);

  readonly products = computed(() => this.productsState());
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  query = '';

  constructor() {
    void this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await firstValueFrom(
        this.productsApiService.listProducts(this.query),
      );
      this.productsState.set(response.data);
    } catch (error) {
      this.errorMessage.set(this.resolveProductsError(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  logout(): void {
    this.authStore.clearSession();
    void this.router.navigate(['/login']);
  }

  private resolveProductsError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        this.authStore.clearSession();
        void this.router.navigate(['/login']);
        return 'Tu sesión expiró. Vuelve a iniciar sesión.';
      }

      if (error.status === 403) {
        return 'No tienes permisos para consultar productos.';
      }
    }

    return 'No se pudo cargar la lista de productos.';
  }
}
