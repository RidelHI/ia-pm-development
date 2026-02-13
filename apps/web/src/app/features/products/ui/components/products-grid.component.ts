import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import type { Product } from '../../domain/products.models';

@Component({
  selector: 'app-products-grid',
  imports: [CurrencyPipe, MatButtonModule, MatCardModule, MatChipsModule],
  template: `
    <section class="products-grid">
      @for (product of products(); track product.id) {
        <article>
          <mat-card class="product-card" appearance="outlined">
            <div class="product-image-shell">
              @if (product.imageUrl) {
                <img
                  [src]="product.imageUrl"
                  [alt]="'Imagen de ' + product.name"
                  loading="lazy"
                />
              } @else {
                <div class="image-placeholder">Sin imagen</div>
              }
            </div>

            <mat-card-content>
              <p class="sku">{{ product.sku }}</p>
              <h2>{{ product.name }}</h2>
              <p class="metadata">{{ product.category || 'Sin categoría' }} · {{ product.brand || 'Sin marca' }}</p>

              <div class="stats-row">
                <span>Cantidad <strong>{{ product.quantity }}</strong></span>
                @if (product.minimumStock !== null) {
                  <span>Mínimo <strong>{{ product.minimumStock }}</strong></span>
                }
              </div>

              <div class="stats-row">
                <span>Precio <strong>{{ product.unitPriceCents / 100 | currency: 'USD' }}</strong></span>
                <mat-chip-set>
                  <mat-chip [class]="statusChipClass(product)">
                    {{ product.status }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-stroked-button type="button" (click)="viewRequested.emit(product.id)">
                Ver detalle
              </button>
              <button mat-stroked-button color="primary" type="button" (click)="editRequested.emit(product.id)">
                Editar
              </button>
              <button mat-stroked-button color="warn" type="button" (click)="deleteRequested.emit(product.id)">
                Eliminar
              </button>
            </mat-card-actions>
          </mat-card>
        </article>
      }
    </section>
  `,
  styles: [
    `
      .products-grid {
        display: grid;
        gap: 1rem;
      }

      .product-card {
        border-color: color-mix(in srgb, var(--border-soft) 75%, white);
        background: var(--panel-background);
        overflow: hidden;
      }

      .product-image-shell {
        aspect-ratio: 16 / 9;
        background: #e7edf8;
      }

      .product-image-shell img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .image-placeholder {
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
        text-transform: uppercase;
        letter-spacing: 0.17em;
        font-size: 0.74rem;
        color: #55607a;
        font-weight: 700;
      }

      mat-card-content {
        padding-top: 1rem;
        display: grid;
        gap: 0.45rem;
      }

      .sku {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        font-size: 0.7rem;
        color: #005eb8;
        font-weight: 700;
      }

      h2 {
        margin: 0;
        font-size: 1.1rem;
      }

      .metadata {
        margin: 0;
        color: var(--text-muted);
      }

      .stats-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.8rem;
        color: #435066;
      }

      .stats-row strong {
        color: var(--text-primary);
      }

      mat-chip {
        text-transform: uppercase;
        font-size: 0.7rem;
      }

      .status-chip-active {
        background: #d5f3e0;
        color: #0f6b3d;
      }

      .status-chip-inactive {
        background: #fde8e8;
        color: #9f1f1f;
      }

      mat-card-actions {
        padding: 0.6rem 1rem 1rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      @media (min-width: 860px) {
        .products-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsGridComponent {
  readonly products = input.required<Product[]>();
  readonly viewRequested = output<string>();
  readonly editRequested = output<string>();
  readonly deleteRequested = output<string>();

  statusChipClass(product: Product): string {
    return product.status === 'active' ? 'status-chip-active' : 'status-chip-inactive';
  }
}
