import { ServiceUnavailableException } from '@nestjs/common';
import type { SupabaseService } from '../../integrations/supabase/supabase.service';
import { DuplicateUsernameError } from './users.repository';
import { SupabaseUsersRepository } from './supabase-users.repository';

describe('SupabaseUsersRepository', () => {
  it('throws when Supabase client is not configured', async () => {
    const supabaseService = {
      getClient: () => null,
      getUsersTable: () => 'users',
    } as SupabaseService;
    const repository = new SupabaseUsersRepository(supabaseService);

    await expect(repository.findByUsername('user-01')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('maps unique violations to DuplicateUsernameError', async () => {
    const queryResult: Promise<{
      data: null;
      error: { code: string; message: string };
    }> = Promise.resolve({
      data: null,
      error: {
        code: '23505',
        message: 'duplicate key value violates unique constraint',
      },
    });
    const then: PromiseLike<unknown>['then'] = (onfulfilled, onrejected) =>
      queryResult.then(onfulfilled, onrejected);
    const query = {
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnValue({ then }),
    };
    const from = {
      insert: jest.fn().mockReturnValue(query),
    };
    const client = {
      from: jest.fn().mockReturnValue(from),
    };
    const supabaseService = {
      getClient: () => client,
      getUsersTable: () => 'users',
    } as unknown as SupabaseService;
    const repository = new SupabaseUsersRepository(supabaseService);

    await expect(
      repository.create({
        id: 'usr-01',
        username: 'warehouse.user',
        passwordHash: 'hash',
        role: 'user',
        createdAt: new Date('2026-02-01T10:00:00.000Z').toISOString(),
        updatedAt: new Date('2026-02-01T10:00:00.000Z').toISOString(),
      }),
    ).rejects.toThrow(DuplicateUsernameError);
  });
});
