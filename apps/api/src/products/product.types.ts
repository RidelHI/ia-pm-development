export const PRODUCT_STATUSES = ['active', 'inactive'] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  category?: string;
  brand?: string;
  quantity: number;
  minimumStock?: number;
  unitPriceCents: number;
  imageUrl?: string;
  status: ProductStatus;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  sku: string;
  barcode?: string;
  name: string;
  category?: string;
  brand?: string;
  quantity: number;
  minimumStock?: number;
  unitPriceCents: number;
  imageUrl?: string;
  status?: ProductStatus;
  location?: string;
  notes?: string;
}

export interface UpdateProductInput {
  sku?: string;
  barcode?: string;
  name?: string;
  category?: string;
  brand?: string;
  quantity?: number;
  minimumStock?: number;
  unitPriceCents?: number;
  imageUrl?: string;
  status?: ProductStatus;
  location?: string;
  notes?: string;
}

export interface ProductFilters {
  q?: string;
  sku?: string;
  barcode?: string;
  name?: string;
  category?: string;
  brand?: string;
  location?: string;
  status?: ProductStatus;
  quantityMin?: number;
  quantityMax?: number;
  minimumStockMin?: number;
  minimumStockMax?: number;
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
