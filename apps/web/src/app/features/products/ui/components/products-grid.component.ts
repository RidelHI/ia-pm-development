import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Product } from '../../domain/products.models';

@Component({
  selector: 'app-products-grid',
  imports: [CurrencyPipe],
  template: `
    <section class="grid gap-3 md:grid-cols-2">
      @for (product of products(); track product.id) {
        <article class="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div class="relative aspect-[16/9] bg-slate-100">
            @if (product.imageUrl) {
              <img
                [src]="product.imageUrl"
                [alt]="'Imagen de ' + product.name"
                class="h-full w-full object-cover"
                loading="lazy"
              />
            } @else {
              <div
                class="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
              >
                Sin imagen
              </div>
            }
          </div>

          <div class="space-y-2 p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">
              {{ product.sku }}
            </p>
            <h2 class="mt-1 text-lg font-semibold text-slate-900">{{ product.name }}</h2>
            <p class="text-sm text-slate-600">
              {{ product.category || 'Sin categoría' }} · {{ product.brand || 'Sin marca' }}
            </p>
            <p class="text-sm text-slate-600">
              Cantidad:
              <span class="font-semibold text-slate-800">{{ product.quantity }}</span>
              @if (product.minimumStock !== null) {
                <span class="text-slate-500">/ mínimo {{ product.minimumStock }}</span>
              }
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
            <div class="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                class="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                (click)="viewRequested.emit(product.id)"
              >
                Ver detalle
              </button>
              <button
                type="button"
                class="rounded-lg border border-cyan-300 px-3 py-2 text-xs font-semibold text-cyan-700 hover:bg-cyan-50"
                (click)="editRequested.emit(product.id)"
              >
                Editar
              </button>
              <button
                type="button"
                class="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                (click)="deleteRequested.emit(product.id)"
              >
                Eliminar
              </button>
            </div>
          </div>
        </article>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsGridComponent {
  readonly products = input.required<Product[]>();
  readonly viewRequested = output<string>();
  readonly editRequested = output<string>();
  readonly deleteRequested = output<string>();
}
