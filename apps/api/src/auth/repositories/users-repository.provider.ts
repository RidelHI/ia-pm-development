import type { SupabaseService } from '../../integrations/supabase/supabase.service';
import type { UsersRepository } from './users.repository';

export function resolveUsersRepository(
  supabaseService: SupabaseService,
  supabaseRepository: UsersRepository,
  inMemoryRepository: UsersRepository,
): UsersRepository {
  if (supabaseService.isConfigured()) {
    return supabaseRepository;
  }

  return inMemoryRepository;
}
