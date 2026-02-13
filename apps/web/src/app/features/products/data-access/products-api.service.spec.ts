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
});
