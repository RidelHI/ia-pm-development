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
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
    ReactiveFormsModule,
    ProductsSearchFormComponent,
    ProductsFeedbackComponent,
    ProductsGridComponent,
  ],
  template: `
    <section class="space-y-4">
      <header class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Inventario</p>
          <h1 class="text-2xl font-semibold text-slate-900">Productos</h1>
          <p class="text-sm text-slate-600">CRUD completo, imagen y metadatos de almacen.</p>
        </div>
        <button
          (click)="startCreate()"
          class="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
          type="button"
        >
          Nuevo producto
        </button>
      </header>

      <section class="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
        <app-products-search-form
          [loading]="isLoading()"
          [query]="query()"
          (queryChange)="query.set($event)"
          (searchRequested)="loadProducts()"
        />
      </section>

      <app-products-feedback [errorMessage]="errorMessage()" [isEmpty]="isEmpty()" />

      @if (actionErrorMessage()) {
        <section
          aria-live="assertive"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          role="alert"
        >
          {{ actionErrorMessage() }}
        </section>
      }

      @if (actionSuccessMessage()) {
        <section
          aria-live="polite"
          class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          role="status"
        >
          {{ actionSuccessMessage() }}
        </section>
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
        <section class="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm md:p-5">
          <header class="mb-4 flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">{{ editorTitle() }}</h2>
              <p class="text-sm text-slate-600">{{ editorDescription() }}</p>
            </div>
            <button
              type="button"
              (click)="closeEditor()"
              class="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cerrar
            </button>
          </header>

          @if (isDetailMode()) {
            @if (detailLoading()) {
              <p class="text-sm text-slate-600">Cargando detalle...</p>
            } @else if (selectedProduct()) {
              <article class="space-y-4">
                <div class="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  @if (selectedProduct()?.imageUrl) {
                    <img
                      [src]="selectedProduct()?.imageUrl ?? ''"
                      [alt]="'Imagen de ' + (selectedProduct()?.name ?? 'producto')"
                      class="h-64 w-full object-cover"
                    />
                  } @else {
                    <div
                      class="flex h-64 items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                    >
                      Sin imagen
                    </div>
                  }
                </div>
                <div class="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                  <p><strong>SKU:</strong> {{ selectedProduct()?.sku }}</p>
                  <p>
                    <strong>Codigo de barras:</strong>
                    {{ selectedProduct()?.barcode || 'No definido' }}
                  </p>
                  <p><strong>Nombre:</strong> {{ selectedProduct()?.name }}</p>
                  <p>
                    <strong>Categoria:</strong> {{ selectedProduct()?.category || 'Sin categoria' }}
                  </p>
                  <p><strong>Marca:</strong> {{ selectedProduct()?.brand || 'Sin marca' }}</p>
                  <p><strong>Cantidad:</strong> {{ selectedProduct()?.quantity }}</p>
                  <p>
                    <strong>Stock minimo:</strong>
                    {{ selectedProduct()?.minimumStock ?? 'No definido' }}
                  </p>
                  <p><strong>Precio (centavos):</strong> {{ selectedProduct()?.unitPriceCents }}</p>
                  <p><strong>Estado:</strong> {{ selectedProduct()?.status }}</p>
                  <p>
                    <strong>Ubicacion:</strong> {{ selectedProduct()?.location || 'No definida' }}
                  </p>
                  <p class="md:col-span-2">
                    <strong>Notas:</strong> {{ selectedProduct()?.notes || 'Sin notas' }}
                  </p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="rounded-lg border border-cyan-300 px-3 py-2 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-50"
                    (click)="startEdit(selectedProduct()?.id ?? '')"
                  >
                    Editar producto
                  </button>
                </div>
              </article>
            }
          } @else {
            <form
              class="grid gap-3 md:grid-cols-2"
              [formGroup]="productForm"
              (submit)="saveProduct($event)"
              novalidate
            >
              <label class="space-y-1">
                <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">SKU *</span>
                <input
                  class="w-full rounded-lg border border-slate-300 bg-slate-50/70 px-3 py-2 text-sm outline-none ring-cyan-400 transition focus:border-cyan-400 focus:bg-white focus:ring-2"
                  formControlName="sku"
                  placeholder="SKU-APPLE-001"
                  type="text"
                />
              </label>

              <label class="space-y-1">
                <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                  Codigo de barras
                </span>
                <input
                  class="w-full rounded-lg border border-slate-300 bg-slate-50/70 px-3 py-2 text-sm outline-none ring-cyan-400 transition focus:border-cyan-400 focus:bg-white focus:ring-2"
                  formControlName="barcode"
                  placeholder="7501234567890"
                  type="text"
                />
              </label>

              <label class="space-y-1 md:col-span-2">
                <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Nombre *</span>
                <input
                  class="w-full rounded-lg border border-slate-300 bg-slate-50/70 px-3 py-2 text-sm outline-none ring-cyan-400 transition focus:border-cyan-400 focus:bg-white focus:ring-2"
                  formControlName="name"
                  placeholder="Apple Box"
                  type="text"
                />
              </label>

              <label class="space-y-1">
                <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Categoria</span>
                <input
                  class="w-full rounded-lg border border-slate-300 bg-slate-50/70 px-3 py-2 text-sm outline-none ring-cyan-400 transition focus:border-cyan-400 focus:bg-white focus:ring-2"
                  formControlName="category"
                  placeholder="Frutas"
                  type="text"
                />
              </label>

              <label class="space-y-1">
                <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Marca</span>
                <input
                  class="w-full rounded-lg border border-slate-300 bg-slate-50/70 px-3 py-2 text-sm outline-none ring-cyan-400 transition focus:border-cyan-400 focus:bg-white focus:ring-2"
                  formControlName="brand"
                  placeholder="Fresh Farm"
                  type="text"
                />
              </label>

              <label class="space-y-1">
                <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Cantidad *</span>
                <input
                  class="w-full rounded-lg border border-slate-300 bg-slate-50/70 px-3 py-2 text-sm outline-none ring-cyan-400 transition focus:border-cyan-400 focus:bg-white focus:ring-2"
                  formControlName="quantity"
                  min="0"
                  type="number"
                />
              </label>

              <label class="space-y-1">
                <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Stock minimo</span>
                <input
                  class="w-full rounded-lg border border-slate-300 bg-slate-50/70 px-3 py-2 text-sm outline-none ring-cyan-400 transition focus:border-cyan-400 focus:bg-white focus:ring-2"
                  formControlName="minimumStock"
                  min="0"
                  type="number"
                />
              </label>

              <label class="space-y-1">
                <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                  Precio (centavos) *
                </span>
                <input
                  class="w-full rounded-lg border border-slate-300 bg-slate-50/70 px-3 py-2 text-sm outline-none ring-cyan-400 transition focus:border-cyan-400 focus:bg-white focus:ring-2"
                  formControlName="unitPriceCents"
                  min="0"
                  type="number"
                />
              </label>

              <label class="space-y-1">
                <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Estado *</span>
                <select
                  class="w-full rounded-lg border border-slate-300 bg-slate-50/70 px-3 py-2 text-sm outline-none ring-cyan-400 transition focus:border-cyan-400 focus:bg-white focus:ring-2"
                  formControlName="status"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </label>

              <label class="space-y-1 md:col-span-2">
                <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Ubicacion</span>
                <input
                  class="w-full rounded-lg border border-slate-300 bg-slate-50/70 px-3 py-2 text-sm outline-none ring-cyan-400 transition focus:border-cyan-400 focus:bg-white focus:ring-2"
                  formControlName="location"
                  placeholder="A-01"
                  type="text"
                />
              </label>

              <label class="space-y-1 md:col-span-2">
                <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">URL de imagen</span>
                <input
                  class="w-full rounded-lg border border-slate-300 bg-slate-50/70 px-3 py-2 text-sm outline-none ring-cyan-400 transition focus:border-cyan-400 focus:bg-white focus:ring-2"
                  formControlName="imageUrl"
                  placeholder="https://... o data:image/..."
                  type="text"
                />
              </label>

              <div class="space-y-2 md:col-span-2">
                <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                  Cargar imagen
                </p>
                <p class="text-xs text-slate-500">
                  Formatos soportados: imagen desde tu equipo (max. 5 MB) o URL externa.
                </p>
                <input
                  (change)="onImageFileSelected($event)"
                  accept="image/*"
                  class="block w-full rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-3 py-2 text-sm text-slate-700"
                  type="file"
                />
                @if (productForm.controls.imageUrl.value) {
                  <div class="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <img
                      [src]="productForm.controls.imageUrl.value"
                      alt="Vista previa de imagen"
                      class="h-48 w-full object-cover"
                    />
                  </div>
                }
              </div>

              <label class="space-y-1 md:col-span-2">
                <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Notas</span>
                <textarea
                  class="w-full rounded-lg border border-slate-300 bg-slate-50/70 px-3 py-2 text-sm outline-none ring-cyan-400 transition focus:border-cyan-400 focus:bg-white focus:ring-2"
                  formControlName="notes"
                  maxlength="500"
                  rows="3"
                ></textarea>
              </label>

              @if (formErrorMessage()) {
                <p class="md:col-span-2 text-sm text-rose-700">{{ formErrorMessage() }}</p>
              }

              <div class="flex flex-wrap gap-2 md:col-span-2">
                <button
                  [disabled]="actionLoading()"
                  [attr.aria-busy]="actionLoading()"
                  class="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                >
                  @if (actionLoading()) {
                    Guardando...
                  } @else {
                    {{ submitButtonLabel() }}
                  }
                </button>
                <button
                  type="button"
                  (click)="closeEditor()"
                  class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancelar
                </button>
              </div>
            </form>
          }
        </section>
      }
    </section>
  `,
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
