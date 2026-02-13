import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { AuthStore } from '../../../auth/state/auth.store';
import { ProductsStore } from '../../state/products.store';
import { ProductsSearchFormComponent } from '../components/products-search-form.component';
import { ProductsPageComponent } from './products.page';

describe('ProductsPageComponent', () => {
  const productsSignal = signal<
    {
      id: string;
      sku: string;
      name: string;
      quantity: number;
      unitPriceCents: number;
      status: 'active' | 'inactive';
      location: string | null;
      createdAt: string;
      updatedAt: string;
    }[]
  >([]);
  const loadingSignal = signal(false);
  const errorSignal = signal<string | null>(null);
  const errorCodeSignal = signal<number | null>(null);
  const isEmptySignal = signal(false);
  let loadProductsCalls: string[];
  let clearErrorCalls: number;
  let clearSessionCalls: number;

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

  beforeEach(async () => {
    loadProductsCalls = [];
    clearErrorCalls = 0;
    clearSessionCalls = 0;
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
      ],
    }).compileComponents();
  });

  it('loads products from store on init', async () => {
    productsSignal.set([
      {
        id: 'prod-01',
        sku: 'SKU-01',
        name: 'Product 01',
        quantity: 2,
        unitPriceCents: 1500,
        status: 'active',
        location: 'A-01',
        createdAt: '2026-02-12T00:00:00.000Z',
        updatedAt: '2026-02-12T00:00:00.000Z',
      },
    ]);
    isEmptySignal.set(false);
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
    isEmptySignal.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(clearSessionCalls).toBe(1);
    expect(clearErrorCalls).toBe(1);
    expect(navigateCalls).toEqual([[['/login']]]);
  });

  it('renders empty state feedback when store is empty', async () => {
    const fixture = TestBed.createComponent(ProductsPageComponent);
    productsSignal.set([]);
    errorSignal.set(null);
    isEmptySignal.set(true);

    fixture.detectChanges();
    await fixture.whenStable();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('No hay productos');
  });

  it('requests products with current query when search form emits submit', async () => {
    const fixture = TestBed.createComponent(ProductsPageComponent);

    fixture.detectChanges();
    await fixture.whenStable();

    const searchFormDebug = fixture.debugElement.query(
      By.directive(ProductsSearchFormComponent),
    );
    const searchForm = searchFormDebug.componentInstance as ProductsSearchFormComponent;

    searchForm.queryChange.emit('lllll');
    searchForm.searchRequested.emit();
    fixture.detectChanges();

    expect(loadProductsCalls).toEqual(['', 'lllll']);
  });
});
