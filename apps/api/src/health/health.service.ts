import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import appConfig from '../config/app.config';
import { SupabaseService } from '../integrations/supabase/supabase.service';

@Injectable()
export class HealthService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    private readonly supabaseService: SupabaseService,
  ) {}

  getHealth() {
    return {
      status: 'ok',
      service: this.appConfiguration.name,
      version: this.appConfiguration.version,
      timestamp: new Date().toISOString(),
      environment: this.appConfiguration.environment,
      integrations: {
        supabase: {
          configured: this.supabaseService.isConfigured(),
          productsTable: this.supabaseService.getProductsTable(),
        },
      },
    };
  }
}
