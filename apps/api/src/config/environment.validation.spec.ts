import { validateEnvironment } from './environment.validation';

describe('validateEnvironment', () => {
  it('returns normalized defaults for minimal env', () => {
    const validated = validateEnvironment({});

    expect(validated.NODE_ENV).toBe('development');
    expect(validated.PORT).toBe(3000);
    expect(validated.APP_VERSION).toBe('0.1.0');
    expect(validated.SUPABASE_PRODUCTS_TABLE).toBe('products');
  });

  it('throws when SUPABASE_URL is present without key', () => {
    expect(() =>
      validateEnvironment({
        SUPABASE_URL: 'https://example.supabase.co',
      }),
    ).toThrow('Invalid environment configuration');
  });
});
