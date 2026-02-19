import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  url: string | null;
  schema: string;
}

export default registerAs(
  'database',
  (): DatabaseConfig => ({
    url: process.env.DATABASE_URL ?? null,
    schema: process.env.DATABASE_SCHEMA ?? 'public',
  }),
);
