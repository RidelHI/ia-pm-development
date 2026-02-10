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
});
