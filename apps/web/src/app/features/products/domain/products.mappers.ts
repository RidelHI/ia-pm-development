import type {
  PaginatedProductsResponse,
  Product,
  ProductMutationInput,
} from './products.models';

export interface ProductDto {
  id: string;
  sku: string;
  barcode?: string | null;
  name: string;
  category?: string | null;
  brand?: string | null;
  quantity: number;
  minimumStock?: number | null;
  unitPriceCents: number;
  imageUrl?: string | null;
  status: string;
  location: string | null;
  notes?: string | null;
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

function normalizeOptionalString(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function toProduct(dto: ProductDto): Product {
  return {
    id: dto.id,
    sku: dto.sku,
    barcode: normalizeOptionalString(dto.barcode),
    name: dto.name,
    category: normalizeOptionalString(dto.category),
    brand: normalizeOptionalString(dto.brand),
    quantity: dto.quantity,
    minimumStock:
      typeof dto.minimumStock === 'number' ? dto.minimumStock : null,
    unitPriceCents: dto.unitPriceCents,
    imageUrl: normalizeOptionalString(dto.imageUrl),
    status: mapProductStatus(dto.status),
    location: normalizeOptionalString(dto.location),
    notes: normalizeOptionalString(dto.notes),
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

export interface ProductMutationInputDto {
  sku: string;
  barcode?: string;
  name: string;
  category?: string;
  brand?: string;
  quantity: number;
  minimumStock?: number;
  unitPriceCents: number;
  imageUrl?: string;
  status: Product['status'];
  location?: string;
  notes?: string;
}

export function toProductMutationInputDto(
  input: ProductMutationInput,
): ProductMutationInputDto {
  const payload: ProductMutationInputDto = {
    sku: input.sku.trim(),
    name: input.name.trim(),
    quantity: input.quantity,
    unitPriceCents: input.unitPriceCents,
    status: input.status,
  };

  const barcode = normalizeOptionalString(input.barcode);
  const category = normalizeOptionalString(input.category);
  const brand = normalizeOptionalString(input.brand);
  const imageUrl = normalizeOptionalString(input.imageUrl);
  const location = normalizeOptionalString(input.location);
  const notes = normalizeOptionalString(input.notes);

  if (barcode) {
    payload.barcode = barcode;
  }

  if (category) {
    payload.category = category;
  }

  if (brand) {
    payload.brand = brand;
  }

  if (typeof input.minimumStock === 'number') {
    payload.minimumStock = input.minimumStock;
  }

  if (imageUrl) {
    payload.imageUrl = imageUrl;
  }

  if (location) {
    payload.location = location;
  }

  if (notes) {
    payload.notes = notes;
  }

  return payload;
}
