import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  username: string;
  password: string;
  jwtSecret: string;
  jwtExpiresInSeconds: number;
  jwtIssuer: string;
  jwtAudience: string;
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
  'auth',
  (): AuthConfig => ({
    username: process.env.AUTH_USERNAME ?? 'admin',
    password: process.env.AUTH_PASSWORD ?? 'admin123!',
    jwtSecret:
      process.env.AUTH_JWT_SECRET ??
      'development-only-secret-change-in-production',
    jwtExpiresInSeconds: parsePositiveInteger(
      process.env.AUTH_JWT_EXPIRES_IN_SECONDS,
      900,
    ),
    jwtIssuer: process.env.AUTH_JWT_ISSUER ?? 'warehouse-api',
    jwtAudience: process.env.AUTH_JWT_AUDIENCE ?? 'warehouse-clients',
  }),
);
