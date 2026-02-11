import { registerAs } from '@nestjs/config';
import { parsePositiveInteger } from './config.utils';

export interface AuthConfig {
  username: string;
  password: string;
  passwordHash: string | null;
  jwtSecret: string;
  jwtExpiresInSeconds: number;
  jwtIssuer: string;
  jwtAudience: string;
}

export default registerAs(
  'auth',
  (): AuthConfig => ({
    username: process.env.AUTH_USERNAME ?? 'admin',
    password: process.env.AUTH_PASSWORD ?? 'admin123!',
    passwordHash: process.env.AUTH_PASSWORD_HASH ?? null,
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
