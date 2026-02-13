import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import { ProductsApiService } from './products-api.service';

describe('ProductsApiService', () => {
  let service: ProductsApiService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: API_BASE_URL,
          useValue: 'http://localhost:3000/v1',
        },
      ],
    });

    service = TestBed.inject(ProductsApiService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('requests products with default pagination', async () => {
    const responsePromise = firstValueFrom(service.listProducts());
    const request = httpController.expectOne(
      (req) =>
        req.url === 'http://localhost:3000/v1/products' &&
        req.params.get('page') === '1' &&
        req.params.get('limit') === '20',
    );

    expect(request.request.method).toBe('GET');
    request.flush({
      data: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    });

    const response = await responsePromise;
    expect(response.data).toEqual([]);
  });

  it('includes query param when search text is provided', () => {
    service.listProducts('sku-001').subscribe();
    const request = httpController.expectOne(
      (req) =>
        req.url === 'http://localhost:3000/v1/products' &&
        req.params.get('q') === 'sku-001',
    );

    request.flush({
      data: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    });
  });

  it('maps dto payload to product model contract', async () => {
    const responsePromise = firstValueFrom(service.listProducts());
    const request = httpController.expectOne(
      (req) =>
        req.url === 'http://localhost:3000/v1/products' &&
        req.params.get('page') === '1' &&
        req.params.get('limit') === '20',
    );

    request.flush({
      data: [
        {
          id: 'prod-01',
          sku: 'SKU-01',
          barcode: '',
          name: 'Product 01',
          category: '',
          brand: null,
          quantity: 3,
          minimumStock: null,
          unitPriceCents: 1200,
          imageUrl: '',
          status: 'archived',
          location: '',
          notes: '',
          createdAt: '2026-02-13T00:00:00.000Z',
          updatedAt: '2026-02-13T00:00:00.000Z',
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });

    const response = await responsePromise;
    expect(response.data[0]?.status).toBe('inactive');
    expect(response.data[0]?.location).toBeNull();
    expect(response.data[0]?.category).toBeNull();
    expect(response.data[0]?.imageUrl).toBeNull();
  });

  it('requests a single product by id', async () => {
    const responsePromise = firstValueFrom(service.getProduct('prod-01'));
    const request = httpController.expectOne(
      (req) => req.url === 'http://localhost:3000/v1/products/prod-01',
    );

    expect(request.request.method).toBe('GET');
    request.flush({
      id: 'prod-01',
      sku: 'SKU-01',
      barcode: '7501234567890',
      name: 'Product 01',
      category: 'Lacteos',
      brand: 'Marca Norte',
      quantity: 3,
      minimumStock: 1,
      unitPriceCents: 1200,
      imageUrl: 'https://images.example.com/product.jpg',
      status: 'active',
      location: 'A-01',
      notes: 'Nota',
      createdAt: '2026-02-13T00:00:00.000Z',
      updatedAt: '2026-02-13T00:00:00.000Z',
    });

    const response = await responsePromise;
    expect(response.id).toBe('prod-01');
    expect(response.imageUrl).toBe('https://images.example.com/product.jpg');
  });

  it('creates product with normalized payload', () => {
    service
      .createProduct({
        sku: ' SKU-01 ',
        barcode: ' 7501234567890 ',
        name: ' Product 01 ',
        category: ' Lacteos ',
        brand: ' Marca Norte ',
        quantity: 3,
        minimumStock: 1,
        unitPriceCents: 1200,
        imageUrl: ' https://images.example.com/product.jpg ',
        status: 'active',
        location: ' A-01 ',
        notes: ' Nota ',
      })
      .subscribe();

    const request = httpController.expectOne(
      (req) => req.url === 'http://localhost:3000/v1/products',
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      sku: 'SKU-01',
      barcode: '7501234567890',
      name: 'Product 01',
      category: 'Lacteos',
      brand: 'Marca Norte',
      quantity: 3,
      minimumStock: 1,
      unitPriceCents: 1200,
      imageUrl: 'https://images.example.com/product.jpg',
      status: 'active',
      location: 'A-01',
      notes: 'Nota',
    });

    request.flush({
      id: 'prod-01',
      sku: 'SKU-01',
      barcode: '7501234567890',
      name: 'Product 01',
      category: 'Lacteos',
      brand: 'Marca Norte',
      quantity: 3,
      minimumStock: 1,
      unitPriceCents: 1200,
      imageUrl: 'https://images.example.com/product.jpg',
      status: 'active',
      location: 'A-01',
      notes: 'Nota',
      createdAt: '2026-02-13T00:00:00.000Z',
      updatedAt: '2026-02-13T00:00:00.000Z',
    });
  });

  it('updates a product by id', () => {
    service
      .updateProduct('prod-01', {
        sku: 'SKU-01',
        name: 'Product 01',
        quantity: 3,
        unitPriceCents: 1200,
        status: 'active',
      })
      .subscribe();

    const request = httpController.expectOne(
      (req) => req.url === 'http://localhost:3000/v1/products/prod-01',
    );

    expect(request.request.method).toBe('PATCH');
    request.flush({
      id: 'prod-01',
      sku: 'SKU-01',
      name: 'Product 01',
      quantity: 3,
      unitPriceCents: 1200,
      status: 'active',
      createdAt: '2026-02-13T00:00:00.000Z',
      updatedAt: '2026-02-13T00:00:00.000Z',
    });
  });

  it('deletes a product by id', () => {
    service.deleteProduct('prod-01').subscribe();
    const request = httpController.expectOne(
      (req) => req.url === 'http://localhost:3000/v1/products/prod-01',
    );

    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
