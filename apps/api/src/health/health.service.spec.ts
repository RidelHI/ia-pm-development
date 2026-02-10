import { SupabaseService } from '../integrations/supabase/supabase.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns version from APP_VERSION', () => {
    process.env.APP_VERSION = '0.2.1';

    const supabaseService = {
      isConfigured: () => true,
      getProductsTable: () => 'products',
    } as SupabaseService;

    const service = new HealthService(supabaseService);
    const health = service.getHealth();

    expect(health.version).toBe('0.2.1');
    expect(health.integrations.supabase.configured).toBe(true);
  });

  it('uses fallback version when APP_VERSION is missing', () => {
    delete process.env.APP_VERSION;

    const supabaseService = {
      isConfigured: () => false,
      getProductsTable: () => 'products',
    } as SupabaseService;

    const service = new HealthService(supabaseService);
    const health = service.getHealth();

    expect(health.version).toBe('0.1.0');
    expect(health.integrations.supabase.configured).toBe(false);
  });
});
