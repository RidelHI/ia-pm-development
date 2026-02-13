import type { PaginatedProductsResponse, Product } from './products.models';

export interface ProductDto {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  status: string;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProductsResponseDto {
  data: ProductDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function mapProductStatus(value: string): Product['status'] {
  return value === 'active' ? 'active' : 'inactive';
}

export function toProduct(dto: ProductDto): Product {
  return {
    id: dto.id,
    sku: dto.sku,
    name: dto.name,
    quantity: dto.quantity,
    unitPriceCents: dto.unitPriceCents,
    status: mapProductStatus(dto.status),
    location: dto.location && dto.location.trim().length > 0 ? dto.location : null,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function toPaginatedProductsResponse(
  dto: PaginatedProductsResponseDto,
): PaginatedProductsResponse {
  return {
    data: dto.data.map((item) => toProduct(item)),
    meta: {
      page: dto.meta.page,
      limit: dto.meta.limit,
      total: dto.meta.total,
      totalPages: dto.meta.totalPages,
    },
  };
}
