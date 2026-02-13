import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateProductInput,
  PaginatedResult,
  Product,
  ProductFilters,
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

  async findAll(filters: ProductFilters): Promise<PaginatedResult<Product>> {
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
    const now = new Date().toISOString();
    const product: Product = {
      id: crypto.randomUUID(),
      sku: input.sku,
      barcode: input.barcode,
      name: input.name,
      category: input.category,
      brand: input.brand,
      quantity: input.quantity,
      minimumStock: input.minimumStock,
      unitPriceCents: input.unitPriceCents,
      imageUrl: input.imageUrl,
      status: input.status ?? 'active',
      location: input.location,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };

    return await this.repository.create(product);
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    if (Object.keys(input).length === 0) {
      throw new BadRequestException('At least one field is required');
    }

    const patch = this.stripUndefinedValues(input);

    if (Object.keys(patch).length === 0) {
      throw new BadRequestException('At least one field is required');
    }

    const updated = await this.repository.update(id, patch);

    if (!updated) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const wasDeleted = await this.repository.remove(id);

    if (!wasDeleted) {
      throw new NotFoundException(`Product ${id} not found`);
    }
  }

  private stripUndefinedValues(value: UpdateProductInput): UpdateProductInput {
    const entries = Object.entries(value).filter(([, fieldValue]) => {
      return fieldValue !== undefined;
    });

    return Object.fromEntries(entries) as UpdateProductInput;
  }
}
