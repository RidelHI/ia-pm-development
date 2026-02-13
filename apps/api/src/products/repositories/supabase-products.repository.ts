import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../integrations/supabase/supabase.service';
import type {
  PaginatedResult,
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

interface QueryResultWithCount<T> extends QueryResult<T> {
  count: number | null;
}

type OptionalSchemaColumn =
  | 'barcode'
  | 'category'
  | 'brand'
  | 'minimumStock'
  | 'imageUrl'
  | 'notes';

const OPTIONAL_SCHEMA_COLUMNS = new Set<OptionalSchemaColumn>([
  'barcode',
  'category',
  'brand',
  'minimumStock',
  'imageUrl',
  'notes',
]);

@Injectable()
export class SupabaseProductsRepository implements ProductsRepository {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 20;
  private static readonly MAX_LIMIT = 100;
  private readonly logger = new Logger(SupabaseProductsRepository.name);
  private readonly unsupportedOptionalColumns = new Set<OptionalSchemaColumn>();

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(filters: ProductFilters): Promise<PaginatedResult<Product>> {
    const client = this.clientOrThrow();
    const table = this.supabaseService.getProductsTable();
    const { page, limit, from, to } = this.resolvePagination(
      filters.page,
      filters.limit,
    );

    while (true) {
      const query = this.buildFindAllQuery(client, table, filters, from, to);
      const result = (await query) as QueryResultWithCount<Product[]>;

      if (result.error) {
        if (this.markMissingOptionalColumn(result.error.message, 'findAll')) {
          continue;
        }

        this.logger.error(
          'Supabase query failed',
          JSON.stringify({ message: result.error.message }),
        );
        throw new ServiceUnavailableException(
          'Product storage is temporarily unavailable',
        );
      }

      const data = result.data ?? [];
      const total = result.count ?? data.length;
      const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

      return {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    }
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
    const payload = this.sanitizeMutationPayload(product);

    const data = await this.executeMutationWithFallback<Product>(
      (currentPayload) =>
        client.from(table).insert(currentPayload).select('*').single(),
      payload,
      'insert',
    );

    if (!data) {
      throw new ServiceUnavailableException('Supabase insert returned no data');
    }

    return data;
  }

  async update(id: string, patch: UpdateProductInput): Promise<Product | null> {
    const client = this.clientOrThrow();
    const table = this.supabaseService.getProductsTable();
    const payload = this.sanitizeMutationPayload({
      ...patch,
      updatedAt: new Date().toISOString(),
    });

    return this.executeMutationWithFallback<Product>(
      (currentPayload) =>
        client
          .from(table)
          .update(currentPayload)
          .eq('id', id)
          .select('*')
          .maybeSingle(),
      payload,
      'update',
    );
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
    return value
      .replaceAll('\\', '\\\\')
      .replaceAll('%', '\\%')
      .replaceAll('_', '\\_')
      .replaceAll(',', '\\,')
      .replaceAll('(', '\\(')
      .replaceAll(')', '\\)')
      .replaceAll('"', '\\"');
  }

  private resolvePagination(
    pageCandidate: number | undefined,
    limitCandidate: number | undefined,
  ): { page: number; limit: number; from: number; to: number } {
    const page =
      typeof pageCandidate === 'number' &&
      Number.isInteger(pageCandidate) &&
      pageCandidate > 0
        ? pageCandidate
        : SupabaseProductsRepository.DEFAULT_PAGE;
    const rawLimit =
      typeof limitCandidate === 'number' &&
      Number.isInteger(limitCandidate) &&
      limitCandidate > 0
        ? limitCandidate
        : SupabaseProductsRepository.DEFAULT_LIMIT;
    const limit = Math.min(rawLimit, SupabaseProductsRepository.MAX_LIMIT);
    const from = (page - 1) * limit;

    return { page, limit, from, to: from + limit - 1 };
  }

  private buildFindAllQuery(
    client: SupabaseClient,
    table: string,
    filters: ProductFilters,
    from: number,
    to: number,
  ): PromiseLike<unknown> {
    let query = client.from(table).select('*', { count: 'exact' });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.q?.trim()) {
      const q = this.escapeLike(filters.q.trim());
      const expression = this.resolveSearchColumns()
        .map((column) => `${column}.ilike.%${q}%`)
        .join(',');
      query = query.or(expression);
    }

    if (filters.sku?.trim()) {
      const sku = this.escapeLike(filters.sku.trim());
      query = query.ilike('sku', `%${sku}%`);
    }

    if (
      filters.barcode?.trim() &&
      !this.unsupportedOptionalColumns.has('barcode')
    ) {
      const barcode = this.escapeLike(filters.barcode.trim());
      query = query.ilike('barcode', `%${barcode}%`);
    }

    if (filters.name?.trim()) {
      const name = this.escapeLike(filters.name.trim());
      query = query.ilike('name', `%${name}%`);
    }

    if (
      filters.category?.trim() &&
      !this.unsupportedOptionalColumns.has('category')
    ) {
      const category = this.escapeLike(filters.category.trim());
      query = query.ilike('category', `%${category}%`);
    }

    if (
      filters.brand?.trim() &&
      !this.unsupportedOptionalColumns.has('brand')
    ) {
      const brand = this.escapeLike(filters.brand.trim());
      query = query.ilike('brand', `%${brand}%`);
    }

    if (filters.location?.trim()) {
      const location = this.escapeLike(filters.location.trim());
      query = query.ilike('location', `%${location}%`);
    }

    if (filters.quantityMin !== undefined) {
      query = query.gte('quantity', filters.quantityMin);
    }

    if (filters.quantityMax !== undefined) {
      query = query.lte('quantity', filters.quantityMax);
    }

    if (
      filters.minimumStockMin !== undefined &&
      !this.unsupportedOptionalColumns.has('minimumStock')
    ) {
      query = query.gte('minimumStock', filters.minimumStockMin);
    }

    if (
      filters.minimumStockMax !== undefined &&
      !this.unsupportedOptionalColumns.has('minimumStock')
    ) {
      query = query.lte('minimumStock', filters.minimumStockMax);
    }

    if (filters.unitPriceMin !== undefined) {
      query = query.gte('unitPriceCents', filters.unitPriceMin);
    }

    if (filters.unitPriceMax !== undefined) {
      query = query.lte('unitPriceCents', filters.unitPriceMax);
    }

    return query.range(from, to);
  }

  private resolveSearchColumns(): string[] {
    const columns = ['name', 'sku'];

    if (!this.unsupportedOptionalColumns.has('barcode')) {
      columns.push('barcode');
    }

    if (!this.unsupportedOptionalColumns.has('category')) {
      columns.push('category');
    }

    if (!this.unsupportedOptionalColumns.has('brand')) {
      columns.push('brand');
    }

    return columns;
  }

  private markMissingOptionalColumn(
    message: string,
    operation: 'findAll' | 'insert' | 'update',
    payload?: Record<string, unknown>,
  ): boolean {
    const missingColumn = this.getMissingColumnFromError(message);

    if (!missingColumn || !OPTIONAL_SCHEMA_COLUMNS.has(missingColumn)) {
      return false;
    }

    if (payload && missingColumn in payload) {
      delete payload[missingColumn];
    }

    if (this.unsupportedOptionalColumns.has(missingColumn)) {
      return false;
    }

    this.unsupportedOptionalColumns.add(missingColumn);
    this.logger.warn(
      `Supabase schema mismatch detected on ${operation}. Column "${missingColumn}" is missing; falling back without that optional field.`,
    );

    return true;
  }

  private getMissingColumnFromError(
    message: string,
  ): OptionalSchemaColumn | null {
    const match = message.match(
      /column\s+(?:[a-z0-9_"]+\.)?"?([a-zA-Z0-9_]+)"?\s+does not exist/i,
    );
    const candidate = match?.[1];

    if (!candidate) {
      return null;
    }

    return OPTIONAL_SCHEMA_COLUMNS.has(candidate as OptionalSchemaColumn)
      ? (candidate as OptionalSchemaColumn)
      : null;
  }

  private sanitizeMutationPayload<T extends object>(
    payload: T,
  ): Record<string, unknown> {
    const sanitized = { ...(payload as Record<string, unknown>) };

    for (const column of this.unsupportedOptionalColumns) {
      delete sanitized[column];
    }

    return sanitized;
  }

  private async executeMutationWithFallback<T>(
    execute: (payload: Record<string, unknown>) => PromiseLike<unknown>,
    payload: Record<string, unknown>,
    operation: 'insert' | 'update',
  ): Promise<T | null> {
    const mutablePayload = { ...payload };

    while (true) {
      const result = (await execute(mutablePayload)) as QueryResult<T>;

      if (result.error) {
        if (
          this.markMissingOptionalColumn(
            result.error.message,
            operation,
            mutablePayload,
          )
        ) {
          continue;
        }

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
