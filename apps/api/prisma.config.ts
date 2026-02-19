import { defineConfig } from 'prisma/config';

const DEFAULT_DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/postgres?schema=public';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Prisma commands (e.g. generate) must work in CI/test even when DATABASE_URL is not set.
    url: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
  },
});
