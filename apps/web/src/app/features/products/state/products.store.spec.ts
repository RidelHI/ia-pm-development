import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { ProductsApiService } from '../data-access/products-api.service';
import type { PaginatedProductsResponse } from '../domain/products.models';
import { ProductsStore } from './products.store';

type ProductsStoreInstance = InstanceType<typeof ProductsStore>;

describe('ProductsStore', () => {
  let listProductsImplementation: (
    query?: string,
  ) => Observable<PaginatedProductsResponse>;
  let listProductsQueries: string[];
  let store: ProductsStoreInstance;

  const productsApiServiceMock = {
    listProducts(query = '') {
      listProductsQueries.push(query);
      return listProductsImplementation(query);
    },
  };

  beforeEach(() => {
    listProductsQueries = [];
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

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ProductsApiService,
          useValue: productsApiServiceMock,
        },
      ],
    });

    store = TestBed.inject(ProductsStore);
  });

  it('loads products and updates state', async () => {
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

    store.loadProducts('sku-01');
    await Promise.resolve();

    expect(listProductsQueries).toEqual(['sku-01']);
    expect(store.products().length).toBe(1);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('stores error metadata on unauthorized response', async () => {
    listProductsImplementation = () =>
      throwError(() => new HttpErrorResponse({ status: 401 }));

    store.loadProducts('');
    await Promise.resolve();

    expect(store.loading()).toBe(false);
    expect(store.errorCode()).toBe(401);
    expect(store.error()).toContain('sesión expiró');
  });
});
