import { SupabaseService } from './supabase.service';

describe('SupabaseService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_PRODUCTS_TABLE;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('is not configured without required env vars', () => {
    const service = new SupabaseService();
    expect(service.isConfigured()).toBe(false);
    expect(service.getClient()).toBeNull();
  });

  it('is configured when env vars are present', () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SECRET_KEY = 'secret-key';

    const service = new SupabaseService();
    expect(service.isConfigured()).toBe(true);
    expect(service.getProductsTable()).toBe('products');
  });

  it('falls back to service role key when secret key is not set', () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

    const service = new SupabaseService();
    expect(service.isConfigured()).toBe(true);
  });

  it('falls back to anon key for legacy compatibility', () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';

    const service = new SupabaseService();
    expect(service.isConfigured()).toBe(true);
  });

  it('uses custom products table when provided', () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SECRET_KEY = 'secret-key';
    process.env.SUPABASE_PRODUCTS_TABLE = 'warehouse_products';

    const service = new SupabaseService();
    expect(service.getProductsTable()).toBe('warehouse_products');
  });
});
