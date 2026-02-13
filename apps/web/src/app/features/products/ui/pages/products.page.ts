import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CurrencyPipe } from '@angular/common';
import { finalize } from 'rxjs';
import { AuthStore } from '../../../auth/state/auth.store';
import { ProductsApiService } from '../../data-access/products-api.service';
import type { Product, ProductMutationInput, ProductStatus } from '../../domain/products.models';
import { ProductsStore } from '../../state/products.store';
import { ProductsFeedbackComponent } from '../components/products-feedback.component';
import { ProductsGridComponent } from '../components/products-grid.component';
import { ProductsSearchFormComponent } from '../components/products-search-form.component';

type EditorMode = 'create' | 'edit' | 'detail' | null;
const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_DATA_URL_LENGTH = 8_000_000;

@Component({
  selector: 'app-products-page',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    ProductsSearchFormComponent,
    ProductsFeedbackComponent,
    ProductsGridComponent,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatToolbarModule,
  ],
  template: `
    <main class="dashboard-page">
      <mat-toolbar class="dashboard-toolbar">
        <span class="toolbar-title">Warehouse Command Center</span>
        <span class="toolbar-spacer"></span>
        <button mat-stroked-button color="primary" type="button" (click)="startCreate()">
          Nuevo producto
        </button>
        <button mat-stroked-button type="button" (click)="logout()">Cerrar sesión</button>
      </mat-toolbar>

      <section class="dashboard-content">
        <section class="kpi-grid">
          <mat-card appearance="outlined" class="kpi-card">
            <p class="kpi-label">Productos visibles</p>
            <p class="kpi-value">{{ products().length }}</p>
          </mat-card>

          <mat-card appearance="outlined" class="kpi-card">
            <p class="kpi-label">Stock bajo</p>
            <p class="kpi-value">{{ lowStockCount() }}</p>
          </mat-card>

          <mat-card appearance="outlined" class="kpi-card">
            <p class="kpi-label">Valor inventario</p>
            <p class="kpi-value">{{ totalInventoryValueCents() / 100 | currency: 'USD' }}</p>
          </mat-card>
        </section>

        <mat-card appearance="outlined" class="panel-card">
          <mat-card-header>
            <mat-card-title>Buscar y filtrar</mat-card-title>
            <mat-card-subtitle>
              Consulta por nombre o SKU y recarga resultados del inventario.
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <app-products-search-form
              [loading]="isLoading()"
              [query]="query()"
              (queryChange)="query.set($event)"
              (searchRequested)="loadProducts()"
            />
          </mat-card-content>
        </mat-card>

        <app-products-feedback [errorMessage]="errorMessage()" [isEmpty]="isEmpty()" />

        @if (actionErrorMessage()) {
          <mat-card appearance="outlined" class="status-card status-card-error" role="alert" aria-live="assertive">
            <p>{{ actionErrorMessage() }}</p>
          </mat-card>
        }

        @if (actionSuccessMessage()) {
          <mat-card appearance="outlined" class="status-card status-card-success" role="status" aria-live="polite">
            <p>{{ actionSuccessMessage() }}</p>
          </mat-card>
        }

        @if (products().length > 0) {
          <app-products-grid
            [products]="products()"
            (viewRequested)="showDetails($event)"
            (editRequested)="startEdit($event)"
            (deleteRequested)="removeProduct($event)"
          />
        }

        @if (editorMode()) {
          <mat-card appearance="outlined" class="editor-card">
            <mat-card-header>
              <mat-card-title>{{ editorTitle() }}</mat-card-title>
              <mat-card-subtitle>{{ editorDescription() }}</mat-card-subtitle>
              <span class="toolbar-spacer"></span>
              <button mat-stroked-button type="button" (click)="closeEditor()">Cerrar</button>
            </mat-card-header>

            <mat-divider></mat-divider>

            <mat-card-content>
              @if (isDetailMode()) {
                @if (detailLoading()) {
                  <div class="loading-detail">
                    <mat-progress-spinner diameter="28" mode="indeterminate"></mat-progress-spinner>
                    <span>Cargando detalle...</span>
                  </div>
                } @else if (selectedProduct()) {
                  <article class="detail-layout">
                    <div class="detail-image">
                      @if (selectedProduct()?.imageUrl) {
                        <img
                          [src]="selectedProduct()?.imageUrl ?? ''"
                          [alt]="'Imagen de ' + (selectedProduct()?.name ?? 'producto')"
                        />
                      } @else {
                        <div class="detail-image-placeholder">Sin imagen</div>
                      }
                    </div>

                    <div class="detail-data-grid">
                      <p><strong>SKU:</strong> {{ selectedProduct()?.sku }}</p>
                      <p><strong>Código de barras:</strong> {{ selectedProduct()?.barcode || 'No definido' }}</p>
                      <p><strong>Nombre:</strong> {{ selectedProduct()?.name }}</p>
                      <p><strong>Categoría:</strong> {{ selectedProduct()?.category || 'Sin categoría' }}</p>
                      <p><strong>Marca:</strong> {{ selectedProduct()?.brand || 'Sin marca' }}</p>
                      <p><strong>Cantidad:</strong> {{ selectedProduct()?.quantity }}</p>
                      <p><strong>Stock mínimo:</strong> {{ selectedProduct()?.minimumStock ?? 'No definido' }}</p>
                      <p><strong>Precio (centavos):</strong> {{ selectedProduct()?.unitPriceCents }}</p>
                      <p>
                        <strong>Estado:</strong>
                        <mat-chip-set>
                          <mat-chip [class]="selectedProduct()?.status === 'active' ? 'status-chip-active' : 'status-chip-inactive'">
                            {{ selectedProduct()?.status }}
                          </mat-chip>
                        </mat-chip-set>
                      </p>
                      <p><strong>Ubicación:</strong> {{ selectedProduct()?.location || 'No definida' }}</p>
                      <p class="full-row"><strong>Notas:</strong> {{ selectedProduct()?.notes || 'Sin notas' }}</p>
                    </div>

                    <div>
                      <button
                        mat-stroked-button
                        color="primary"
                        type="button"
                        (click)="startEdit(selectedProduct()?.id ?? '')"
                      >
                        Editar producto
                      </button>
                    </div>
                  </article>
                }
              } @else {
                <form class="editor-form" [formGroup]="productForm" (ngSubmit)="saveProduct($event)" novalidate>
                  <mat-form-field appearance="outline">
                    <mat-label>SKU *</mat-label>
                    <input matInput formControlName="sku" placeholder="SKU-APPLE-001" type="text" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Código de barras</mat-label>
                    <input matInput formControlName="barcode" placeholder="7501234567890" type="text" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="field-span-2">
                    <mat-label>Nombre *</mat-label>
                    <input matInput formControlName="name" placeholder="Apple Box" type="text" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Categoría</mat-label>
                    <input matInput formControlName="category" placeholder="Frutas" type="text" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Marca</mat-label>
                    <input matInput formControlName="brand" placeholder="Fresh Farm" type="text" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Cantidad *</mat-label>
                    <input matInput formControlName="quantity" min="0" type="number" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Stock mínimo</mat-label>
                    <input matInput formControlName="minimumStock" min="0" type="number" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Precio (centavos) *</mat-label>
                    <input matInput formControlName="unitPriceCents" min="0" type="number" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Estado *</mat-label>
                    <mat-select formControlName="status">
                      <mat-option value="active">active</mat-option>
                      <mat-option value="inactive">inactive</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="field-span-2">
                    <mat-label>Ubicación</mat-label>
                    <input matInput formControlName="location" placeholder="A-01" type="text" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="field-span-2">
                    <mat-label>URL de imagen</mat-label>
                    <input
                      matInput
                      formControlName="imageUrl"
                      placeholder="https://... o data:image/..."
                      type="text"
                    />
                  </mat-form-field>

                  <section class="upload-panel field-span-2">
                    <p class="upload-title">Cargar imagen</p>
                    <p class="upload-copy">
                      Formatos soportados: imagen desde tu equipo (máx. 5 MB) o URL externa.
                    </p>
                    <input (change)="onImageFileSelected($event)" accept="image/*" type="file" />

                    @if (productForm.controls.imageUrl.value) {
                      <div class="upload-preview">
                        <img [src]="productForm.controls.imageUrl.value" alt="Vista previa de imagen" />
                      </div>
                    }
                  </section>

                  <mat-form-field appearance="outline" class="field-span-2">
                    <mat-label>Notas</mat-label>
                    <textarea matInput formControlName="notes" maxlength="500" rows="3"></textarea>
                  </mat-form-field>

                  @if (formErrorMessage()) {
                    <p class="form-error field-span-2">{{ formErrorMessage() }}</p>
                  }

                  <div class="actions-row field-span-2">
                    <button
                      mat-flat-button
                      color="primary"
                      [disabled]="actionLoading()"
                      [attr.aria-busy]="actionLoading()"
                      type="submit"
                    >
                      @if (actionLoading()) {
                        <mat-progress-spinner diameter="18" mode="indeterminate" class="button-spinner"></mat-progress-spinner>
                        Guardando...
                      } @else {
                        {{ submitButtonLabel() }}
                      }
                    </button>
                    <button mat-stroked-button type="button" (click)="closeEditor()">Cancelar</button>
                  </div>
                </form>
              }
            </mat-card-content>
          </mat-card>
        }
      </section>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .dashboard-page {
        min-height: 100vh;
      }

      .dashboard-toolbar {
        position: sticky;
        top: 0;
        z-index: 20;
        background: color-mix(in srgb, #10294a 82%, #1f5994 18%);
        color: #eaf4ff;
        border-bottom: 1px solid #2f4f74;
        gap: 0.6rem;
      }

      .toolbar-title {
        letter-spacing: 0.04em;
        font-size: 1rem;
        font-weight: 700;
      }

      .toolbar-spacer {
        flex: 1;
      }

      .dashboard-content {
        width: min(1160px, 100%);
        margin: 0 auto;
        padding: clamp(0.8rem, 2.5vw, 1.8rem);
        display: grid;
        gap: 1rem;
      }

      .kpi-grid {
        display: grid;
        gap: 0.8rem;
      }

      .kpi-card,
      .panel-card,
      .editor-card,
      .status-card {
        border-color: color-mix(in srgb, var(--border-soft) 75%, white);
        background: var(--panel-background);
        backdrop-filter: blur(8px);
      }

      .kpi-label {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        font-size: 0.72rem;
        color: #4a6082;
        font-weight: 700;
      }

      .kpi-value {
        margin: 0.5rem 0 0;
        font-size: clamp(1.35rem, 3vw, 1.8rem);
        font-weight: 700;
      }

      .status-card p {
        margin: 0;
      }

      .status-card-error {
        border-color: #f2b0b0;
        color: var(--status-error);
        background: #fff4f4;
      }

      .status-card-success {
        border-color: #8fd3a8;
        color: var(--status-success);
        background: #ecf8f0;
      }

      .editor-card mat-card-content {
        padding-top: 1rem;
      }

      .loading-detail {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: var(--text-muted);
      }

      .detail-layout {
        display: grid;
        gap: 1rem;
      }

      .detail-image {
        overflow: hidden;
        border-radius: 14px;
        border: 1px solid color-mix(in srgb, var(--border-soft) 80%, white);
        background: #edf2fa;
      }

      .detail-image img {
        width: 100%;
        height: 100%;
        max-height: 340px;
        object-fit: cover;
      }

      .detail-image-placeholder {
        min-height: 220px;
        display: grid;
        place-items: center;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 0.75rem;
        color: #56637a;
        font-weight: 700;
      }

      .detail-data-grid {
        display: grid;
        gap: 0.7rem;
      }

      .detail-data-grid p {
        margin: 0;
        color: #435066;
      }

      .detail-data-grid strong {
        color: var(--text-primary);
      }

      .full-row {
        grid-column: 1 / -1;
      }

      .status-chip-active {
        background: #d5f3e0;
        color: #0f6b3d;
      }

      .status-chip-inactive {
        background: #fde8e8;
        color: #9f1f1f;
      }

      .editor-form {
        display: grid;
        gap: 0.55rem;
      }

      .upload-panel {
        border: 1px dashed color-mix(in srgb, var(--border-soft) 85%, white);
        border-radius: 12px;
        padding: 0.8rem;
        background: #f8fbff;
      }

      .upload-title {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.74rem;
        font-weight: 700;
        color: #425877;
      }

      .upload-copy {
        margin: 0.4rem 0 0.75rem;
        color: var(--text-muted);
        font-size: 0.86rem;
      }

      .upload-preview {
        margin-top: 0.8rem;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid color-mix(in srgb, var(--border-soft) 80%, white);
      }

      .upload-preview img {
        width: 100%;
        max-height: 240px;
        object-fit: cover;
      }

      .form-error {
        margin: 0;
        color: var(--status-error);
        font-size: 0.9rem;
      }

      .actions-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
      }

      .button-spinner {
        --mdc-circular-progress-active-indicator-color: currentColor;
      }

      @media (min-width: 760px) {
        .kpi-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .editor-form,
        .detail-data-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .field-span-2,
        .full-row {
          grid-column: span 2;
        }
      }

      @media (min-width: 980px) {
        .detail-layout {
          grid-template-columns: minmax(280px, 380px) minmax(0, 1fr);
          align-items: start;
        }

        .detail-layout > :last-child {
          grid-column: 2;
        }
      }

      @media (max-width: 640px) {
        .dashboard-toolbar {
          flex-wrap: wrap;
          height: auto;
          padding-block: 0.6rem;
        }

        .toolbar-spacer {
          display: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly productsStore = inject(ProductsStore);
  private readonly productsApiService = inject(ProductsApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = this.productsStore.products;
  readonly isLoading = this.productsStore.loading;
  readonly errorMessage = this.productsStore.error;
  readonly isEmpty = this.productsStore.isEmpty;
  readonly query = signal('');
  readonly editorMode = signal<EditorMode>(null);
  readonly detailLoading = signal(false);
  readonly selectedProduct = signal<Product | null>(null);
  readonly actionLoading = signal(false);
  readonly actionErrorMessage = signal<string | null>(null);
  readonly actionSuccessMessage = signal<string | null>(null);
  readonly formErrorMessage = signal<string | null>(null);

  readonly isDetailMode = computed(() => this.editorMode() === 'detail');
  readonly lowStockCount = computed(() =>
    this.products().filter(
      (product) => product.minimumStock !== null && product.quantity <= product.minimumStock,
    ).length,
  );
  readonly totalInventoryValueCents = computed(() =>
    this.products().reduce(
      (total, product) => total + product.unitPriceCents * product.quantity,
      0,
    ),
  );
  readonly editorTitle = computed(() => {
    if (this.editorMode() === 'create') {
      return 'Crear producto';
    }

    if (this.editorMode() === 'edit') {
      return 'Editar producto';
    }

    return 'Detalle de producto';
  });

  readonly editorDescription = computed(() => {
    if (this.editorMode() === 'create') {
      return 'Completa los campos principales del inventario.';
    }

    if (this.editorMode() === 'edit') {
      return 'Actualiza información y guarda los cambios.';
    }

    return 'Vista detallada con metadatos de almacén.';
  });

  readonly submitButtonLabel = computed(() =>
    this.editorMode() === 'edit' ? 'Guardar cambios' : 'Crear producto',
  );

  readonly productForm = new FormGroup({
    sku: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(64)],
    }),
    barcode: new FormControl('', {
      nonNullable: true,
      validators: [Validators.minLength(3), Validators.maxLength(64)],
    }),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(120)],
    }),
    category: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(80)],
    }),
    brand: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(80)],
    }),
    quantity: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    minimumStock: new FormControl<number | null>(null, {
      validators: [Validators.min(0)],
    }),
    unitPriceCents: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    status: new FormControl<ProductStatus>('active', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    location: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(64)],
    }),
    imageUrl: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.maxLength(MAX_IMAGE_DATA_URL_LENGTH),
        Validators.pattern(/^$|^(https?:\/\/|data:image\/).*/i),
      ],
    }),
    notes: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
  });

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

  startCreate(): void {
    this.actionErrorMessage.set(null);
    this.actionSuccessMessage.set(null);
    this.formErrorMessage.set(null);
    this.selectedProduct.set(null);
    this.editorMode.set('create');
    this.resetProductForm();
  }

  showDetails(productId: string): void {
    if (!productId) {
      return;
    }

    this.actionErrorMessage.set(null);
    this.actionSuccessMessage.set(null);
    this.editorMode.set('detail');
    this.loadSelectedProduct(productId);
  }

  startEdit(productId: string): void {
    if (!productId) {
      return;
    }

    this.actionErrorMessage.set(null);
    this.actionSuccessMessage.set(null);
    this.formErrorMessage.set(null);
    this.editorMode.set('edit');
    this.loadSelectedProduct(productId, true);
  }

  closeEditor(): void {
    this.editorMode.set(null);
    this.selectedProduct.set(null);
    this.detailLoading.set(false);
    this.formErrorMessage.set(null);
  }

  saveProduct(event: Event): void {
    event.preventDefault();
    this.formErrorMessage.set(null);
    this.actionErrorMessage.set(null);
    this.actionSuccessMessage.set(null);

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.formErrorMessage.set(this.resolveProductFormErrorMessage());
      return;
    }

    const payload = this.toMutationInput();

    if (!payload) {
      this.formErrorMessage.set('No se pudo construir el payload del producto.');
      return;
    }

    if (this.editorMode() === 'create') {
      this.actionLoading.set(true);
      this.productsApiService
        .createProduct(payload)
        .pipe(
          finalize(() => {
            this.actionLoading.set(false);
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: (created) => {
            this.actionSuccessMessage.set(`Producto ${created.sku} creado correctamente.`);
            this.closeEditor();
            this.productsStore.loadProducts(this.query());
          },
          error: (error) => {
            if (this.handleUnauthorizedError(error)) {
              return;
            }

            this.actionErrorMessage.set(
              this.resolveActionErrorMessage(error, 'No se pudo crear el producto.'),
            );
          },
        });

      return;
    }

    if (this.editorMode() !== 'edit') {
      return;
    }

    const productId = this.selectedProduct()?.id;

    if (!productId) {
      this.actionErrorMessage.set('No se encontró el producto para editar.');
      return;
    }

    this.actionLoading.set(true);
    this.productsApiService
      .updateProduct(productId, payload)
      .pipe(
        finalize(() => {
          this.actionLoading.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updated) => {
          this.selectedProduct.set(updated);
          this.actionSuccessMessage.set(`Producto ${updated.sku} actualizado correctamente.`);
          this.closeEditor();
          this.productsStore.loadProducts(this.query());
        },
        error: (error) => {
          if (this.handleUnauthorizedError(error)) {
            return;
          }

          this.actionErrorMessage.set(
            this.resolveActionErrorMessage(error, 'No se pudo actualizar el producto.'),
          );
        },
      });
  }

  removeProduct(productId: string): void {
    const selected = this.products().find((product) => product.id === productId);
    const reference = selected?.name ?? selected?.sku ?? productId;
    const confirmed = window.confirm(`¿Eliminar ${reference}? Esta acción no se puede deshacer.`);

    if (!confirmed) {
      return;
    }

    this.actionLoading.set(true);
    this.actionErrorMessage.set(null);
    this.actionSuccessMessage.set(null);
    this.productsApiService
      .deleteProduct(productId)
      .pipe(
        finalize(() => {
          this.actionLoading.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.actionSuccessMessage.set('Producto eliminado correctamente.');
          if (this.selectedProduct()?.id === productId) {
            this.closeEditor();
          }
          this.productsStore.loadProducts(this.query());
        },
        error: (error) => {
          if (this.handleUnauthorizedError(error)) {
            return;
          }

          this.actionErrorMessage.set(
            this.resolveActionErrorMessage(error, 'No se pudo eliminar el producto.'),
          );
        },
      });
  }

  onImageFileSelected(event: Event): void {
    this.formErrorMessage.set(null);

    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const [file] = target.files ?? [];

    if (!file) {
      return;
    }

    if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
      this.productForm.controls.imageUrl.setValue('');
      this.productForm.controls.imageUrl.markAsTouched();
      this.formErrorMessage.set(
        'La imagen es demasiado grande. Usa una imagen menor a 5 MB o una URL externa.',
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.productForm.controls.imageUrl.setValue(reader.result);
      }
    };

    reader.readAsDataURL(file);
  }

  loadProducts(): void {
    this.productsStore.loadProducts(this.query());
  }

  logout(): void {
    this.authStore.clearSession();
    void this.router.navigate(['/login']);
  }

  private loadSelectedProduct(productId: string, patchForm = false): void {
    this.detailLoading.set(true);
    this.selectedProduct.set(null);

    this.productsApiService
      .getProduct(productId)
      .pipe(
        finalize(() => {
          this.detailLoading.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (product) => {
          this.selectedProduct.set(product);

          if (patchForm) {
            this.patchFormFromProduct(product);
          }
        },
        error: (error) => {
          if (this.handleUnauthorizedError(error)) {
            return;
          }

          this.actionErrorMessage.set(
            this.resolveActionErrorMessage(error, 'No se pudo cargar el detalle del producto.'),
          );
        },
      });
  }

  private patchFormFromProduct(product: Product): void {
    this.productForm.setValue({
      sku: product.sku,
      barcode: product.barcode ?? '',
      name: product.name,
      category: product.category ?? '',
      brand: product.brand ?? '',
      quantity: product.quantity,
      minimumStock: product.minimumStock,
      unitPriceCents: product.unitPriceCents,
      status: product.status,
      location: product.location ?? '',
      imageUrl: product.imageUrl ?? '',
      notes: product.notes ?? '',
    });
  }

  private resetProductForm(): void {
    this.productForm.setValue({
      sku: '',
      barcode: '',
      name: '',
      category: '',
      brand: '',
      quantity: 0,
      minimumStock: null,
      unitPriceCents: 0,
      status: 'active',
      location: '',
      imageUrl: '',
      notes: '',
    });

    this.productForm.markAsPristine();
    this.productForm.markAsUntouched();
  }

  private toMutationInput(): ProductMutationInput | null {
    const raw = this.productForm.getRawValue();

    if (typeof raw.quantity !== 'number' || typeof raw.unitPriceCents !== 'number') {
      return null;
    }

    return {
      sku: raw.sku,
      barcode: raw.barcode,
      name: raw.name,
      category: raw.category,
      brand: raw.brand,
      quantity: raw.quantity,
      minimumStock: raw.minimumStock,
      unitPriceCents: raw.unitPriceCents,
      imageUrl: raw.imageUrl,
      status: raw.status,
      location: raw.location,
      notes: raw.notes,
    };
  }

  private resolveProductFormErrorMessage(): string {
    const imageControl = this.productForm.controls.imageUrl;

    if (imageControl.hasError('maxlength')) {
      return 'La imagen es demasiado grande. Usa una imagen menor a 5 MB o una URL externa.';
    }

    if (imageControl.hasError('pattern')) {
      return 'La imagen debe ser una URL http(s) válida o una imagen cargada desde archivo.';
    }

    return 'Completa correctamente los campos obligatorios.';
  }

  private resolveActionErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return fallback;
    }

    if (error.status === 403) {
      return 'No tienes permisos para realizar esta acción.';
    }

    if (error.status === 404) {
      return 'Producto no encontrado.';
    }

    if (error.status === 400) {
      return 'Datos inválidos. Revisa los campos del formulario.';
    }

    if (error.status === 409) {
      return 'Ya existe un producto con ese SKU o código de barras.';
    }

    return fallback;
  }

  private handleUnauthorizedError(error: unknown): boolean {
    if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
      return false;
    }

    this.authStore.clearSession();
    this.productsStore.clearError();
    void this.router.navigate(['/login']);
    return true;
  }
}
