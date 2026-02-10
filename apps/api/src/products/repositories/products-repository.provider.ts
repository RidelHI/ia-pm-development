import type { SupabaseService } from '../../integrations/supabase/supabase.service';
import type { ProductsRepository } from './products.repository';

export function resolveProductsRepository(
  supabaseService: SupabaseService,
  supabaseRepository: ProductsRepository,
  inMemoryRepository: ProductsRepository,
): ProductsRepository {
  if (supabaseService.isConfigured()) {
    return supabaseRepository;
  }

  return inMemoryRepository;
}
