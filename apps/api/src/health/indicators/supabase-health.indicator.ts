import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorService,
  type HealthIndicatorResult,
} from '@nestjs/terminus';
import { SupabaseService } from '../../integrations/supabase/supabase.service';

@Injectable()
export class SupabaseHealthIndicator {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(
    key: string,
    options?: { checkRead?: boolean },
  ): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);

    if (!this.supabaseService.isConfigured()) {
      return indicator.down({ configured: false });
    }

    if (options?.checkRead !== true) {
      return indicator.up({ configured: true });
    }

    const client = this.supabaseService.getClient();

    if (!client) {
      return indicator.down({ configured: false });
    }

    const table = this.supabaseService.getProductsTable();
    const { error } = await client.from(table).select('id').limit(1);

    if (error) {
      return indicator.down({ configured: true, reachable: false });
    }

    return indicator.up({ configured: true, reachable: true });
  }
}
