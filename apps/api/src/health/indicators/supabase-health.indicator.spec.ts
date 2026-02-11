import { HealthIndicatorService } from '@nestjs/terminus';
import { SupabaseService } from '../../integrations/supabase/supabase.service';
import { SupabaseHealthIndicator } from './supabase-health.indicator';

describe('SupabaseHealthIndicator', () => {
  function createIndicator(
    supabaseService: SupabaseService,
  ): SupabaseHealthIndicator {
    return new SupabaseHealthIndicator(
      supabaseService,
      new HealthIndicatorService(),
    );
  }

  it('reports down when supabase is not configured', async () => {
    const supabaseService = {
      isConfigured: () => false,
      getClient: () => null,
      getProductsTable: () => 'products',
    } as SupabaseService;
    const indicator = createIndicator(supabaseService);

    const result = await indicator.isHealthy('supabase', { checkRead: true });

    expect(result.supabase.status).toBe('down');
    expect(result.supabase.configured).toBe(false);
  });

  it('reports up when configured and read check is not requested', async () => {
    const supabaseService = {
      isConfigured: () => true,
      getClient: () => null,
      getProductsTable: () => 'products',
    } as SupabaseService;
    const indicator = createIndicator(supabaseService);

    const result = await indicator.isHealthy('supabase');

    expect(result.supabase.status).toBe('up');
    expect(result.supabase.configured).toBe(true);
  });
});
