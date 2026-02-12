import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InMemoryProductsRepository } from './repositories/in-memory-products.repository';
import { PRODUCTS_REPOSITORY } from './repositories/products.repository';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        ProductsService,
        InMemoryProductsRepository,
        {
          provide: PRODUCTS_REPOSITORY,
          useExisting: InMemoryProductsRepository,
        },
      ],
    }).compile();

    service = moduleRef.get<ProductsService>(ProductsService);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('returns seed products', async () => {
    const products = await service.findAll({});
    expect(products.data.length).toBeGreaterThanOrEqual(2);
    expect(products.meta.total).toBeGreaterThanOrEqual(2);
  });

  it('applies pagination when listing products', async () => {
    const firstPage = await service.findAll({ page: 1, limit: 1 });
    const secondPage = await service.findAll({ page: 2, limit: 1 });

    expect(firstPage.data).toHaveLength(1);
    expect(secondPage.data).toHaveLength(1);
    expect(firstPage.data[0]?.id).not.toBe(secondPage.data[0]?.id);
    expect(firstPage.meta.totalPages).toBeGreaterThanOrEqual(2);
  });

  it('filters products by explicit text fields', async () => {
    const bySku = await service.findAll({ sku: 'APPLE' });
    const byName = await service.findAll({ name: 'milk' });
    const byLocation = await service.findAll({ location: 'B-03' });

    expect(bySku.data).toHaveLength(1);
    expect(bySku.data[0]?.sku).toBe('SKU-APPLE-001');
    expect(byName.data).toHaveLength(1);
    expect(byName.data[0]?.name).toBe('Milk Pack');
    expect(byLocation.data).toHaveLength(1);
    expect(byLocation.data[0]?.location).toBe('B-03');
  });

  it('filters products by numeric ranges', async () => {
    const quantityRange = await service.findAll({
      quantityMin: 20,
      quantityMax: 50,
    });
    const priceRange = await service.findAll({
      unitPriceMin: 500,
      unitPriceMax: 700,
    });

    expect(quantityRange.data).toHaveLength(1);
    expect(quantityRange.data[0]?.name).toBe('Apple Box');
    expect(priceRange.data).toHaveLength(1);
    expect(priceRange.data[0]?.name).toBe('Apple Box');
  });

  it('creates a product', async () => {
    const product = await service.create({
      sku: 'SKU-BREAD-003',
      name: 'Bread Pack',
      quantity: 8,
      unitPriceCents: 199,
    });

    expect(product.id).toBeDefined();
    expect(product.status).toBe('active');
  });

  it('updates a product', async () => {
    const created = await service.create({
      sku: 'SKU-RICE-004',
      name: 'Rice Bag',
      quantity: 20,
      unitPriceCents: 1299,
    });

    const updated = await service.update(created.id, { quantity: 10 });
    expect(updated.quantity).toBe(10);
  });

  it('throws when updating unknown product', async () => {
    await expect(service.update('missing', { quantity: 1 })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws when update payload has no defined fields', async () => {
    const created = await service.create({
      sku: 'SKU-TEA-005',
      name: 'Tea Box',
      quantity: 6,
      unitPriceCents: 399,
    });

    await expect(
      service.update(created.id, { name: undefined }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when removing unknown product', async () => {
    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
  });
});
