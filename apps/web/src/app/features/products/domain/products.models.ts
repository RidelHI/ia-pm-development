export type ProductStatus = 'active' | 'inactive';

export interface Product {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  category: string | null;
  brand: string | null;
  quantity: number;
  minimumStock: number | null;
  unitPriceCents: number;
  imageUrl: string | null;
  status: ProductStatus;
  location: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductMutationInput {
  sku: string;
  barcode?: string | null;
  name: string;
  category?: string | null;
  brand?: string | null;
  quantity: number;
  minimumStock?: number | null;
  unitPriceCents: number;
  imageUrl?: string | null;
  status: ProductStatus;
  location?: string | null;
  notes?: string | null;
}

export interface PaginatedProductsResponse {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
