import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import supabaseConfig, {
  type SupabaseConfig,
} from '../../config/supabase.config';

type ResolvedSupabaseConfig = Omit<SupabaseConfig, 'url' | 'apiKey'> & {
  url: string;
  apiKey: string;
};

@Injectable()
export class SupabaseService {
  private client: SupabaseClient | null = null;

  constructor(
    @Inject(supabaseConfig.KEY)
    private readonly config: ConfigType<typeof supabaseConfig>,
  ) {}

  getConfig(): ResolvedSupabaseConfig | null {
    const url = this.config.url;
    const apiKey = this.config.apiKey;

    if (!url || !apiKey) {
      return null;
    }

    return {
      url,
      apiKey,
      productsTable: this.config.productsTable,
      usersTable: this.config.usersTable,
    };
  }

  isConfigured(): boolean {
    return this.getConfig() !== null;
  }

  getProductsTable(): string {
    return this.getConfig()?.productsTable ?? 'products';
  }

  getUsersTable(): string {
    return this.getConfig()?.usersTable ?? 'users';
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
}
