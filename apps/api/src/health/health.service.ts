import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../integrations/supabase/supabase.service';

@Injectable()
export class HealthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  getHealth() {
    return {
      status: 'ok',
      service: 'warehouse-api',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
      integrations: {
        supabase: {
          configured: this.supabaseService.isConfigured(),
          productsTable: this.supabaseService.getProductsTable(),
        },
      },
    };
  }
}
