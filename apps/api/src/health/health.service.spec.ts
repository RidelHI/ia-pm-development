import { MemoryHealthIndicator } from '@nestjs/terminus';
import { PrismaHealthIndicator } from './indicators/prisma-health.indicator';
import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns liveness payload with injected app configuration', () => {
    const memoryHealthIndicator = {
      checkHeap: jest.fn(),
    } as unknown as MemoryHealthIndicator;
    const prismaHealthIndicator = {
      isHealthy: jest.fn(),
    } as unknown as PrismaHealthIndicator;

    const service = new HealthService(
      {
        name: 'warehouse-api',
        version: '0.2.1',
        environment: 'test',
        port: 3001,
        cors: {
          origins: ['*'],
          credentials: false,
        },
        docs: {
          enabled: true,
          path: 'docs',
        },
        rateLimit: {
          ttlMs: 60000,
          limit: 100,
        },
      },
      memoryHealthIndicator,
      prismaHealthIndicator,
    );
    const health = service.getLiveness();

    expect(health.application.version).toBe('0.2.1');
    expect(health.application.service).toBe('warehouse-api');
    expect(health.application.environment).toBe('test');
    expect(health.application.status).toBe('up');
  });

  it('delegates readiness checks to indicators', async () => {
    const checkHeapMock = jest.fn().mockResolvedValue({
      memory_heap: { status: 'up' },
    });
    const memoryHealthIndicator = {
      checkHeap: checkHeapMock,
    } as unknown as MemoryHealthIndicator;
    const isHealthyMock = jest.fn().mockResolvedValue({
      prisma: { status: 'up', configured: true },
    });
    const prismaHealthIndicator = {
      isHealthy: isHealthyMock,
    } as unknown as PrismaHealthIndicator;

    const service = new HealthService(
      {
        name: 'warehouse-api',
        version: '0.1.0',
        environment: 'development',
        port: 3000,
        cors: {
          origins: ['*'],
          credentials: false,
        },
        docs: {
          enabled: true,
          path: 'docs',
        },
        rateLimit: {
          ttlMs: 60000,
          limit: 100,
        },
      },
      memoryHealthIndicator,
      prismaHealthIndicator,
    );
    const prismaCheck = await service.getReadinessPrisma();
    const memoryCheck = await service.getReadinessMemory();

    expect(prismaCheck.prisma.status).toBe('up');
    expect(memoryCheck.memory_heap.status).toBe('up');
    expect(isHealthyMock).toHaveBeenCalledWith('prisma', {
      checkRead: true,
    });
    expect(checkHeapMock).toHaveBeenCalledWith(
      'memory_heap',
      300 * 1024 * 1024,
    );
  });
});
