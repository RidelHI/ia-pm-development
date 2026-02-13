import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import type { PaginatedProductsResponse } from '../domain/products.models';

@Injectable({
  providedIn: 'root',
})
export class ProductsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseApiUrl = inject(API_BASE_URL);

  listProducts(query?: string): Observable<PaginatedProductsResponse> {
    let params = new HttpParams().set('page', '1').set('limit', '20');

    if (query?.trim()) {
      params = params.set('q', query.trim());
    }

    return this.http.get<PaginatedProductsResponse>(
      `${this.baseApiUrl}/products`,
      {
        params,
      },
    );
  }
}
