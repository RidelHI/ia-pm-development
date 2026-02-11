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
      page: 2,
      limit: 5,
    });

    expect(result.meta.page).toBe(2);
    expect(result.meta.limit).toBe(5);
    expect(query.range).toHaveBeenCalledWith(5, 9);
    expect(query.or).toHaveBeenCalledWith(
      'name.ilike.%milk\\,50\\%\\_\\(\\)%,sku.ilike.%milk\\,50\\%\\_\\(\\)%',
    );
  });
});
