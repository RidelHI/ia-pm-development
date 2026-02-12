import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { AuthStore } from '../../../core/auth/auth.store';
import { ProductsApiService } from '../data/products-api.service';
import { ProductsPageComponent } from './products.page';
import type { PaginatedProductsResponse } from '../data/products.models';

describe('ProductsPageComponent', () => {
  let listProductsImplementation: (
    query?: string,
  ) => Observable<PaginatedProductsResponse>;
  let listProductsQueries: string[];
  let clearSessionCalls: number;

  const productsApiServiceMock = {
    listProducts(query = '') {
      listProductsQueries.push(query);
      return listProductsImplementation(query);
    },
  };
  const authStoreMock = {
    clearSession() {
      clearSessionCalls += 1;
    },
  };

  beforeEach(async () => {
    listProductsQueries = [];
    clearSessionCalls = 0;
    listProductsImplementation = () =>
      of({
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });
    await TestBed.configureTestingModule({
      imports: [ProductsPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProductsApiService,
          useValue: productsApiServiceMock,
        },
        {
          provide: AuthStore,
          useValue: authStoreMock,
        },
      ],
    }).compileComponents();
  });

  it('loads products from API on init', async () => {
    listProductsImplementation = () =>
      of({
        data: [
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
        ],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });
    const fixture = TestBed.createComponent(ProductsPageComponent);

    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(listProductsQueries).toEqual(['']);
    expect(component.products().length).toBe(1);
    expect(component.errorMessage()).toBeNull();
  });

  it('clears session and redirects on 401 list error', async () => {
    listProductsImplementation = () =>
      throwError(() => new HttpErrorResponse({ status: 401 }));
    const fixture = TestBed.createComponent(ProductsPageComponent);
    const router = TestBed.inject(Router);
    const navigateCalls: unknown[] = [];
    router.navigate = ((...args: unknown[]) => {
      navigateCalls.push(args);
      return Promise.resolve(true);
    }) as Router['navigate'];

    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(clearSessionCalls).toBe(1);
    expect(navigateCalls).toEqual([[['/login']]]);
    expect(component.errorMessage()).toContain('sesión expiró');
  });
});
