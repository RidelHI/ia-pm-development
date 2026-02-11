import { Injectable } from '@nestjs/common';
import type {
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

  findAll(filters: ProductFilters): Promise<Product[]> {
    const products = Array.from(this.products.values());
    const normalizedQuery = filters.q?.trim().toLowerCase();
    const page = Math.max(
      filters.page ?? InMemoryProductsRepository.DEFAULT_PAGE,
      1,
    );
    const limit = Math.max(
      filters.limit ?? InMemoryProductsRepository.DEFAULT_LIMIT,
      1,
    );
    const offset = (page - 1) * limit;

    return Promise.resolve(
      products
        .filter((product) => {
          const matchesStatus = filters.status
            ? product.status === filters.status
            : true;

          const matchesQuery = normalizedQuery
            ? product.name.toLowerCase().includes(normalizedQuery) ||
              product.sku.toLowerCase().includes(normalizedQuery)
            : true;

          return matchesStatus && matchesQuery;
        })
        .slice(offset, offset + limit),
    );
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
