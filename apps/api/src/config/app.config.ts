import { registerAs } from '@nestjs/config';

export type AppEnvironment = 'development' | 'production' | 'test';

export interface AppConfig {
  name: string;
  version: string;
  environment: AppEnvironment;
  port: number;
}

function parsePort(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '3000', 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 3000;
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
  }),
);
