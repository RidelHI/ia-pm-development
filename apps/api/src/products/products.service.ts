import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateProductInput,
  Product,
  ProductFilters,
  ProductStatus,
  UpdateProductInput,
} from './product.types';

@Injectable()
export class ProductsService {
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

  findAll(filters: ProductFilters): Product[] {
    const products = Array.from(this.products.values());
    const normalizedQuery = filters.q?.trim().toLowerCase();

    return products.filter((product) => {
      const matchesStatus = filters.status
        ? product.status === filters.status
        : true;

      const matchesQuery = normalizedQuery
        ? product.name.toLowerCase().includes(normalizedQuery) ||
          product.sku.toLowerCase().includes(normalizedQuery)
        : true;

      return matchesStatus && matchesQuery;
    });
  }

  findOne(id: string): Product {
    const product = this.products.get(id);

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return product;
  }

  create(input: CreateProductInput): Product {
    this.validateInput(input);

    const now = new Date().toISOString();
    const product: Product = {
      id: crypto.randomUUID(),
      sku: input.sku.trim(),
      name: input.name.trim(),
      quantity: input.quantity,
      unitPriceCents: input.unitPriceCents,
      status: input.status ?? 'active',
      location: input.location?.trim(),
      createdAt: now,
      updatedAt: now,
    };

    this.products.set(product.id, product);
    return product;
  }

  update(id: string, input: UpdateProductInput): Product {
    const current = this.findOne(id);

    if (Object.keys(input).length === 0) {
      throw new BadRequestException('At least one field is required');
    }

    this.validateInput(input);

    const updated: Product = {
      ...current,
      ...this.sanitizeInput(input),
      updatedAt: new Date().toISOString(),
    };

    this.products.set(id, updated);
    return updated;
  }

  remove(id: string): { deleted: true; id: string } {
    this.findOne(id);
    this.products.delete(id);
    return { deleted: true, id };
  }

  private sanitizeInput(input: UpdateProductInput): UpdateProductInput;
  private sanitizeInput(input: CreateProductInput): CreateProductInput;
  private sanitizeInput(
    input: UpdateProductInput | CreateProductInput,
  ): UpdateProductInput | CreateProductInput {
    return {
      ...input,
      sku: typeof input.sku === 'string' ? input.sku.trim() : input.sku,
      name: typeof input.name === 'string' ? input.name.trim() : input.name,
      location:
        typeof input.location === 'string'
          ? input.location.trim()
          : input.location,
    };
  }

  private validateInput(input: UpdateProductInput | CreateProductInput): void {
    if (input.sku !== undefined && input.sku.trim().length < 3) {
      throw new BadRequestException('sku must have at least 3 characters');
    }

    if (input.name !== undefined && input.name.trim().length < 3) {
      throw new BadRequestException('name must have at least 3 characters');
    }

    if (
      input.quantity !== undefined &&
      (!Number.isInteger(input.quantity) || input.quantity < 0)
    ) {
      throw new BadRequestException('quantity must be a positive integer');
    }

    if (
      input.unitPriceCents !== undefined &&
      (!Number.isInteger(input.unitPriceCents) || input.unitPriceCents < 0)
    ) {
      throw new BadRequestException(
        'unitPriceCents must be a positive integer',
      );
    }

    if (input.status !== undefined && !this.isValidStatus(input.status)) {
      throw new BadRequestException('status must be active or inactive');
    }
  }

  private isValidStatus(status: string): status is ProductStatus {
    return status === 'active' || status === 'inactive';
  }
}
