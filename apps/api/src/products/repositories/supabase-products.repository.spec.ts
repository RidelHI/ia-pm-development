import { ServiceUnavailableException } from '@nestjs/common';
import type { SupabaseService } from '../../integrations/supabase/supabase.service';
import { SupabaseProductsRepository } from './supabase-products.repository';

describe('SupabaseProductsRepository', () => {
  it('throws when Supabase client is not configured', async () => {
    const supabaseService = {
      getClient: () => null,
      getProductsTable: () => 'products',
    } as SupabaseService;

    const repository = new SupabaseProductsRepository(supabaseService);

    await expect(repository.findAll({})).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('escapes search input and applies pagination in findAll', async () => {
    type QueryPayload = {
      data: never[];
      count: number;
      error: null;
    };

    const queryResult: Promise<QueryPayload> = Promise.resolve({
      data: [],
      count: 0,
      error: null,
    });
    const then: PromiseLike<QueryPayload>['then'] = (onfulfilled, onrejected) =>
      queryResult.then(onfulfilled, onrejected);

    const query = {
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      then,
    };
    const from = {
      select: jest.fn().mockReturnValue(query),
    };
    const client = {
      from: jest.fn().mockReturnValue(from),
    };
    const supabaseService = {
      getClient: () => client,
      getProductsTable: () => 'products',
    } as unknown as SupabaseService;

    const repository = new SupabaseProductsRepository(supabaseService);

    const result = await repository.findAll({
      q: 'milk,50%_()',
      sku: 'SKU-1',
      barcode: '7501',
      name: 'milk',
      category: 'lacteos',
      brand: 'campo',
      location: 'A-01',
      quantityMin: 2,
      quantityMax: 9,
      minimumStockMin: 1,
      minimumStockMax: 12,
      unitPriceMin: 100,
      unitPriceMax: 900,
      page: 2,
      limit: 5,
    });

    expect(result.meta.page).toBe(2);
    expect(result.meta.limit).toBe(5);
    expect(query.range).toHaveBeenCalledWith(5, 9);
    expect(query.or).toHaveBeenCalledWith(
      'name.ilike.%milk\\,50\\%\\_\\(\\)%,sku.ilike.%milk\\,50\\%\\_\\(\\)%,barcode.ilike.%milk\\,50\\%\\_\\(\\)%,category.ilike.%milk\\,50\\%\\_\\(\\)%,brand.ilike.%milk\\,50\\%\\_\\(\\)%',
    );
    expect(query.ilike).toHaveBeenCalledWith('sku', '%SKU-1%');
    expect(query.ilike).toHaveBeenCalledWith('barcode', '%7501%');
    expect(query.ilike).toHaveBeenCalledWith('name', '%milk%');
    expect(query.ilike).toHaveBeenCalledWith('category', '%lacteos%');
    expect(query.ilike).toHaveBeenCalledWith('brand', '%campo%');
    expect(query.ilike).toHaveBeenCalledWith('location', '%A-01%');
    expect(query.gte).toHaveBeenCalledWith('quantity', 2);
    expect(query.lte).toHaveBeenCalledWith('quantity', 9);
    expect(query.gte).toHaveBeenCalledWith('minimumStock', 1);
    expect(query.lte).toHaveBeenCalledWith('minimumStock', 12);
    expect(query.gte).toHaveBeenCalledWith('unitPriceCents', 100);
    expect(query.lte).toHaveBeenCalledWith('unitPriceCents', 900);
  });
});
