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

  getLiveness() {
    return {
      status: 'ok',
      service: this.appConfiguration.name,
      version: this.appConfiguration.version,
      timestamp: new Date().toISOString(),
      environment: this.appConfiguration.environment,
    };
  }

  getReadiness() {
    return {
      status: 'ok',
      service: this.appConfiguration.name,
      version: this.appConfiguration.version,
      timestamp: new Date().toISOString(),
      environment: this.appConfiguration.environment,
      ready: true,
      integrations: {
        supabase: {
          configured: this.supabaseService.isConfigured(),
        },
      },
    };
  }
}
