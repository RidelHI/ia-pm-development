import { registerAs } from '@nestjs/config';

export type AppEnvironment = 'development' | 'production' | 'test';

export interface AppConfig {
  name: string;
  version: string;
  environment: AppEnvironment;
  port: number;
  rateLimit: {
    ttlMs: number;
    limit: number;
  };
}

function parsePort(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '3000', 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 3000;
  }

  return parsed;
}

function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number.parseInt(value ?? String(fallback), 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export default registerAs(
  'app',
  (): AppConfig => ({
    name: process.env.APP_NAME ?? 'warehouse-api',
    version: process.env.APP_VERSION ?? '0.1.0',
    environment:
      (process.env.NODE_ENV as AppEnvironment | undefined) ?? 'development',
    port: parsePort(process.env.PORT),
    rateLimit: {
      ttlMs:
        parsePositiveInteger(process.env.RATE_LIMIT_TTL_SECONDS, 60) * 1000,
      limit: parsePositiveInteger(process.env.RATE_LIMIT_LIMIT, 100),
    },
  }),
);
