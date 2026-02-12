import { registerAs } from '@nestjs/config';

export interface SupabaseConfig {
  url: string | null;
  apiKey: string | null;
  productsTable: string;
  usersTable: string;
}

function resolveApiKey(): string | null {
  return (
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    null
  );
}

export default registerAs(
  'supabase',
  (): SupabaseConfig => ({
    url: process.env.SUPABASE_URL ?? null,
    apiKey: resolveApiKey(),
    productsTable: process.env.SUPABASE_PRODUCTS_TABLE ?? 'products',
    usersTable: process.env.SUPABASE_USERS_TABLE ?? 'users',
  }),
);
