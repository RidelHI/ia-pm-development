import {
  toPaginatedProductsResponse,
  toProductMutationInputDto,
  toProduct,
  type ProductDto,
} from './products.mappers';

describe('products.mappers', () => {
  it('maps product dto and normalizes blank location', () => {
    const dto: ProductDto = {
      id: 'prod-01',
      sku: 'SKU-01',
      barcode: ' 7501234567890 ',
      name: 'Product 01',
      category: '  Lacteos  ',
      brand: null,
      quantity: 4,
      minimumStock: 2,
      unitPriceCents: 1999,
      imageUrl: '  ',
      status: 'active',
      location: '  ',
      notes: '  ',
      createdAt: '2026-02-13T00:00:00.000Z',
      updatedAt: '2026-02-13T00:00:00.000Z',
    };

    const product = toProduct(dto);

    expect(product.barcode).toBe('7501234567890');
    expect(product.category).toBe('Lacteos');
    expect(product.minimumStock).toBe(2);
    expect(product.location).toBeNull();
    expect(product.imageUrl).toBeNull();
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

  it('normalizes mutation input payload', () => {
    const payload = toProductMutationInputDto({
      sku: ' SKU-NEW-01 ',
      barcode: ' 7501001 ',
      name: ' New Product ',
      category: ' Limpieza ',
      brand: ' Marca Sur ',
      quantity: 4,
      minimumStock: 2,
      unitPriceCents: 1999,
      imageUrl: ' https://images.example.com/new-product.jpg ',
      status: 'active',
      location: ' A-01 ',
      notes: ' Fragil ',
    });

    expect(payload).toEqual({
      sku: 'SKU-NEW-01',
      barcode: '7501001',
      name: 'New Product',
      category: 'Limpieza',
      brand: 'Marca Sur',
      quantity: 4,
      minimumStock: 2,
      unitPriceCents: 1999,
      imageUrl: 'https://images.example.com/new-product.jpg',
      status: 'active',
      location: 'A-01',
      notes: 'Fragil',
    });
  });
});
