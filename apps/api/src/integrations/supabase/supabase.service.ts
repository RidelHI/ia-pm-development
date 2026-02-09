import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  productsTable: string;
}

@Injectable()
export class SupabaseService {
  private client: SupabaseClient | null = null;

  getConfig(): SupabaseConfig | null {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return null;
    }

    return {
      url,
      anonKey,
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
      this.client = createClient(config.url, config.anonKey);
    }

    return this.client;
  }
}
