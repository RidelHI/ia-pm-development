import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Product } from '../../domain/products.models';

@Component({
  selector: 'app-products-grid',
  imports: [CurrencyPipe],
  template: `
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsGridComponent {
  readonly products = input.required<Product[]>();
}
