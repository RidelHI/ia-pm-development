import { MemoryHealthIndicator } from '@nestjs/terminus';
import { SupabaseHealthIndicator } from './indicators/supabase-health.indicator';
import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns liveness payload with injected app configuration', () => {
    const memoryHealthIndicator = {
      checkHeap: jest.fn(),
    } as unknown as MemoryHealthIndicator;
    const supabaseHealthIndicator = {
      isHealthy: jest.fn(),
    } as unknown as SupabaseHealthIndicator;

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
      supabaseHealthIndicator,
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
      supabase: { status: 'up', configured: true },
    });
    const supabaseHealthIndicator = {
      isHealthy: isHealthyMock,
    } as unknown as SupabaseHealthIndicator;

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
      supabaseHealthIndicator,
    );
    const supabaseCheck = await service.getReadinessSupabase();
    const memoryCheck = await service.getReadinessMemory();

    expect(supabaseCheck.supabase.status).toBe('up');
    expect(memoryCheck.memory_heap.status).toBe('up');
    expect(isHealthyMock).toHaveBeenCalledWith('supabase', {
      checkRead: true,
    });
    expect(checkHeapMock).toHaveBeenCalledWith(
      'memory_heap',
      300 * 1024 * 1024,
    );
  });
});
