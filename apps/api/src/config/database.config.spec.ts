import databaseConfig from './database.config';

describe('databaseConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_SCHEMA;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses defaults when environment variables are missing', () => {
    const config = databaseConfig();

    expect(config.url).toBeNull();
    expect(config.schema).toBe('public');
  });

  it('returns explicit values when environment variables are set', () => {
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@localhost:5432/postgres?schema=public';
    process.env.DATABASE_SCHEMA = 'warehouse';

    const config = databaseConfig();

    expect(config.url).toBe(
      'postgresql://postgres:postgres@localhost:5432/postgres?schema=public',
    );
    expect(config.schema).toBe('warehouse');
  });
});
