export interface Product {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  status: 'active' | 'inactive';
  location: string | null;
  createdAt: string;
  updatedAt: string;
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
