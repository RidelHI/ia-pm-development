import type {
  Product,
  ProductFilters,
  UpdateProductInput,
} from '../product.types';

export const PRODUCTS_REPOSITORY = Symbol('PRODUCTS_REPOSITORY');

export interface ProductsRepository {
  findAll(filters: ProductFilters): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(product: Product): Promise<Product>;
  update(id: string, patch: UpdateProductInput): Promise<Product | null>;
  remove(id: string): Promise<boolean>;
}
