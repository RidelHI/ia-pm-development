import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '../../../prisma/generated/client/client';
import type { Product as PrismaProduct } from '../../../prisma/generated/client/client';
import { PrismaService } from '../../integrations/prisma/prisma.service';
import type {
  PaginatedResult,
  Product,
  ProductFilters,
  UpdateProductInput,
} from '../product.types';
import type { ProductsRepository } from './products.repository';

@Injectable()
export class PrismaProductsRepository implements ProductsRepository {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 20;
  private static readonly MAX_LIMIT = 100;
  private readonly logger = new Logger(PrismaProductsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: ProductFilters): Promise<PaginatedResult<Product>> {
    const { page, limit, skip } = this.resolvePagination(
      filters.page,
      filters.limit,
    );
    const where = this.buildWhere(filters);

    try {
      const [products, total] = await this.prisma.$transaction([
        this.prisma.product.findMany({
          where,
          skip,
          take: limit,
        }),
        this.prisma.product.count({
          where,
        }),
      ]);

      return {
        data: products.map((product) => this.toDomain(product)),
        meta: {
          page,
          limit,
          total,
          totalPages: total === 0 ? 0 : Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.handlePrismaError(error, 'query');
    }
  }

  async findById(id: string): Promise<Product | null> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });

      return product ? this.toDomain(product) : null;
    } catch (error) {
      this.handlePrismaError(error, 'query');
    }
  }

  async create(product: Product): Promise<Product> {
    try {
      const created = await this.prisma.product.create({
        data: {
          id: product.id,
          sku: product.sku,
          barcode: product.barcode ?? null,
          name: product.name,
          category: product.category ?? null,
          brand: product.brand ?? null,
          quantity: product.quantity,
          minimumStock: product.minimumStock ?? null,
          unitPriceCents: product.unitPriceCents,
          imageUrl: product.imageUrl ?? null,
          status: product.status,
          location: product.location ?? null,
          notes: product.notes ?? null,
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt),
        },
      });

      return this.toDomain(created);
    } catch (error) {
      this.handlePrismaError(error, 'insert');
    }
  }

  async update(id: string, patch: UpdateProductInput): Promise<Product | null> {
    const payload = this.toUpdateData(patch);

    try {
      const updated = await this.prisma.product.update({
        where: { id },
        data: {
          ...payload,
          updatedAt: new Date(),
        },
      });

      return this.toDomain(updated);
    } catch (error) {
      if (this.isRecordNotFoundError(error)) {
        return null;
      }

      this.handlePrismaError(error, 'update');
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const result = await this.prisma.product.deleteMany({
        where: { id },
      });

      return result.count > 0;
    } catch (error) {
      this.handlePrismaError(error, 'delete');
    }
  }

  private buildWhere(filters: ProductFilters): Prisma.ProductWhereInput {
    const conditions: Prisma.ProductWhereInput[] = [];
    const normalizedQuery = this.normalizeOptional(filters.q);
    const normalizedSku = this.normalizeOptional(filters.sku);
    const normalizedBarcode = this.normalizeOptional(filters.barcode);
    const normalizedName = this.normalizeOptional(filters.name);
    const normalizedCategory = this.normalizeOptional(filters.category);
    const normalizedBrand = this.normalizeOptional(filters.brand);
    const normalizedLocation = this.normalizeOptional(filters.location);

    if (filters.status) {
      conditions.push({ status: filters.status });
    }

    if (normalizedQuery) {
      conditions.push({
        OR: [
          { name: { contains: normalizedQuery, mode: 'insensitive' } },
          { sku: { contains: normalizedQuery, mode: 'insensitive' } },
          { barcode: { contains: normalizedQuery, mode: 'insensitive' } },
          { category: { contains: normalizedQuery, mode: 'insensitive' } },
          { brand: { contains: normalizedQuery, mode: 'insensitive' } },
        ],
      });
    }

    if (normalizedSku) {
      conditions.push({
        sku: { contains: normalizedSku, mode: 'insensitive' },
      });
    }

    if (normalizedBarcode) {
      conditions.push({
        barcode: { contains: normalizedBarcode, mode: 'insensitive' },
      });
    }

    if (normalizedName) {
      conditions.push({
        name: { contains: normalizedName, mode: 'insensitive' },
      });
    }

    if (normalizedCategory) {
      conditions.push({
        category: { contains: normalizedCategory, mode: 'insensitive' },
      });
    }

    if (normalizedBrand) {
      conditions.push({
        brand: { contains: normalizedBrand, mode: 'insensitive' },
      });
    }

    if (normalizedLocation) {
      conditions.push({
        location: { contains: normalizedLocation, mode: 'insensitive' },
      });
    }

    if (
      filters.quantityMin !== undefined ||
      filters.quantityMax !== undefined
    ) {
      const quantity: Prisma.IntFilter = {};

      if (filters.quantityMin !== undefined) {
        quantity.gte = filters.quantityMin;
      }

      if (filters.quantityMax !== undefined) {
        quantity.lte = filters.quantityMax;
      }

      conditions.push({ quantity });
    }

    if (
      filters.minimumStockMin !== undefined ||
      filters.minimumStockMax !== undefined
    ) {
      const minimumStock: Prisma.IntNullableFilter = {};

      if (filters.minimumStockMin !== undefined) {
        minimumStock.gte = filters.minimumStockMin;
      }

      if (filters.minimumStockMax !== undefined) {
        minimumStock.lte = filters.minimumStockMax;
      }

      conditions.push({ minimumStock });
    }

    if (
      filters.unitPriceMin !== undefined ||
      filters.unitPriceMax !== undefined
    ) {
      const unitPriceCents: Prisma.IntFilter = {};

      if (filters.unitPriceMin !== undefined) {
        unitPriceCents.gte = filters.unitPriceMin;
      }

      if (filters.unitPriceMax !== undefined) {
        unitPriceCents.lte = filters.unitPriceMax;
      }

      conditions.push({ unitPriceCents });
    }

    if (conditions.length === 0) {
      return {};
    }

    if (conditions.length === 1) {
      return conditions[0] ?? {};
    }

    return { AND: conditions };
  }

  private toUpdateData(patch: UpdateProductInput): Prisma.ProductUpdateInput {
    const data: Prisma.ProductUpdateInput = {};

    if (patch.sku !== undefined) {
      data.sku = patch.sku;
    }

    if (patch.barcode !== undefined) {
      data.barcode = patch.barcode;
    }

    if (patch.name !== undefined) {
      data.name = patch.name;
    }

    if (patch.category !== undefined) {
      data.category = patch.category;
    }

    if (patch.brand !== undefined) {
      data.brand = patch.brand;
    }

    if (patch.quantity !== undefined) {
      data.quantity = patch.quantity;
    }

    if (patch.minimumStock !== undefined) {
      data.minimumStock = patch.minimumStock;
    }

    if (patch.unitPriceCents !== undefined) {
      data.unitPriceCents = patch.unitPriceCents;
    }

    if (patch.imageUrl !== undefined) {
      data.imageUrl = patch.imageUrl;
    }

    if (patch.status !== undefined) {
      data.status = patch.status;
    }

    if (patch.location !== undefined) {
      data.location = patch.location;
    }

    if (patch.notes !== undefined) {
      data.notes = patch.notes;
    }

    return data;
  }

  private resolvePagination(
    pageCandidate: number | undefined,
    limitCandidate: number | undefined,
  ): { page: number; limit: number; skip: number } {
    const page =
      typeof pageCandidate === 'number' &&
      Number.isInteger(pageCandidate) &&
      pageCandidate > 0
        ? pageCandidate
        : PrismaProductsRepository.DEFAULT_PAGE;
    const rawLimit =
      typeof limitCandidate === 'number' &&
      Number.isInteger(limitCandidate) &&
      limitCandidate > 0
        ? limitCandidate
        : PrismaProductsRepository.DEFAULT_LIMIT;
    const limit = Math.min(rawLimit, PrismaProductsRepository.MAX_LIMIT);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  private normalizeOptional(value: string | undefined): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  private isRecordNotFoundError(error: unknown): boolean {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return true;
    }

    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 'P2025'
    );
  }

  private toDomain(product: PrismaProduct): Product {
    return {
      id: product.id,
      sku: product.sku,
      barcode: product.barcode ?? undefined,
      name: product.name,
      category: product.category ?? undefined,
      brand: product.brand ?? undefined,
      quantity: product.quantity,
      minimumStock: product.minimumStock ?? undefined,
      unitPriceCents: product.unitPriceCents,
      imageUrl: product.imageUrl ?? undefined,
      status: product.status as Product['status'],
      location: product.location ?? undefined,
      notes: product.notes ?? undefined,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  private handlePrismaError(
    error: unknown,
    operation: 'query' | 'insert' | 'update' | 'delete',
  ): never {
    this.logger.error(
      `Prisma ${operation} failed`,
      JSON.stringify(this.serializeError(error)),
    );

    throw new ServiceUnavailableException(
      'Product storage is temporarily unavailable',
    );
  }

  private serializeError(error: unknown): Record<string, string> {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
      };
    }

    return {
      name: 'UnknownError',
      message: 'Unknown Prisma error',
    };
  }
}
