import { SupabaseService } from '../integrations/supabase/supabase.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns liveness payload with injected app configuration', () => {
    const supabaseService = {
      isConfigured: () => true,
      getProductsTable: () => 'products',
    } as SupabaseService;

    const service = new HealthService(
      {
        name: 'warehouse-api',
        version: '0.2.1',
        environment: 'test',
        port: 3001,
      },
      supabaseService,
    );
    const health = service.getLiveness();

    expect(health.version).toBe('0.2.1');
    expect(health.service).toBe('warehouse-api');
    expect(health.environment).toBe('test');
  });

  it('returns readiness payload without exposing table names', () => {
    const supabaseService = {
      isConfigured: () => false,
      getProductsTable: () => 'products',
    } as SupabaseService;

    const service = new HealthService(
      {
        name: 'warehouse-api',
        version: '0.1.0',
        environment: 'development',
        port: 3000,
      },
      supabaseService,
    );
    const health = service.getReadiness();

    expect(health.version).toBe('0.1.0');
    expect(health.ready).toBe(true);
    expect(health.integrations.supabase.configured).toBe(false);
    expect(health.integrations.supabase).not.toHaveProperty('productsTable');
  });
});
