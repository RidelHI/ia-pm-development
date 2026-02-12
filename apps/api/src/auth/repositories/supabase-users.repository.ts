import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../integrations/supabase/supabase.service';
import type { AuthUser } from '../auth.types';
import {
  DuplicateUsernameError,
  type CreateUserInput,
  type UsersRepository,
} from './users.repository';

interface QueryError {
  code?: string;
  message: string;
}

interface QueryResult<T> {
  data: T | null;
  error: QueryError | null;
}

@Injectable()
export class SupabaseUsersRepository implements UsersRepository {
  private readonly logger = new Logger(SupabaseUsersRepository.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findByUsername(username: string): Promise<AuthUser | null> {
    const client = this.clientOrThrow();
    const table = this.supabaseService.getUsersTable();
    const normalizedUsername = username.trim().toLowerCase();
    const query = client
      .from(table)
      .select('*')
      .eq('username', normalizedUsername)
      .maybeSingle();

    return this.runQuery<AuthUser>(query, 'query');
  }

  async create(input: CreateUserInput): Promise<AuthUser> {
    const client = this.clientOrThrow();
    const table = this.supabaseService.getUsersTable();
    const payload: CreateUserInput = {
      ...input,
      username: input.username.trim().toLowerCase(),
    };
    const query = client.from(table).insert(payload).select('*').single();

    const data = await this.runQuery<AuthUser>(query, 'insert');

    if (!data) {
      throw new ServiceUnavailableException('Supabase insert returned no data');
    }

    return data;
  }

  private clientOrThrow(): SupabaseClient {
    const client = this.supabaseService.getClient();

    if (!client) {
      throw new ServiceUnavailableException(
        'Supabase client is not configured',
      );
    }

    return client;
  }

  private async runQuery<T>(
    query: PromiseLike<unknown>,
    operation: 'query' | 'insert',
  ): Promise<T | null> {
    const result = (await query) as QueryResult<T>;

    if (result.error) {
      if (result.error.code === '23505') {
        throw new DuplicateUsernameError();
      }

      this.logger.error(
        `Supabase ${operation} failed`,
        JSON.stringify({
          code: result.error.code ?? 'unknown',
          message: result.error.message,
        }),
      );
      throw new ServiceUnavailableException(
        'User storage is temporarily unavailable',
      );
    }

    return result.data;
  }
}
