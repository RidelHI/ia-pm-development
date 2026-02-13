import type { Product } from '../domain/products.models';

export interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  errorCode: number | null;
  query: string;
}

export const initialProductsState: ProductsState = {
  products: [],
  loading: false,
  error: null,
  errorCode: null,
  query: '',
};
