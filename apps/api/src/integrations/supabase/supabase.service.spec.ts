import { SupabaseService } from './supabase.service';

describe('SupabaseService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.SUPABASE_URL;
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
    process.env.SUPABASE_ANON_KEY = 'anon-key';

    const service = new SupabaseService();
    expect(service.isConfigured()).toBe(true);
    expect(service.getProductsTable()).toBe('products');
  });

  it('uses custom products table when provided', () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';
    process.env.SUPABASE_PRODUCTS_TABLE = 'warehouse_products';

    const service = new SupabaseService();
    expect(service.getProductsTable()).toBe('warehouse_products');
  });
});
