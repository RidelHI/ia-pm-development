export const PRODUCT_STATUSES = ['active', 'inactive'] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface Product {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  status: ProductStatus;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  sku: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  status?: ProductStatus;
  location?: string;
}

export interface UpdateProductInput {
  sku?: string;
  name?: string;
  quantity?: number;
  unitPriceCents?: number;
  status?: ProductStatus;
  location?: string;
}

export interface ProductFilters {
  q?: string;
  sku?: string;
  name?: string;
  location?: string;
  status?: ProductStatus;
  quantityMin?: number;
  quantityMax?: number;
  unitPriceMin?: number;
  unitPriceMax?: number;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}
