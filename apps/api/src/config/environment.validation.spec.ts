import { validateEnvironment } from './environment.validation';

describe('validateEnvironment', () => {
  it('returns normalized defaults for minimal env', () => {
    const validated = validateEnvironment({});

    expect(validated.NODE_ENV).toBe('development');
    expect(validated.PORT).toBe(3000);
    expect(validated.APP_VERSION).toBe('0.1.0');
    expect(validated.SUPABASE_PRODUCTS_TABLE).toBe('products');
    expect(validated.RATE_LIMIT_TTL_SECONDS).toBe(60);
    expect(validated.RATE_LIMIT_LIMIT).toBe(100);
    expect(validated.AUTH_USERNAME).toBe('admin');
    expect(validated.AUTH_JWT_EXPIRES_IN_SECONDS).toBe(900);
  });

  it('throws when SUPABASE_URL is present without key', () => {
    expect(() =>
      validateEnvironment({
        SUPABASE_URL: 'https://example.supabase.co',
      }),
    ).toThrow('Invalid environment configuration');
  });

  it('throws in production when JWT secret is too short', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'production',
        AUTH_JWT_SECRET: 'short-secret',
        AUTH_USERNAME: 'prod-user',
        AUTH_PASSWORD: 'prod-password-123',
      }),
    ).toThrow('Invalid environment configuration');
  });
});
