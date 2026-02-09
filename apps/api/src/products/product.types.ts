export type ProductStatus = 'active' | 'inactive';

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
  status?: ProductStatus;
}
