import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../integrations/supabase/supabase.service';
import type {
  Product,
  ProductFilters,
  UpdateProductInput,
} from '../product.types';
import type { ProductsRepository } from './products.repository';

interface QueryError {
  message: string;
}

interface QueryResult<T> {
  data: T | null;
  error: QueryError | null;
}

@Injectable()
export class SupabaseProductsRepository implements ProductsRepository {
  private readonly logger = new Logger(SupabaseProductsRepository.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(filters: ProductFilters): Promise<Product[]> {
    const client = this.clientOrThrow();
    const table = this.supabaseService.getProductsTable();

    let query = client.from(table).select('*');

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.q?.trim()) {
      const q = this.escapeLike(filters.q.trim());
      query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
    }

    const data = await this.runQuery<Product[]>(query, 'query');
    return data ?? [];
  }

  async findById(id: string): Promise<Product | null> {
    const client = this.clientOrThrow();
    const table = this.supabaseService.getProductsTable();

    const query = client.from(table).select('*').eq('id', id);

    return this.runQuery<Product>(query.maybeSingle(), 'query');
  }

  async create(product: Product): Promise<Product> {
    const client = this.clientOrThrow();
    const table = this.supabaseService.getProductsTable();

    const query = client.from(table).insert(product).select('*');

    const data = await this.runQuery<Product>(query.single(), 'insert');

    if (!data) {
      throw new ServiceUnavailableException('Supabase insert returned no data');
    }

    return data;
  }

  async update(id: string, patch: UpdateProductInput): Promise<Product | null> {
    const client = this.clientOrThrow();
    const table = this.supabaseService.getProductsTable();

    const query = client
      .from(table)
      .update({ ...patch, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select('*');

    return this.runQuery<Product>(query.maybeSingle(), 'update');
  }

  async remove(id: string): Promise<boolean> {
    const client = this.clientOrThrow();
    const table = this.supabaseService.getProductsTable();

    const query = client.from(table).delete().eq('id', id).select('id');

    const data = await this.runQuery<{ id: string }>(
      query.maybeSingle(),
      'delete',
    );

    return Boolean(data);
  }

  private clientOrThrow(): SupabaseClient {
    const client = this.supabaseService.getClient();

    if (!client) {
      throw new ServiceUnavailableException(
        'Supabase client is not configured',
      );
    }

    return client;
  }

  private escapeLike(value: string): string {
    return value.replaceAll(',', '\\,');
  }

  private async runQuery<T>(
    query: PromiseLike<unknown>,
    operation: 'query' | 'insert' | 'update' | 'delete',
  ): Promise<T | null> {
    const result = (await query) as QueryResult<T>;

    if (result.error) {
      this.logger.error(
        `Supabase ${operation} failed`,
        JSON.stringify({ message: result.error.message }),
      );
      throw new ServiceUnavailableException(
        'Product storage is temporarily unavailable',
      );
    }

    return result.data;
  }
}
