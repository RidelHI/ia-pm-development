type RawEnv = Record<string, unknown>;

export interface ValidatedEnvironment extends RawEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  APP_VERSION: string;
  SUPABASE_PRODUCTS_TABLE: string;
  RATE_LIMIT_TTL_SECONDS: number;
  RATE_LIMIT_LIMIT: number;
  AUTH_USERNAME: string;
  AUTH_PASSWORD: string;
  AUTH_JWT_SECRET: string;
  AUTH_JWT_EXPIRES_IN_SECONDS: number;
  AUTH_JWT_ISSUER: string;
  AUTH_JWT_AUDIENCE: string;
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

  const rawRateLimitTtl = config.RATE_LIMIT_TTL_SECONDS;
  const parsedRateLimitTtl =
    typeof rawRateLimitTtl === 'number'
      ? rawRateLimitTtl
      : typeof rawRateLimitTtl === 'string'
        ? Number.parseInt(rawRateLimitTtl, 10)
        : 60;
  if (!Number.isInteger(parsedRateLimitTtl) || parsedRateLimitTtl <= 0) {
    errors.push('RATE_LIMIT_TTL_SECONDS must be a positive integer');
  }

  const rawRateLimit = config.RATE_LIMIT_LIMIT;
  const parsedRateLimit =
    typeof rawRateLimit === 'number'
      ? rawRateLimit
      : typeof rawRateLimit === 'string'
        ? Number.parseInt(rawRateLimit, 10)
        : 100;
  if (!Number.isInteger(parsedRateLimit) || parsedRateLimit <= 0) {
    errors.push('RATE_LIMIT_LIMIT must be a positive integer');
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

  const authUsername = toNonEmptyString(config.AUTH_USERNAME) ?? 'admin';
  const authPassword = toNonEmptyString(config.AUTH_PASSWORD) ?? 'admin123!';
  const authJwtSecret =
    toNonEmptyString(config.AUTH_JWT_SECRET) ??
    'development-only-secret-change-in-production';
  const authJwtIssuer =
    toNonEmptyString(config.AUTH_JWT_ISSUER) ?? 'warehouse-api';
  const authJwtAudience =
    toNonEmptyString(config.AUTH_JWT_AUDIENCE) ?? 'warehouse-clients';

  const rawJwtExpiresIn = config.AUTH_JWT_EXPIRES_IN_SECONDS;
  const parsedJwtExpiresIn =
    typeof rawJwtExpiresIn === 'number'
      ? rawJwtExpiresIn
      : typeof rawJwtExpiresIn === 'string'
        ? Number.parseInt(rawJwtExpiresIn, 10)
        : 900;
  if (!Number.isInteger(parsedJwtExpiresIn) || parsedJwtExpiresIn <= 0) {
    errors.push('AUTH_JWT_EXPIRES_IN_SECONDS must be a positive integer');
  }

  if (nodeEnv === 'production') {
    if (authJwtSecret.length < 32) {
      errors.push(
        'AUTH_JWT_SECRET must have at least 32 characters in production',
      );
    }

    if (authUsername === 'admin' || authPassword === 'admin123!') {
      errors.push(
        'AUTH_USERNAME and AUTH_PASSWORD defaults are not allowed in production',
      );
    }
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
    RATE_LIMIT_TTL_SECONDS:
      Number.isInteger(parsedRateLimitTtl) && parsedRateLimitTtl > 0
        ? parsedRateLimitTtl
        : 60,
    RATE_LIMIT_LIMIT:
      Number.isInteger(parsedRateLimit) && parsedRateLimit > 0
        ? parsedRateLimit
        : 100,
    AUTH_USERNAME: authUsername,
    AUTH_PASSWORD: authPassword,
    AUTH_JWT_SECRET: authJwtSecret,
    AUTH_JWT_EXPIRES_IN_SECONDS:
      Number.isInteger(parsedJwtExpiresIn) && parsedJwtExpiresIn > 0
        ? parsedJwtExpiresIn
        : 900,
    AUTH_JWT_ISSUER: authJwtIssuer,
    AUTH_JWT_AUDIENCE: authJwtAudience,
  } as ValidatedEnvironment;
}
