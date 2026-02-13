import {
  toPaginatedProductsResponse,
  toProduct,
  type ProductDto,
} from './products.mappers';

describe('products.mappers', () => {
  it('maps product dto and normalizes blank location', () => {
    const dto: ProductDto = {
      id: 'prod-01',
      sku: 'SKU-01',
      name: 'Product 01',
      quantity: 4,
      unitPriceCents: 1999,
      status: 'active',
      location: '  ',
      createdAt: '2026-02-13T00:00:00.000Z',
      updatedAt: '2026-02-13T00:00:00.000Z',
    };

    const product = toProduct(dto);

    expect(product.location).toBeNull();
    expect(product.status).toBe('active');
  });

  it('maps unknown status to inactive in paginated response', () => {
    const response = toPaginatedProductsResponse({
      data: [
        {
          id: 'prod-02',
          sku: 'SKU-02',
          name: 'Product 02',
          quantity: 1,
          unitPriceCents: 500,
          status: 'archived',
          location: 'A-01',
          createdAt: '2026-02-13T00:00:00.000Z',
          updatedAt: '2026-02-13T00:00:00.000Z',
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });

    expect(response.meta.total).toBe(1);
    expect(response.data[0]?.status).toBe('inactive');
  });
});
