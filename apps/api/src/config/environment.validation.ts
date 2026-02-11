type RawEnv = Record<string, unknown>;

export interface ValidatedEnvironment extends RawEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  APP_VERSION: string;
  SUPABASE_PRODUCTS_TABLE: string;
}

function toNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function validateEnvironment(config: RawEnv): ValidatedEnvironment {
  const errors: string[] = [];
  const rawNodeEnv = toNonEmptyString(config.NODE_ENV) ?? 'development';
  const nodeEnv = ['development', 'production', 'test'].includes(rawNodeEnv)
    ? rawNodeEnv
    : 'development';

  if (rawNodeEnv !== nodeEnv) {
    errors.push('NODE_ENV must be development, production, or test');
  }

  const rawPort = config.PORT;
  const parsedPort =
    typeof rawPort === 'number'
      ? rawPort
      : typeof rawPort === 'string'
        ? Number.parseInt(rawPort, 10)
        : 3000;
  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    errors.push('PORT must be a positive integer');
  }

  const supabaseUrl = toNonEmptyString(config.SUPABASE_URL);
  const supabaseKey =
    toNonEmptyString(config.SUPABASE_SECRET_KEY) ??
    toNonEmptyString(config.SUPABASE_SERVICE_ROLE_KEY) ??
    toNonEmptyString(config.SUPABASE_ANON_KEY);

  if (supabaseUrl && !supabaseKey) {
    errors.push(
      'SUPABASE_URL is set but no API key was provided (SUPABASE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, or SUPABASE_ANON_KEY)',
    );
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration: ${errors.join('; ')}`);
  }

  return {
    ...config,
    NODE_ENV: nodeEnv,
    PORT: Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 3000,
    APP_VERSION: toNonEmptyString(config.APP_VERSION) ?? '0.1.0',
    SUPABASE_PRODUCTS_TABLE:
      toNonEmptyString(config.SUPABASE_PRODUCTS_TABLE) ?? 'products',
  } as ValidatedEnvironment;
}
