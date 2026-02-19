import type { PrismaService } from '../../integrations/prisma/prisma.service';
import { resolveProductsRepository } from './products-repository.provider';

describe('resolveProductsRepository', () => {
  it('returns prisma repository when configured and probe succeeds', async () => {
    const prismaService = {
      isConfigured: () => true,
      product: {
        findFirst: jest.fn().mockResolvedValue({ id: 'prod-001' }),
      },
    } as PrismaService;

    const prismaRepository = { name: 'prisma' };
    const inMemoryRepository = { name: 'in-memory' };

    const selected = await resolveProductsRepository(
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
      product: {
        findFirst,
      },
    } as PrismaService;

    const prismaRepository = { name: 'prisma' };
    const inMemoryRepository = { name: 'in-memory' };

    const selected = await resolveProductsRepository(
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
      product: {
        findFirst: jest.fn().mockRejectedValue(new Error('table missing')),
      },
    } as PrismaService;
    const prismaRepository = { name: 'prisma' };
    const inMemoryRepository = { name: 'in-memory' };

    const selected = await resolveProductsRepository(
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
      product: {
        findFirst: jest.fn().mockRejectedValue(new Error('db unavailable')),
      },
    } as PrismaService;
    const prismaRepository = { name: 'prisma' };
    const inMemoryRepository = { name: 'in-memory' };

    await expect(
      resolveProductsRepository(
        prismaService,
        prismaRepository,
        inMemoryRepository,
        'production',
      ),
    ).rejects.toThrow('db unavailable');
  });
});
