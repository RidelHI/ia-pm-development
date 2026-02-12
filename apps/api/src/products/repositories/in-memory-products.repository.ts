import { Injectable } from '@nestjs/common';
import type {
  PaginatedResult,
  Product,
  ProductFilters,
  UpdateProductInput,
} from '../product.types';
import type { ProductsRepository } from './products.repository';

@Injectable()
export class InMemoryProductsRepository implements ProductsRepository {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 20;

  private readonly products = new Map<string, Product>();

  constructor() {
    const seedData: Product[] = [
      {
        id: 'prod-001',
        sku: 'SKU-APPLE-001',
        name: 'Apple Box',
        quantity: 40,
        unitPriceCents: 599,
        status: 'active',
        location: 'A-01',
        createdAt: new Date('2026-02-01T10:00:00.000Z').toISOString(),
        updatedAt: new Date('2026-02-01T10:00:00.000Z').toISOString(),
      },
      {
        id: 'prod-002',
        sku: 'SKU-MILK-002',
        name: 'Milk Pack',
        quantity: 12,
        unitPriceCents: 249,
        status: 'active',
        location: 'B-03',
        createdAt: new Date('2026-02-02T10:00:00.000Z').toISOString(),
        updatedAt: new Date('2026-02-02T10:00:00.000Z').toISOString(),
      },
    ];

    for (const product of seedData) {
      this.products.set(product.id, product);
    }
  }

  findAll(filters: ProductFilters): Promise<PaginatedResult<Product>> {
    const products = Array.from(this.products.values());
    const normalizedQuery = filters.q?.trim().toLowerCase();
    const normalizedSku = filters.sku?.trim().toLowerCase();
    const normalizedName = filters.name?.trim().toLowerCase();
    const normalizedLocation = filters.location?.trim().toLowerCase();
    const page = Math.max(
      filters.page ?? InMemoryProductsRepository.DEFAULT_PAGE,
      1,
    );
    const limit = Math.max(
      filters.limit ?? InMemoryProductsRepository.DEFAULT_LIMIT,
      1,
    );
    const offset = (page - 1) * limit;

    const filtered = products.filter((product) => {
      const matchesStatus = filters.status
        ? product.status === filters.status
        : true;

      const matchesQuery = normalizedQuery
        ? product.name.toLowerCase().includes(normalizedQuery) ||
          product.sku.toLowerCase().includes(normalizedQuery)
        : true;

      const matchesSku = normalizedSku
        ? product.sku.toLowerCase().includes(normalizedSku)
        : true;
      const matchesName = normalizedName
        ? product.name.toLowerCase().includes(normalizedName)
        : true;
      const matchesLocation = normalizedLocation
        ? (product.location ?? '').toLowerCase().includes(normalizedLocation)
        : true;
      const matchesQuantityMin =
        filters.quantityMin !== undefined
          ? product.quantity >= filters.quantityMin
          : true;
      const matchesQuantityMax =
        filters.quantityMax !== undefined
          ? product.quantity <= filters.quantityMax
          : true;
      const matchesPriceMin =
        filters.unitPriceMin !== undefined
          ? product.unitPriceCents >= filters.unitPriceMin
          : true;
      const matchesPriceMax =
        filters.unitPriceMax !== undefined
          ? product.unitPriceCents <= filters.unitPriceMax
          : true;

      return (
        matchesStatus &&
        matchesQuery &&
        matchesSku &&
        matchesName &&
        matchesLocation &&
        matchesQuantityMin &&
        matchesQuantityMax &&
        matchesPriceMin &&
        matchesPriceMax
      );
    });
    const total = filtered.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return Promise.resolve({
      data: filtered.slice(offset, offset + limit),
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }

  findById(id: string): Promise<Product | null> {
    return Promise.resolve(this.products.get(id) ?? null);
  }

  create(product: Product): Promise<Product> {
    this.products.set(product.id, product);
    return Promise.resolve(product);
  }

  update(id: string, patch: UpdateProductInput): Promise<Product | null> {
    const current = this.products.get(id);

    if (!current) {
      return Promise.resolve(null);
    }

    const updated: Product = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    this.products.set(id, updated);
    return Promise.resolve(updated);
  }

  remove(id: string): Promise<boolean> {
    return Promise.resolve(this.products.delete(id));
  }
}
