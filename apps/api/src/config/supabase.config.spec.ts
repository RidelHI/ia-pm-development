import supabaseConfig from './supabase.config';

describe('supabaseConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_PRODUCTS_TABLE;
    delete process.env.SUPABASE_USERS_TABLE;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('prefers secret key, then service role, then anon key', () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    process.env.SUPABASE_SECRET_KEY = 'secret-key';

    const config = supabaseConfig();
    expect(config.apiKey).toBe('secret-key');
  });

  it('uses default products table when not set', () => {
    const config = supabaseConfig();
    expect(config.productsTable).toBe('products');
    expect(config.usersTable).toBe('users');
  });
});
