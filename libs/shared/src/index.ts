export type ProductStatus = 'active' | 'inactive';

export interface Product {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  query?: string;
  status?: ProductStatus;
}