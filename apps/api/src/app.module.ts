import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { SupabaseService } from './integrations/supabase/supabase.service';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';

@Module({
  imports: [],
  controllers: [AppController, HealthController, ProductsController],
  providers: [AppService, HealthService, ProductsService, SupabaseService],
})
export class AppModule {}
