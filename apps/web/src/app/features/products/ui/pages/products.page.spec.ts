import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthStore } from '../../../auth/state/auth.store';
import { ProductsApiService } from '../../data-access/products-api.service';
import type { Product, ProductMutationInput } from '../../domain/products.models';
import { ProductsStore } from '../../state/products.store';
import { ProductsGridComponent } from '../components/products-grid.component';
import { ProductsPageComponent } from './products.page';

describe('ProductsPageComponent', () => {
  const baseProduct: Product = {
    id: 'prod-01',
    sku: 'SKU-01',
    barcode: '7501234567890',
    name: 'Product 01',
    category: 'Lacteos',
    brand: 'Marca Norte',
    quantity: 2,
    minimumStock: 1,
    unitPriceCents: 1500,
    imageUrl: 'https://images.example.com/product-01.jpg',
    status: 'active',
    location: 'A-01',
    notes: 'Nota',
    createdAt: '2026-02-12T00:00:00.000Z',
    updatedAt: '2026-02-12T00:00:00.000Z',
  };

  const productsSignal = signal<Product[]>([]);
  const loadingSignal = signal(false);
  const errorSignal = signal<string | null>(null);
  const errorCodeSignal = signal<number | null>(null);
  const isEmptySignal = signal(false);
  let loadProductsCalls: string[];
  let clearErrorCalls: number;
  let clearSessionCalls: number;
  let createCalls: number;
  let updateCalls: { productId: string; input: ProductMutationInput }[];
  let getProductCalls: string[];
  let deleteCalls: string[];

  const productsStoreMock = {
    products: productsSignal,
    loading: loadingSignal,
    error: errorSignal,
    errorCode: errorCodeSignal,
    isEmpty: isEmptySignal,
    loadProducts(query: string) {
      loadProductsCalls.push(query);
    },
    clearError() {
      clearErrorCalls += 1;
      errorSignal.set(null);
      errorCodeSignal.set(null);
    },
  };
  const authStoreMock = {
    clearSession() {
      clearSessionCalls += 1;
    },
  };
  const productsApiServiceMock = {
    getProduct(productId: string) {
      getProductCalls.push(productId);
      return of({
        ...baseProduct,
        id: productId,
      });
    },
    createProduct(input: ProductMutationInput) {
      void input;
      createCalls += 1;
      return of(baseProduct);
    },
    updateProduct(productId: string, input: ProductMutationInput) {
      updateCalls.push({ productId, input });
      return of(baseProduct);
    },
    deleteProduct(productId: string) {
      deleteCalls.push(productId);
      return of(void 0);
    },
  };

  beforeEach(async () => {
    loadProductsCalls = [];
    clearErrorCalls = 0;
    clearSessionCalls = 0;
    createCalls = 0;
    updateCalls = [];
    getProductCalls = [];
    deleteCalls = [];
    productsSignal.set([]);
    loadingSignal.set(false);
    errorSignal.set(null);
    errorCodeSignal.set(null);
    isEmptySignal.set(false);

    await TestBed.configureTestingModule({
      imports: [ProductsPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProductsStore,
          useValue: productsStoreMock,
        },
        {
          provide: AuthStore,
          useValue: authStoreMock,
        },
        {
          provide: ProductsApiService,
          useValue: productsApiServiceMock,
        },
      ],
    }).compileComponents();
  });

  it('loads products from store on init', async () => {
    productsSignal.set([baseProduct]);
    const fixture = TestBed.createComponent(ProductsPageComponent);

    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(loadProductsCalls).toEqual(['']);
    expect(component.products().length).toBe(1);
    expect(component.errorMessage()).toBeNull();
  });

  it('clears session and redirects when store reports 401', async () => {
    const fixture = TestBed.createComponent(ProductsPageComponent);
    const router = TestBed.inject(Router);
    const navigateCalls: unknown[] = [];
    router.navigate = ((...args: unknown[]) => {
      navigateCalls.push(args);
      return Promise.resolve(true);
    }) as Router['navigate'];

    errorCodeSignal.set(401);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(clearSessionCalls).toBe(1);
    expect(clearErrorCalls).toBe(1);
    expect(navigateCalls).toEqual([[['/login']]]);
  });

  it('loads product details when grid emits view event', async () => {
    productsSignal.set([baseProduct]);
    const fixture = TestBed.createComponent(ProductsPageComponent);

    fixture.detectChanges();
    await fixture.whenStable();

    const gridDebug = fixture.debugElement.query(By.directive(ProductsGridComponent));
    const grid = gridDebug.componentInstance as ProductsGridComponent;

    grid.viewRequested.emit('prod-01');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getProductCalls).toEqual(['prod-01']);
    expect(fixture.componentInstance.editorMode()).toBe('detail');
    expect(fixture.componentInstance.selectedProduct()?.id).toBe('prod-01');
  });

  it('creates a product and reloads listing', async () => {
    const fixture = TestBed.createComponent(ProductsPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance;
    component.startCreate();
    component.productForm.patchValue({
      sku: 'SKU-NEW-01',
      name: 'Nuevo producto',
      quantity: 4,
      unitPriceCents: 1999,
      status: 'active',
    });
    component.saveProduct(new Event('submit'));
    await fixture.whenStable();

    expect(createCalls).toBe(1);
    expect(loadProductsCalls).toEqual(['', '']);
  });

  it('deletes product when user confirms action', async () => {
    productsSignal.set([baseProduct]);
    const fixture = TestBed.createComponent(ProductsPageComponent);
    const originalConfirm = window.confirm;
    Object.defineProperty(window, 'confirm', {
      value: () => true,
      configurable: true,
    });

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.removeProduct('prod-01');
    await fixture.whenStable();

    expect(deleteCalls).toEqual(['prod-01']);

    Object.defineProperty(window, 'confirm', {
      value: originalConfirm,
      configurable: true,
    });
  });

  it('updates a product when edit form is submitted', async () => {
    productsSignal.set([baseProduct]);
    const fixture = TestBed.createComponent(ProductsPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance;
    component.startEdit('prod-01');
    await fixture.whenStable();

    component.productForm.patchValue({
      name: 'Producto actualizado',
      quantity: 9,
      unitPriceCents: 2590,
      status: 'active',
    });
    component.saveProduct(new Event('submit'));
    await fixture.whenStable();

    expect(updateCalls).toHaveLength(1);
    expect(updateCalls[0]).toEqual(
      expect.objectContaining({
        productId: 'prod-01',
      }),
    );
    expect(loadProductsCalls).toEqual(['', '']);
  });
});
