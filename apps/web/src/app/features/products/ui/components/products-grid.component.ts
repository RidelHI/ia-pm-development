import { CurrencyPipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewChild,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import type { Product } from '../../domain/products.models';

@Component({
  selector: 'app-products-grid',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSortModule,
    MatTableModule,
  ],
  template: `
    <section class="table-card surface-card" aria-labelledby="products-table-title">
      <header class="table-header">
        <div>
          <p class="table-eyebrow">Operaciones</p>
          <h2 id="products-table-title">Inventario de productos</h2>
        </div>

        <mat-form-field appearance="outline" class="table-filter">
          <mat-icon matPrefix aria-hidden="true">filter_alt</mat-icon>
          <input
            matInput
            [formControl]="tableFilter"
            placeholder="SKU, nombre, categoría o ubicación"
            aria-label="Filtrar tabla de productos"
            type="search"
          />
          <button
            mat-icon-button
            matSuffix
            type="button"
            aria-label="Limpiar filtro de tabla"
            [disabled]="!tableFilter.value"
            (click)="tableFilter.setValue('')"
          >
            <mat-icon aria-hidden="true">close</mat-icon>
          </button>
        </mat-form-field>
      </header>

      @if (loading()) {
        <div class="table-loading" aria-live="polite" role="status">
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          <div class="loading-rows" aria-hidden="true">
            @for (_ of skeletonRows; track $index) {
              <span></span>
            }
          </div>
        </div>
      } @else if (hasData()) {
        <div class="table-wrapper">
          <table mat-table [dataSource]="dataSource" matSort matSortDisableClear>
            <ng-container matColumnDef="sku">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>SKU</th>
              <td mat-cell *matCellDef="let product">{{ product.sku }}</td>
            </ng-container>

            <ng-container matColumnDef="product">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Producto</th>
              <td mat-cell *matCellDef="let product">
                <div class="product-cell">
                  @if (product.imageUrl) {
                    <img [src]="product.imageUrl" [alt]="'Imagen de ' + product.name" loading="lazy" />
                  } @else {
                    <div class="image-fallback" aria-hidden="true">
                      <mat-icon>image</mat-icon>
                    </div>
                  }
                  <div>
                    <p class="product-name">{{ product.name }}</p>
                    <p class="product-meta">
                      {{ product.category || 'Sin categoría' }} - {{ product.brand || 'Sin marca' }}
                    </p>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Cantidad</th>
              <td mat-cell *matCellDef="let product">
                <div class="quantity-cell">
                  <strong>{{ product.quantity }}</strong>
                  <span>
                    Min: {{ product.minimumStock === null ? 'N/D' : product.minimumStock }}
                  </span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Precio</th>
              <td mat-cell *matCellDef="let product">
                {{ product.unitPriceCents / 100 | currency: 'USD' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Estado</th>
              <td mat-cell *matCellDef="let product">
                <span class="status-pill" [class.status-pill-success]="product.status === 'active'" [class.status-pill-error]="product.status === 'inactive'">
                  {{ product.status }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-column">Acciones</th>
              <td mat-cell *matCellDef="let product" class="actions-column">
                <button
                  mat-icon-button
                  type="button"
                  [matMenuTriggerFor]="actionsMenu"
                  [attr.aria-label]="'Acciones para ' + product.name"
                >
                  <mat-icon aria-hidden="true">more_vert</mat-icon>
                </button>
                <mat-menu #actionsMenu="matMenu">
                  <button mat-menu-item type="button" (click)="viewRequested.emit(product.id)">
                    <mat-icon aria-hidden="true">visibility</mat-icon>
                    <span>Ver detalle</span>
                  </button>
                  <button mat-menu-item type="button" (click)="editRequested.emit(product.id)">
                    <mat-icon aria-hidden="true">edit</mat-icon>
                    <span>Editar</span>
                  </button>
                  <button mat-menu-item type="button" (click)="deleteRequested.emit(product.id)">
                    <mat-icon aria-hidden="true">delete</mat-icon>
                    <span>Eliminar</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>

        <mat-paginator
          [pageSize]="10"
          [pageSizeOptions]="[5, 10, 20]"
          showFirstLastButtons
          aria-label="Paginación de productos"
        ></mat-paginator>
      } @else {
        <section class="table-empty" role="status" aria-live="polite">
          <mat-icon aria-hidden="true">inventory_2</mat-icon>
          <h3>Sin resultados en esta tabla</h3>
          <p>Ajusta el filtro local o vuelve a consultar productos.</p>
        </section>
      }
    </section>
  `,
  styles: [
    `
      .table-card {
        padding: var(--space-5);
      }

      .table-header {
        display: grid;
        gap: var(--space-3);
        margin-bottom: var(--space-3);
      }

      .table-eyebrow {
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.7rem;
        font-weight: 700;
        margin-bottom: var(--space-1);
      }

      .table-header h2 {
        font-size: 1.45rem;
      }

      .table-filter {
        width: 100%;
        --mat-form-field-container-height: 40px;
        --mat-form-field-container-text-size: 0.88rem;
        --mat-form-field-container-vertical-padding: 0.35rem;
      }

      .table-wrapper {
        overflow-x: auto;
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-md);
        background: #fff;
        max-width: 100%;
      }

      table {
        width: 100%;
      }

      th.mat-mdc-header-cell {
        color: var(--text-muted);
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      td.mat-mdc-cell,
      th.mat-mdc-header-cell {
        padding-block: 0.9rem;
      }

      tr.mat-mdc-row:hover {
        background: #f5f9ff;
      }

      .product-cell {
        display: grid;
        grid-template-columns: 44px minmax(0, 1fr);
        align-items: center;
        gap: var(--space-3);
      }

      .product-cell img,
      .image-fallback {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-sm);
      }

      .product-cell img {
        object-fit: cover;
        border: 1px solid var(--border-soft);
      }

      .image-fallback {
        background: var(--state-hover);
        display: grid;
        place-items: center;
        color: var(--text-muted);
      }

      .product-name {
        margin: 0;
        font-weight: 600;
      }

      .product-meta {
        margin: 0;
        color: var(--text-muted);
        font-size: 0.82rem;
      }

      .quantity-cell {
        display: grid;
        gap: 2px;
      }

      .quantity-cell span {
        color: var(--text-muted);
        font-size: 0.82rem;
      }

      .actions-column {
        width: 64px;
        text-align: end;
      }

      .table-loading {
        display: grid;
        gap: var(--space-4);
      }

      .loading-rows {
        display: grid;
        gap: var(--space-2);
      }

      .loading-rows span {
        display: block;
        height: 52px;
        border-radius: var(--radius-sm);
        background: linear-gradient(100deg, #edf4ff 25%, #f8fbff 50%, #edf4ff 75%);
        background-size: 300% 100%;
        animation: shimmer 1.4s linear infinite;
      }

      .table-empty {
        border: 1px dashed var(--border-soft);
        border-radius: var(--radius-md);
        min-height: 180px;
        display: grid;
        place-items: center;
        gap: var(--space-2);
        text-align: center;
        color: var(--text-muted);
        padding: var(--space-4);
      }

      .table-empty h3,
      .table-empty p {
        margin: 0;
      }

      mat-paginator {
        margin-top: var(--space-3);
        border-top: 1px solid var(--border-soft);
        border-radius: var(--radius-md);
      }

      @media (max-width: 720px) {
        .table-card {
          padding: var(--space-4);
        }

        .table-header h2 {
          font-size: 1.25rem;
        }

        th.mat-mdc-header-cell,
        td.mat-mdc-cell {
          padding-inline: 0.65rem;
          padding-block: 0.7rem;
        }
      }

      @media (min-width: 860px) {
        .table-header {
          grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
          align-items: center;
        }
      }

      @keyframes shimmer {
        from {
          background-position: 100% 0;
        }

        to {
          background-position: -100% 0;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsGridComponent implements AfterViewInit {
  readonly products = input.required<Product[]>();
  readonly loading = input(false);
  readonly viewRequested = output<string>();
  readonly editRequested = output<string>();
  readonly deleteRequested = output<string>();

  readonly displayedColumns = ['sku', 'product', 'quantity', 'price', 'status', 'actions'];
  readonly tableFilter = new FormControl('', {
    nonNullable: true,
  });
  readonly dataSource = new MatTableDataSource<Product>([]);
  readonly visibleRows = signal(0);
  readonly skeletonRows = Array.from({ length: 6 }, (_, index) => index);

  @ViewChild(MatPaginator)
  private paginator?: MatPaginator;

  @ViewChild(MatSort)
  private sort?: MatSort;

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.dataSource.filterPredicate = (product, filterValue) => {
      const normalized = filterValue.trim().toLowerCase();
      const payload = [
        product.sku,
        product.name,
        product.category,
        product.brand,
        product.location,
        product.status,
      ]
        .join(' ')
        .toLowerCase();

      return payload.includes(normalized);
    };

    effect(() => {
      this.dataSource.data = this.products();
      this.syncVisibleRows();

      if (this.paginator) {
        this.paginator.firstPage();
      }
    });

    this.tableFilter.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.dataSource.filter = value.trim().toLowerCase();
        this.syncVisibleRows();

        if (this.paginator) {
          this.paginator.firstPage();
        }
      });
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }

    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  hasData(): boolean {
    return this.visibleRows() > 0;
  }

  private syncVisibleRows(): void {
    this.visibleRows.set(this.dataSource.filteredData.length);
  }
}
