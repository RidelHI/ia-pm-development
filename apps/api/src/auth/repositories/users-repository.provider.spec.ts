import type { SupabaseService } from '../../integrations/supabase/supabase.service';
import { resolveUsersRepository } from './users-repository.provider';

describe('resolveUsersRepository', () => {
  it('returns supabase repository when configured', () => {
    const supabaseService = {
      isConfigured: () => true,
    } as SupabaseService;
    const supabaseRepository = { name: 'supabase' };
    const inMemoryRepository = { name: 'in-memory' };

    const selected = resolveUsersRepository(
      supabaseService,
      supabaseRepository,
      inMemoryRepository,
    );

    expect(selected).toBe(supabaseRepository);
  });

  it('returns in-memory repository when supabase is not configured', () => {
    const supabaseService = {
      isConfigured: () => false,
    } as SupabaseService;
    const supabaseRepository = { name: 'supabase' };
    const inMemoryRepository = { name: 'in-memory' };

    const selected = resolveUsersRepository(
      supabaseService,
      supabaseRepository,
      inMemoryRepository,
    );

    expect(selected).toBe(inMemoryRepository);
  });
});
