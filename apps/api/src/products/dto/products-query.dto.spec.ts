import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ProductsQueryDto } from './products-query.dto';

describe('ProductsQueryDto', () => {
  it('transforms and validates optional fields', () => {
    const dto = plainToInstance(ProductsQueryDto, {
      q: '  apple  ',
      sku: ' SKU-APPLE-001 ',
      category: '  Frutas  ',
      quantityMin: '1',
      minimumStockMax: '4',
      unitPriceMax: '500',
    });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.q).toBe('apple');
    expect(dto.sku).toBe('SKU-APPLE-001');
    expect(dto.category).toBe('Frutas');
    expect(dto.quantityMin).toBe(1);
    expect(dto.minimumStockMax).toBe(4);
    expect(dto.unitPriceMax).toBe(500);
  });

  it('fails when a range max is lower than min', () => {
    const dto = plainToInstance(ProductsQueryDto, {
      quantityMin: 10,
      quantityMax: 5,
      minimumStockMin: 7,
      minimumStockMax: 3,
      unitPriceMin: 700,
      unitPriceMax: 500,
    });
    const errors = validateSync(dto);

    const constraints = errors.flatMap((error) => {
      return Object.values(error.constraints ?? {});
    });

    expect(constraints).toContain(
      'quantityMax must be greater than or equal to quantityMin',
    );
    expect(constraints).toContain(
      'minimumStockMax must be greater than or equal to minimumStockMin',
    );
    expect(constraints).toContain(
      'unitPriceMax must be greater than or equal to unitPriceMin',
    );
  });

  it('fails when numeric filters are negative', () => {
    const dto = plainToInstance(ProductsQueryDto, {
      quantityMin: -1,
      minimumStockMin: -1,
      unitPriceMin: -10,
    });
    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
