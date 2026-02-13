import type { Product } from '../domain/products.models';

export interface ProductsPageState {
  products: Product[];
  loading: boolean;
  error: string | null;
  query: string;
}

export const initialProductsPageState: ProductsPageState = {
  products: [],
  loading: false,
  error: null,
  query: '',
};