import { SupabaseService } from './supabase.service';

describe('SupabaseService', () => {
  it('is not configured without URL and API key', () => {
    const service = new SupabaseService({
      url: null,
      apiKey: null,
      productsTable: 'products',
      usersTable: 'users',
    });

    expect(service.isConfigured()).toBe(false);
    expect(service.getClient()).toBeNull();
  });

  it('is configured when URL and API key are present', () => {
    const service = new SupabaseService({
      url: 'https://example.supabase.co',
      apiKey: 'secret-key',
      productsTable: 'products',
      usersTable: 'users',
    });

    expect(service.isConfigured()).toBe(true);
    expect(service.getProductsTable()).toBe('products');
    expect(service.getUsersTable()).toBe('users');
  });

  it('uses custom products table when provided', () => {
    const service = new SupabaseService({
      url: 'https://example.supabase.co',
      apiKey: 'secret-key',
      productsTable: 'warehouse_products',
      usersTable: 'warehouse_users',
    });

    expect(service.getProductsTable()).toBe('warehouse_products');
    expect(service.getUsersTable()).toBe('warehouse_users');
  });
});
