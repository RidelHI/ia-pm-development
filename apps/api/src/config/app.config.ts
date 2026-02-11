import { registerAs } from '@nestjs/config';
import { parsePositiveInteger } from './config.utils';

export type AppEnvironment = 'development' | 'production' | 'test';

export interface AppConfig {
  name: string;
  version: string;
  environment: AppEnvironment;
  port: number;
  cors: {
    origins: string[];
    credentials: boolean;
  };
  docs: {
    enabled: boolean;
    path: string;
  };
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

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (['true', '1', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['false', '0', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
}

function parseOrigins(value: string | undefined): string[] {
  if (!value || value.trim().length === 0) {
    return ['*'];
  }

  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return origins.length > 0 ? origins : ['*'];
}

function parseDocsPath(value: string | undefined): string {
  const path = value?.trim();

  if (!path) {
    return 'docs';
  }

  return path.replace(/^\/+/, '');
}

export default registerAs(
  'app',
  (): AppConfig => ({
    name: process.env.APP_NAME ?? 'warehouse-api',
    version: process.env.APP_VERSION ?? '0.1.0',
    environment:
      (process.env.NODE_ENV as AppEnvironment | undefined) ?? 'development',
    port: parsePort(process.env.PORT),
    cors: {
      origins: parseOrigins(process.env.APP_CORS_ORIGINS),
      credentials: parseBoolean(process.env.APP_CORS_CREDENTIALS, false),
    },
    docs: {
      enabled: parseBoolean(
        process.env.APP_DOCS_ENABLED,
        process.env.NODE_ENV !== 'production',
      ),
      path: parseDocsPath(process.env.APP_DOCS_PATH),
    },
    rateLimit: {
      ttlMs:
        parsePositiveInteger(process.env.RATE_LIMIT_TTL_SECONDS, 60) * 1000,
      limit: parsePositiveInteger(process.env.RATE_LIMIT_LIMIT, 100),
    },
  }),
);
