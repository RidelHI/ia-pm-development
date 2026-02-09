import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(() => {
    service = new ProductsService();
  });

  it('returns seed products', () => {
    const products = service.findAll({});
    expect(products.length).toBeGreaterThanOrEqual(2);
  });

  it('creates a product', () => {
    const product = service.create({
      sku: 'SKU-BREAD-003',
      name: 'Bread Pack',
      quantity: 8,
      unitPriceCents: 199,
    });

    expect(product.id).toBeDefined();
    expect(product.status).toBe('active');
  });

  it('updates a product', () => {
    const created = service.create({
      sku: 'SKU-RICE-004',
      name: 'Rice Bag',
      quantity: 20,
      unitPriceCents: 1299,
    });

    const updated = service.update(created.id, { quantity: 10 });
    expect(updated.quantity).toBe(10);
  });

  it('throws when updating unknown product', () => {
    expect(() => service.update('missing', { quantity: 1 })).toThrow(
      NotFoundException,
    );
  });

  it('throws when creating invalid product', () => {
    expect(() =>
      service.create({
        sku: 'A',
        name: 'x',
        quantity: -1,
        unitPriceCents: 100,
      }),
    ).toThrow(BadRequestException);
  });
});
