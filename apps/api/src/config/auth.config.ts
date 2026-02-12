import { registerAs } from '@nestjs/config';
import { parsePositiveInteger } from './config.utils';

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresInSeconds: number;
  jwtIssuer: string;
  jwtAudience: string;
}

export default registerAs(
  'auth',
  (): AuthConfig => ({
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
