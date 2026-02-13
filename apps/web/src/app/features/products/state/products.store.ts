import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { ProductsApiService } from '../data-access/products-api.service';
import { initialProductsState, type ProductsState } from './products-page.state';

function resolveProductsErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401) {
      return 'Tu sesión expiró. Vuelve a iniciar sesión.';
    }

    if (error.status === 403) {
      return 'No tienes permisos para consultar productos.';
    }
  }

  return 'No se pudo cargar la lista de productos.';
}

function resolveProductsErrorCode(error: unknown): number | null {
  if (error instanceof HttpErrorResponse) {
    return error.status;
  }

  return null;
}

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withState<ProductsState>(initialProductsState),
  withComputed(({ products, loading }) => ({
    isEmpty: computed(() => !loading() && products().length === 0),
  })),
  withMethods((store, productsApiService = inject(ProductsApiService)) => ({
    loadProducts: rxMethod<string>(
      pipe(
        tap((query) => {
          patchState(store, {
            query,
            loading: true,
            error: null,
            errorCode: null,
          });
        }),
        switchMap((query) =>
          productsApiService.listProducts(query).pipe(
            tapResponse({
              next: (response) => {
                patchState(store, {
                  products: response.data,
                });
              },
              error: (error) => {
                patchState(store, {
                  error: resolveProductsErrorMessage(error),
                  errorCode: resolveProductsErrorCode(error),
                });
              },
              finalize: () => {
                patchState(store, {
                  loading: false,
                });
              },
            }),
          ),
        ),
      ),
    ),
    clearError(): void {
      patchState(store, {
        error: null,
        errorCode: null,
      });
    },
  })),
);
