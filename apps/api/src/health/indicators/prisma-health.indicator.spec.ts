import { HealthIndicatorService } from '@nestjs/terminus';
import type { PrismaService } from '../../integrations/prisma/prisma.service';
import { PrismaHealthIndicator } from './prisma-health.indicator';

describe('PrismaHealthIndicator', () => {
  function createIndicator(
    prismaService: PrismaService,
    environment: 'development' | 'production' | 'test' = 'development',
  ): PrismaHealthIndicator {
    return new PrismaHealthIndicator(
      prismaService,
      new HealthIndicatorService(),
      {
        environment,
      } as never,
    );
  }

  it('reports up with fallback mode when prisma is not configured outside production', async () => {
    const prismaService = {
      isConfigured: () => false,
      $queryRawUnsafe: jest.fn(),
    } as unknown as PrismaService;
    const indicator = createIndicator(prismaService, 'development');

    const result = await indicator.isHealthy('prisma', { checkRead: true });

    expect(result.prisma.status).toBe('up');
    expect(result.prisma.configured).toBe(false);
    expect(result.prisma.mode).toBe('in-memory-fallback');
  });

  it('reports down when prisma is not configured in production', async () => {
    const prismaService = {
      isConfigured: () => false,
      $queryRawUnsafe: jest.fn(),
    } as unknown as PrismaService;
    const indicator = createIndicator(prismaService, 'production');

    const result = await indicator.isHealthy('prisma', { checkRead: true });

    expect(result.prisma.status).toBe('down');
    expect(result.prisma.configured).toBe(false);
    expect(result.prisma.reason).toContain('DATABASE_URL');
  });

  it('reports up when configured and query succeeds', async () => {
    const queryMock = jest.fn().mockResolvedValue([{ '?column?': 1 }]);
    const prismaService = {
      isConfigured: () => true,
      $queryRawUnsafe: queryMock,
    } as unknown as PrismaService;
    const indicator = createIndicator(prismaService, 'production');

    const result = await indicator.isHealthy('prisma', { checkRead: true });

    expect(result.prisma.status).toBe('up');
    expect(result.prisma.configured).toBe(true);
    expect(result.prisma.reachable).toBe(true);
    expect(queryMock).toHaveBeenCalledWith('SELECT 1');
  });

  it('reports down when configured but query fails', async () => {
    const prismaService = {
      isConfigured: () => true,
      $queryRawUnsafe: jest.fn().mockRejectedValue(new Error('db offline')),
    } as unknown as PrismaService;
    const indicator = createIndicator(prismaService, 'production');

    const result = await indicator.isHealthy('prisma', { checkRead: true });

    expect(result.prisma.status).toBe('down');
    expect(result.prisma.configured).toBe(true);
    expect(result.prisma.reachable).toBe(false);
  });
});
