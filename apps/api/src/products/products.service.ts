import {
  BadRequestException,
  Inject,
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
import {
  PRODUCTS_REPOSITORY,
  type ProductsRepository,
} from './repositories/products.repository';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCTS_REPOSITORY)
    private readonly repository: ProductsRepository,
  ) {}

  async findAll(filters: ProductFilters): Promise<Product[]> {
    return await this.repository.findAll(filters);
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.repository.findById(id);

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return product;
  }

  async create(input: CreateProductInput): Promise<Product> {
    const sanitizedInput = this.sanitizeInput(input);
    this.validateInput(sanitizedInput);

    const now = new Date().toISOString();
    const product: Product = {
      id: crypto.randomUUID(),
      sku: sanitizedInput.sku,
      name: sanitizedInput.name,
      quantity: sanitizedInput.quantity,
      unitPriceCents: sanitizedInput.unitPriceCents,
      status: sanitizedInput.status ?? 'active',
      location: sanitizedInput.location,
      createdAt: now,
      updatedAt: now,
    };

    return await this.repository.create(product);
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    if (Object.keys(input).length === 0) {
      throw new BadRequestException('At least one field is required');
    }

    const patch = this.stripUndefinedValues(this.sanitizeInput(input));

    if (Object.keys(patch).length === 0) {
      throw new BadRequestException('At least one field is required');
    }

    this.validateInput(patch);
    await this.findOne(id);

    const updated = await this.repository.update(id, patch);

    if (!updated) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    await this.findOne(id);
    await this.repository.remove(id);
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

  private stripUndefinedValues<T extends Record<string, unknown>>(value: T): T {
    const entries = Object.entries(value).filter(([, fieldValue]) => {
      return fieldValue !== undefined;
    });

    return Object.fromEntries(entries) as T;
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
