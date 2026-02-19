import { ServiceUnavailableException } from '@nestjs/common';
import type { PrismaService } from '../../integrations/prisma/prisma.service';
import type { ProductFilters } from '../product.types';
import { PrismaProductsRepository } from './prisma-products.repository';

describe('PrismaProductsRepository', () => {
  const createdAt = new Date('2026-02-01T10:00:00.000Z');
  const updatedAt = new Date('2026-02-01T11:00:00.000Z');

  function buildPrismaProduct(
    overrides: Partial<Record<string, unknown>> = {},
  ) {
    return {
      id: 'prod-001',
      sku: 'SKU-APPLE-001',
      barcode: '7501001001001',
      name: 'Apple Box',
      category: 'Frutas',
      brand: 'Fresh Farm',
      quantity: 40,
      minimumStock: 12,
      unitPriceCents: 599,
      imageUrl: 'https://example.com/image.jpg',
      status: 'active',
      location: 'A-01',
      notes: 'Producto de alta rotacion',
      createdAt,
      updatedAt,
      ...overrides,
    };
  }

  it('applies filters and pagination in findAll', async () => {
    const findMany = jest.fn().mockResolvedValue([buildPrismaProduct()]);
    const count = jest.fn().mockResolvedValue(1);
    const prismaService = {
      product: {
        findMany,
        count,
      },
      $transaction: jest.fn((operations: Promise<unknown>[]) =>
        Promise.all(operations),
      ),
    } as unknown as PrismaService;
    const repository = new PrismaProductsRepository(prismaService);
    const filters: ProductFilters = {
      q: 'milk',
      sku: 'SKU-1',
      barcode: '7501',
      name: 'apple',
      category: 'frutas',
      brand: 'farm',
      location: 'A-01',
      status: 'active',
      quantityMin: 1,
      quantityMax: 50,
      minimumStockMin: 2,
      minimumStockMax: 20,
      unitPriceMin: 100,
      unitPriceMax: 900,
      page: 2,
      limit: 5,
    };
    const expectedWhere = {
      AND: [
        { status: 'active' },
        {
          OR: [
            { name: { contains: 'milk', mode: 'insensitive' } },
            { sku: { contains: 'milk', mode: 'insensitive' } },
            { barcode: { contains: 'milk', mode: 'insensitive' } },
            { category: { contains: 'milk', mode: 'insensitive' } },
            { brand: { contains: 'milk', mode: 'insensitive' } },
          ],
        },
        { sku: { contains: 'SKU-1', mode: 'insensitive' } },
        { barcode: { contains: '7501', mode: 'insensitive' } },
        { name: { contains: 'apple', mode: 'insensitive' } },
        { category: { contains: 'frutas', mode: 'insensitive' } },
        { brand: { contains: 'farm', mode: 'insensitive' } },
        { location: { contains: 'A-01', mode: 'insensitive' } },
        { quantity: { gte: 1, lte: 50 } },
        { minimumStock: { gte: 2, lte: 20 } },
        { unitPriceCents: { gte: 100, lte: 900 } },
      ],
    };

    const result = await repository.findAll(filters);

    expect(result.meta).toEqual({
      page: 2,
      limit: 5,
      total: 1,
      totalPages: 1,
    });
    expect(findMany).toHaveBeenCalledWith({
      where: expectedWhere,
      skip: 5,
      take: 5,
    });
    expect(count).toHaveBeenCalledWith({
      where: expectedWhere,
    });
  });

  it('returns null when product does not exist', async () => {
    const prismaService = {
      product: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaService;
    const repository = new PrismaProductsRepository(prismaService);

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('creates product with nullable fields mapped to null', async () => {
    const create = jest.fn().mockResolvedValue(
      buildPrismaProduct({
        barcode: null,
        category: null,
        brand: null,
        minimumStock: null,
        imageUrl: null,
        location: null,
        notes: null,
      }),
    );
    const prismaService = {
      product: {
        create,
      },
    } as unknown as PrismaService;
    const repository = new PrismaProductsRepository(prismaService);

    const created = await repository.create({
      id: 'prod-002',
      sku: 'SKU-002',
      name: 'Milk Pack',
      quantity: 10,
      unitPriceCents: 249,
      status: 'active',
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        id: 'prod-002',
        sku: 'SKU-002',
        barcode: null,
        name: 'Milk Pack',
        category: null,
        brand: null,
        quantity: 10,
        minimumStock: null,
        unitPriceCents: 249,
        imageUrl: null,
        status: 'active',
        location: null,
        notes: null,
        createdAt,
        updatedAt,
      },
    });
    expect(created.barcode).toBeUndefined();
    expect(created.category).toBeUndefined();
    expect(created.createdAt).toBe(createdAt.toISOString());
  });

  it('updates product and refreshes updatedAt timestamp', async () => {
    let capturedUpdateArgs:
      | { where: { id: string }; data: { quantity?: number; updatedAt?: Date } }
      | undefined;
    const update = jest.fn((args: unknown) => {
      capturedUpdateArgs = args as {
        where: { id: string };
        data: { quantity?: number; updatedAt?: Date };
      };

      return Promise.resolve(buildPrismaProduct({ quantity: 25, notes: null }));
    });
    const prismaService = {
      product: {
        update,
      },
    } as unknown as PrismaService;
    const repository = new PrismaProductsRepository(prismaService);

    const updated = await repository.update('prod-001', {
      quantity: 25,
      notes: undefined,
    });

    expect(capturedUpdateArgs).toBeDefined();
    expect(capturedUpdateArgs?.where).toEqual({ id: 'prod-001' });
    expect(capturedUpdateArgs?.data.quantity).toBe(25);
    expect(capturedUpdateArgs?.data.updatedAt).toBeInstanceOf(Date);
    expect(updated?.quantity).toBe(25);
  });

  it('returns null when updating unknown product', async () => {
    const notFoundError = Object.assign(new Error('record not found'), {
      code: 'P2025',
    });
    const prismaService = {
      product: {
        update: jest.fn().mockRejectedValue(notFoundError),
      },
    } as unknown as PrismaService;
    const repository = new PrismaProductsRepository(prismaService);

    await expect(
      repository.update('missing', { quantity: 1 }),
    ).resolves.toBeNull();
  });

  it('returns delete status based on deleteMany count', async () => {
    const deleteMany = jest
      .fn()
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    const prismaService = {
      product: {
        deleteMany,
      },
    } as unknown as PrismaService;
    const repository = new PrismaProductsRepository(prismaService);

    await expect(repository.remove('prod-001')).resolves.toBe(true);
    await expect(repository.remove('prod-404')).resolves.toBe(false);
  });

  it('maps infrastructure failures to ServiceUnavailableException', async () => {
    const prismaService = {
      product: {
        findUnique: jest.fn().mockRejectedValue(new Error('db offline')),
      },
    } as unknown as PrismaService;
    const repository = new PrismaProductsRepository(prismaService);

    await expect(repository.findById('prod-001')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
