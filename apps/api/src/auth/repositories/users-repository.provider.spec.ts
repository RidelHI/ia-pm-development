import type { PrismaService } from '../../integrations/prisma/prisma.service';
import { resolveUsersRepository } from './users-repository.provider';

describe('resolveUsersRepository', () => {
  it('returns prisma repository when configured and probe succeeds', async () => {
    const prismaService = {
      isConfigured: () => true,
      user: {
        findFirst: jest.fn().mockResolvedValue({ id: 'usr-01' }),
      },
    } as PrismaService;
    const prismaRepository = { name: 'prisma' };
    const inMemoryRepository = { name: 'in-memory' };

    const selected = await resolveUsersRepository(
      prismaService,
      prismaRepository,
      inMemoryRepository,
    );

    expect(selected).toBe(prismaRepository);
  });

  it('returns in-memory repository when prisma is not configured', async () => {
    const findFirst = jest.fn();
    const prismaService = {
      isConfigured: () => false,
      user: {
        findFirst,
      },
    } as PrismaService;
    const prismaRepository = { name: 'prisma' };
    const inMemoryRepository = { name: 'in-memory' };

    const selected = await resolveUsersRepository(
      prismaService,
      prismaRepository,
      inMemoryRepository,
    );

    expect(selected).toBe(inMemoryRepository);
    expect(findFirst).not.toHaveBeenCalled();
  });

  it('returns in-memory repository when prisma probe fails outside production', async () => {
    const prismaService = {
      isConfigured: () => true,
      user: {
        findFirst: jest.fn().mockRejectedValue(new Error('table missing')),
      },
    } as PrismaService;
    const prismaRepository = { name: 'prisma' };
    const inMemoryRepository = { name: 'in-memory' };

    const selected = await resolveUsersRepository(
      prismaService,
      prismaRepository,
      inMemoryRepository,
      'test',
    );

    expect(selected).toBe(inMemoryRepository);
  });

  it('throws when prisma probe fails in production', async () => {
    const prismaService = {
      isConfigured: () => true,
      user: {
        findFirst: jest.fn().mockRejectedValue(new Error('db unavailable')),
      },
    } as PrismaService;
    const prismaRepository = { name: 'prisma' };
    const inMemoryRepository = { name: 'in-memory' };

    await expect(
      resolveUsersRepository(
        prismaService,
        prismaRepository,
        inMemoryRepository,
        'production',
      ),
    ).rejects.toThrow('db unavailable');
  });
});
