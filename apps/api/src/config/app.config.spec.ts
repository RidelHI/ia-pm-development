import appConfig from './app.config';

describe('appConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.APP_CORS_ORIGINS;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses wildcard CORS origin when APP_CORS_ORIGINS is not set', () => {
    const config = appConfig();

    expect(config.cors.origins).toBe('*');
  });

  it('uses explicit CORS origins list when APP_CORS_ORIGINS has values', () => {
    process.env.APP_CORS_ORIGINS =
      'https://ridelhi.github.io, http://localhost:4200';
    const config = appConfig();

    expect(config.cors.origins).toEqual([
      'https://ridelhi.github.io',
      'http://localhost:4200',
    ]);
  });

  it('treats wildcard marker as wildcard origin', () => {
    process.env.APP_CORS_ORIGINS = '*';
    const config = appConfig();

    expect(config.cors.origins).toBe('*');
  });
});
