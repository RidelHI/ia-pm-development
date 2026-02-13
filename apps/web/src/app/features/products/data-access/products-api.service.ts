import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import type {
  PaginatedProductsResponse,
  Product,
  ProductMutationInput,
} from '../domain/products.models';
import {
  toPaginatedProductsResponse,
  toProduct,
  toProductMutationInputDto,
  type PaginatedProductsResponseDto,
  type ProductDto,
} from '../domain/products.mappers';

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

    return this.http
      .get<PaginatedProductsResponseDto>(`${this.baseApiUrl}/products`, {
        params,
      })
      .pipe(map((response) => toPaginatedProductsResponse(response)));
  }

  getProduct(productId: string): Observable<Product> {
    return this.http
      .get<ProductDto>(`${this.baseApiUrl}/products/${productId}`)
      .pipe(map((response) => toProduct(response)));
  }

  createProduct(input: ProductMutationInput): Observable<Product> {
    const payload = toProductMutationInputDto(input);

    return this.http
      .post<ProductDto>(`${this.baseApiUrl}/products`, payload)
      .pipe(map((response) => toProduct(response)));
  }

  updateProduct(productId: string, input: ProductMutationInput): Observable<Product> {
    const payload = toProductMutationInputDto(input);

    return this.http
      .patch<ProductDto>(`${this.baseApiUrl}/products/${productId}`, payload)
      .pipe(map((response) => toProduct(response)));
  }

  deleteProduct(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseApiUrl}/products/${productId}`);
  }
}
