import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InMemoryProductsRepository } from './repositories/in-memory-products.repository';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(() => {
    service = new ProductsService(new InMemoryProductsRepository());
  });

  it('returns seed products', async () => {
    const products = await service.findAll({});
    expect(products.length).toBeGreaterThanOrEqual(2);
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

  it('throws when creating invalid product', async () => {
    await expect(
      service.create({
        sku: 'A',
        name: 'x',
        quantity: -1,
        unitPriceCents: 100,
      }),
    ).rejects.toThrow(BadRequestException);
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
});
