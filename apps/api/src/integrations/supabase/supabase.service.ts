import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface SupabaseConfig {
  url: string;
  apiKey: string;
  productsTable: string;
}

@Injectable()
export class SupabaseService {
  private client: SupabaseClient | null = null;

  getConfig(): SupabaseConfig | null {
    const url = process.env.SUPABASE_URL;
    const apiKey = this.resolveApiKey();

    if (!url || !apiKey) {
      return null;
    }

    return {
      url,
      apiKey,
      productsTable: process.env.SUPABASE_PRODUCTS_TABLE ?? 'products',
    };
  }

  isConfigured(): boolean {
    return this.getConfig() !== null;
  }

  getProductsTable(): string {
    return this.getConfig()?.productsTable ?? 'products';
  }

  getClient(): SupabaseClient | null {
    const config = this.getConfig();

    if (!config) {
      return null;
    }

    if (!this.client) {
      this.client = createClient(config.url, config.apiKey);
    }

    return this.client;
  }

  private resolveApiKey(): string | null {
    return (
      process.env.SUPABASE_SECRET_KEY ??
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.SUPABASE_ANON_KEY ??
      null
    );
  }
}
